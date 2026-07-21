import { QuestionCandidate } from './importV2.candidateBuilder.js';

export interface GeminiDetectedQuestion {
  questionNumber: number;
  type: 'single_choice' | 'true_false' | 'short_answer' | 'essay';
  section: 'PART_I' | 'PART_II' | 'PART_III' | 'ESSAY' | 'GENERAL';
  questionBlocks: string[];
  imageBlocks?: string[];
  formulaBlocks?: string[];
  optionA?: string[];
  optionB?: string[];
  optionC?: string[];
  optionD?: string[];
}

export class QuestionDetectorService {
  /**
   * Receives pre-grouped QuestionCandidates and uses Gemini AI strictly for CLASSIFICATION.
   * Gemini DOES NOT perform segmentation - boundaries are already determined.
   */
  static async classifyCandidates(candidates: QuestionCandidate[]): Promise<GeminiDetectedQuestion[]> {
    console.log(`[GeminiClassifier] 🚀 Classifying ${candidates.length} pre-built QuestionCandidates...`);

    const batchSize = 5;
    const candidateBatches: QuestionCandidate[][] = [];
    for (let i = 0; i < candidates.length; i += batchSize) {
      candidateBatches.push(candidates.slice(i, i + batchSize));
    }

    // Process candidate batches in parallel using Promise.all
    const batchPromises = candidateBatches.map(batch => this.processCandidateBatchWithRetry(batch));
    const resultsPerBatch = await Promise.all(batchPromises);

    const allDetectedQuestions: GeminiDetectedQuestion[] = [];
    resultsPerBatch.forEach(list => allDetectedQuestions.push(...list));

    allDetectedQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    return allDetectedQuestions;
  }

  // Alias for backward compatibility
  static async detectQuestions(segments: any[]): Promise<GeminiDetectedQuestion[]> {
    console.warn(`[GeminiClassifier] Deprecated detectQuestions called. Use classifyCandidates with QuestionCandidateBuilder instead.`);
    return [];
  }

  /**
   * Worker function processing a candidate batch with independent retry.
   */
  private static async processCandidateBatchWithRetry(batch: QuestionCandidate[], retries = 2): Promise<GeminiDetectedQuestion[]> {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await this.processCandidateBatch(batch);
      } catch (err: any) {
        console.warn(`[GeminiClassifier] Batch attempt ${attempt} failed: ${err.message}`);
        if (attempt > retries) {
          console.error(`[GeminiClassifier] ❌ Candidate Batch failed after ${retries + 1} attempts. Falling back to local candidate mapping.`);
          return this.generateFallbackMappingFromCandidates(batch);
        }
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
    return this.generateFallbackMappingFromCandidates(batch);
  }

  /**
   * Sends a batch of QuestionCandidate objects to Gemini 2.5 Flash for classification only.
   */
  private static async processCandidateBatch(batch: QuestionCandidate[]): Promise<GeminiDetectedQuestion[]> {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn(`[GeminiClassifier] GEMINI_API_KEY missing. Generating local classification for candidate batch...`);
      return this.generateFallbackMappingFromCandidates(batch);
    }

    const candidatePromptPayload = batch.map(c => ({
      candidateId: c.id,
      candidateNumber: c.candidateNumber,
      section: c.section,
      previewText: c.previewText,
      blocks: c.blocks.map(b => ({
        id: b.id,
        type: b.type,
        content: b.content,
        image: b.image
      }))
    }));

    const prompt = `
SYSTEM DIRECTIVE:
You are an expert exam question classifier.
Each object in the input array ALREADY represents ONE complete candidate exam question.

CRITICAL INSTRUCTIONS:
1. Do NOT perform segmentation. Ranh giới câu hỏi đã được xác định trước.
2. Only CLASSIFY the question type: "single_choice", "true_false", "short_answer", or "essay".
3. Identify option block IDs (optionA, optionB, optionC, optionD) from the blocks list of each candidate.
4. Do NOT rewrite text or change block IDs. Return a JSON array matching the schema below.

INPUT QUESTION CANDIDATES:
${JSON.stringify(candidatePromptPayload, null, 2)}

EXPECTED JSON OUTPUT SCHEMA:
[
  {
    "questionNumber": 1,
    "type": "single_choice",
    "section": "PART_I",
    "questionBlocks": ["id1", "id2"],
    "imageBlocks": ["id3"],
    "formulaBlocks": [],
    "optionA": ["id4"],
    "optionB": ["id5"],
    "optionC": ["id6"],
    "optionD": ["id7"]
  }
]
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`Gemini API returned ${resp.status}: ${errText}`);
    }

    const data = (await resp.json()) as any;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        return parsed as GeminiDetectedQuestion[];
      }
      return this.generateFallbackMappingFromCandidates(batch);
    } catch (e: any) {
      console.warn(`[GeminiClassifier] Failed to parse JSON response: ${e.message}`);
      return this.generateFallbackMappingFromCandidates(batch);
    }
  }

  /**
   * Fallback classification logic directly from candidates.
   */
  private static generateFallbackMappingFromCandidates(batch: QuestionCandidate[]): GeminiDetectedQuestion[] {
    return batch.map(c => {
      const qBlocks = c.blockIds.slice(0, Math.min(2, c.blockIds.length));
      const optBlocks = c.blockIds.slice(Math.min(2, c.blockIds.length));

      const optionA = optBlocks[0] ? [optBlocks[0]] : [];
      const optionB = optBlocks[1] ? [optBlocks[1]] : [];
      const optionC = optBlocks[2] ? [optBlocks[2]] : [];
      const optionD = optBlocks[3] ? [optBlocks[3]] : [];

      return {
        questionNumber: c.candidateNumber,
        type: 'single_choice',
        section: (c.section as any) || 'PART_I',
        questionBlocks: qBlocks,
        imageBlocks: c.previewImages.length > 0 ? [c.previewImages[0]] : [],
        formulaBlocks: c.previewFormulas.length > 0 ? [c.previewFormulas[0]] : [],
        optionA,
        optionB,
        optionC,
        optionD
      };
    });
  }
}

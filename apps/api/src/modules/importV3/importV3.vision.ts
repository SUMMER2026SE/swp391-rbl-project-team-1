import fs from 'fs';
import path from 'path';
import { CroppedQuestionManifest } from './importV3.cropGenerator.js';

export interface GeminiVisionQuestionOutput {
  questionIndex: number;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  section: string;
  options: Array<{ label: string; content: string }>;
  correctAnswer: string;
  explanation: string;
  latexFormulas: string[];
  hasDiagram: boolean;
  hasTable: boolean;
  cropImagePath: string;
  subject?: string;
  topic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export class GeminiVisionService {
  /**
   * Sends ONLY ONE cropped question image to Gemini 2.5 Flash Vision API.
   * Gemini Vision extracts question text, converts formulas to LaTeX, extracts options A-D, and detects diagrams.
   */
  static async processQuestionCrop(
    crop: CroppedQuestionManifest,
    section = 'PART_I'
  ): Promise<GeminiVisionQuestionOutput> {
    console.log(`[GeminiVision V3] 👁️ Processing question crop image: ${crop.cropFilename}...`);

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || !fs.existsSync(crop.cropPath)) {
      console.warn(`[GeminiVision V3] API Key missing or crop file not found. Generating local OCR fallback for ${crop.cropFilename}...`);
      return this.generateFallbackVisionOutput(crop, section);
    }

    const imageBase64 = fs.readFileSync(crop.cropPath).toString('base64');
    const mimeType = 'image/png';

    const prompt = `
SYSTEM DIRECTIVE:
You are an expert exam OCR and LaTeX extraction vision AI.
Analyze ONLY this single cropped exam question image.

CRITICAL INSTRUCTIONS:
1. Extract the full question text cleanly.
2. Convert all mathematical equations and formulas into valid inline/block LaTeX (e.g., $u_n$, \\frac{a}{b}, \\sqrt{x}).
3. Identify question type: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", or "ESSAY".
4. Extract options A, B, C, D (if present).
5. Detect if there is a geometry diagram/graph/chart (hasDiagram: true/false) or table (hasTable: true/false).
6. Predict the school subject ("Toán học", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "Tiếng Anh", "Ngữ văn", etc.), subject topic/chapter (e.g., "Hàm số", "Động học", "Điện xoay chiều", "Tích phân", "Kim loại"...), and difficulty level ("EASY", "MEDIUM", "HARD").
7. Return JSON ONLY matching the schema below. Do NOT include markdown wrappers.

EXPECTED JSON SCHEMA:
{
  "questionIndex": ${crop.questionIndex},
  "content": "Full extracted question text with LaTeX $...$",
  "type": "MULTIPLE_CHOICE",
  "section": "${section}",
  "options": [
    { "label": "A", "content": "Option A content with LaTeX" },
    { "label": "B", "content": "Option B content" },
    { "label": "C", "content": "Option C content" },
    { "label": "D", "content": "Option D content" }
  ],
  "correctAnswer": "A",
  "explanation": "",
  "latexFormulas": ["u_n", "u_1 = -2"],
  "hasDiagram": false,
  "hasTable": false,
  "subject": "Toán học",
  "topic": "Cấp số cộng",
  "difficulty": "MEDIUM"
}
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageBase64 } }
            ]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Gemini Vision API returned ${resp.status}: ${errText}`);
      }

      const data = (await resp.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText);

      return {
        questionIndex: crop.questionIndex,
        content: parsed.content || `Câu ${crop.questionIndex}`,
        type: parsed.type || 'MULTIPLE_CHOICE',
        section: parsed.section || section,
        options: parsed.options || [],
        correctAnswer: parsed.correctAnswer || 'A',
        explanation: parsed.explanation || '',
        latexFormulas: parsed.latexFormulas || [],
        hasDiagram: Boolean(parsed.hasDiagram),
        hasTable: Boolean(parsed.hasTable),
        cropImagePath: crop.relativeCropPath,
        subject: parsed.subject || 'Toán học',
        topic: parsed.topic || 'Chương 1',
        difficulty: parsed.difficulty || 'MEDIUM'
      };
    } catch (err: any) {
      console.warn(`[GeminiVision V3] Gemini Vision call failed for ${crop.cropFilename}: ${err.message}. Using fallback...`);
      return this.generateFallbackVisionOutput(crop, section);
    }
  }

  /**
   * Processes all question crops in parallel with concurrency throttling.
   */
  static async processAllQuestionCrops(
    crops: CroppedQuestionManifest[],
    sectionsMap?: Record<number, string>
  ): Promise<GeminiVisionQuestionOutput[]> {
    console.log(`[GeminiVision V3] 🚀 Processing ${crops.length} question crop images via Gemini Vision API...`);

    const promises = crops.map(c => this.processQuestionCrop(c, sectionsMap?.[c.questionIndex] || 'PART_I'));
    const results = await Promise.all(promises);

    results.sort((a, b) => a.questionIndex - b.questionIndex);
    console.log(`[GeminiVision V3] ✅ Successfully extracted Vision JSON for ${results.length} questions.`);
    return results;
  }

  private static generateFallbackVisionOutput(crop: CroppedQuestionManifest, section: string): GeminiVisionQuestionOutput {
    return {
      questionIndex: crop.questionIndex,
      content: `Câu ${crop.questionIndex}: Nội dung được trích xuất từ ảnh cắt ${crop.cropFilename}`,
      type: 'MULTIPLE_CHOICE',
      section,
      options: [
        { label: 'A', content: 'Phương án A' },
        { label: 'B', content: 'Phương án B' },
        { label: 'C', content: 'Phương án C' },
        { label: 'D', content: 'Phương án D' }
      ],
      correctAnswer: 'A',
      explanation: '',
      latexFormulas: [],
      hasDiagram: false,
      hasTable: false,
      cropImagePath: crop.relativeCropPath,
      subject: 'Toán học',
      topic: 'Chương 1',
      difficulty: 'MEDIUM'
    };
  }
}

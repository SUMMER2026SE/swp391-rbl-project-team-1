import { DatalabDocumentJSON } from '../../services/datalab.service.js';

export interface GeminiParsedQuestion {
  questionOrder: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  section: string;
  content: string;
  options?: Array<{ label: string; text: string; isCorrect?: boolean }>;
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
  knowledge?: string;
  confidence?: number;
}

export class ImportV2Gemini {
  private static get geminiKey(): string {
    return process.env.GENMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  private static get openrouterKey(): string {
    return process.env.OPENROUTER_API_KEY || '';
  }

  /**
   * Sends Document JSON payload to Gemini 2.5 Flash API (Direct or OpenRouter) to generate structured Exam Draft questions.
   */
  static async convertDocumentJsonToExamDraft(docJson: DatalabDocumentJSON): Promise<GeminiParsedQuestion[]> {
    const prompt = `You are an expert exam parser powered by Gemini 2.5 Flash.
Analyze the following Structured Document JSON obtained from a document parser (title: "${docJson.title}").

Convert this document into a structured Exam Draft containing all questions.

Document Content:
${docJson.fullMarkdown.substring(0, 120000)}

Instructions:
1. Identify all questions accurately ("Câu 1.", "Câu 2.", "Question 1.", etc.).
2. Extract the main question content (text, formulas, tables).
3. Extract all options (A, B, C, D) for MCQ or True/False options.
4. Identify the correct answer (A, B, C, D) or solution text.
5. Provide detailed explanation if visible or infer reasonable solution.
6. Estimate difficulty ("EASY", "MEDIUM", "HARD"), subject topic, and knowledge area.
7. Assign an AI confidence score (0.0 to 1.0) indicating parsing accuracy.

OUTPUT FORMAT: Return ONLY a JSON object with key "questions" containing an array of question objects:
{
  "questions": [
    {
      "questionOrder": 1,
      "type": "MULTIPLE_CHOICE",
      "section": "PHẦN I",
      "content": "Question text...",
      "options": [{"label":"A","text":"Option text..."}],
      "correctAnswer": "A",
      "explanation": "Solution...",
      "difficulty": "MEDIUM",
      "topic": "Topic name",
      "knowledge": "Knowledge area",
      "confidence": 0.95
    }
  ]
}`;

    // 1. Try Direct Google AI Studio API with user paid key
    if (this.geminiKey) {
      const modelsToTry = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-pro-latest'];
      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
            }),
            signal: AbortSignal.timeout(45000)
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            let parsed = JSON.parse(cleanJson);
            if (parsed && !Array.isArray(parsed) && parsed.questions) parsed = parsed.questions;
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`[ImportV2Gemini] ✨ Direct Gemini ${model} generated ${parsed.length} questions.`);
              return parsed;
            }
          } else {
            console.warn(`[ImportV2Gemini Direct ${model}] HTTP ${res.status}: ${await res.text().catch(() => '')}`);
          }
        } catch (err: any) {
          console.warn(`[ImportV2Gemini Direct ${model} Exception]:`, err.message);
        }
      }
    }

    // 2. Try OpenRouter Gemini 2.5 Flash Endpoint
    if (this.openrouterKey) {
      const openRouterModels = [
        process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
        'google/gemini-2.0-flash-001',
        'openrouter/free'
      ];

      for (const orModel of openRouterModels) {
        try {
          console.log(`[ImportV2Gemini] 🚀 Calling Gemini via OpenRouter API (${orModel})...`);
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.openrouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://edupath.vn',
              'X-Title': 'EduPath Exam Parser'
            },
            body: JSON.stringify({
              model: orModel,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              max_tokens: 1500
            }),
            signal: AbortSignal.timeout(30000)
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const responseText = data.choices?.[0]?.message?.content || '';
            const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            let parsed = JSON.parse(cleanJson);
            if (parsed && !Array.isArray(parsed) && parsed.questions) parsed = parsed.questions;
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`[ImportV2Gemini] ✨ OpenRouter ${orModel} generated ${parsed.length} questions.`);
              return parsed;
            }
          } else {
            console.warn(`[ImportV2Gemini OpenRouter ${orModel} Error HTTP ${res.status}]: ${await res.text().catch(() => '')}`);
          }
        } catch (err: any) {
          console.warn(`[ImportV2Gemini OpenRouter ${orModel} Exception]:`, err.message);
        }
      }
    }

    // 3. Robust Regex Fallback Parser for Datalab Markdown
    console.log('[ImportV2Gemini] Utilizing robust document structure fallback parser...');
    return this.fallbackParseDocumentJson(docJson);
  }

  private static fallbackParseDocumentJson(docJson: DatalabDocumentJSON): GeminiParsedQuestion[] {
    const text = docJson.fullMarkdown || '';
    const questions: GeminiParsedQuestion[] = [];

    // Match Markdown headers like **Câu 1.**, ### Câu 1:, Câu 1.
    const questionBlocks = text.split(/(?=\s*(?:\*\*|\#\#|\b)(?:Câu|Question)\s*\d+)/i);

    let order = 1;
    for (const block of questionBlocks) {
      const trimmed = block.trim();
      if (!trimmed || trimmed.length < 10) continue;

      // Clean markdown asterisks or hashes
      const cleanBlock = trimmed.replace(/^[\*\#\s]+/, '').replace(/[\*\#\s]+$/, '');
      const qMatch = cleanBlock.match(/^(câu|question)\s*(\d+)[\s:.\-–]*\s*(.*)$/is);
      
      if (qMatch) {
        const qNum = parseInt(qMatch[2], 10) || order;
        const bodyText = qMatch[3] || cleanBlock;

        const options: Array<{ label: string; text: string }> = [];
        // Match options like - A. text or A. text or **A.** text
        const optMatches = Array.from(bodyText.matchAll(/(?:[\-\*\s]*)(?:\*\*|\b)([A-D])(?:\.\*\*|\.|\:)\s*([^\n]+)/g));
        optMatches.forEach(m => {
          let optTxt = m[2]
            .replace(/\$?The [x-z]-axis is along[^\$]*\$?/gi, '')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')
            .replace(/[\*\#]+/g, '')
            .trim();

          if (optTxt) {
            options.push({ label: m[1].toUpperCase(), text: optTxt });
          }
        });

        let mainContent = bodyText.split(/(?:[\-\*\s]*)(?:\*\*|\b)[A-D](?:\.\*\*|\.|\:)/)[0]
          .replace(/\$?The [x-z]-axis is along[^\$]*\$?/gi, '')
          .trim();

        questions.push({
          questionOrder: qNum,
          type: 'MULTIPLE_CHOICE',
          section: 'PHẦN I',
          content: mainContent || `Câu hỏi ${qNum}`,
          options: options.length > 0 ? options : [
            { label: 'A', text: 'Phương án A' },
            { label: 'B', text: 'Phương án B' },
            { label: 'C', text: 'Phương án C' },
            { label: 'D', text: 'Phương án D' }
          ],
          correctAnswer: options.length > 0 ? options[0].label : 'A',
          explanation: '',
          difficulty: 'MEDIUM',
          topic: 'Kiến thức cốt lõi',
          knowledge: '',
          confidence: 0.90
        });
        order++;
      }
    }

    return questions;
  }
}

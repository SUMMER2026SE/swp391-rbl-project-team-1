import fs from 'fs';
import path from 'path';
import { CroppedQuestionManifest } from './importV3.cropGenerator.js';
import { SystemSettingService } from '../../services/systemSetting.service.js';

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

export interface GlobalDocumentAnalysis {
  answerKey: Record<number, string>;
  explanations: Record<number, string>;
  subject: string;
  topic: string;
  defaultDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

function getEffectiveApiKey(): { apiKey: string; isDirectGemini: boolean; model: string } {
  const geminiKey = SystemSettingService.getString('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || '';
  if (geminiKey && geminiKey.trim()) {
    return {
      apiKey: geminiKey.trim(),
      isDirectGemini: true,
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest'
    };
  }

  const openRouterKey = SystemSettingService.getString('OPENROUTER_API_KEY') ||
    process.env.OPENROUTER_API_KEY ||
    (process.env.OPENROUTER_API_KEYS ? process.env.OPENROUTER_API_KEYS.split(',')[0].trim() : '');

  if (openRouterKey && openRouterKey.trim()) {
    return {
      apiKey: openRouterKey.trim(),
      isDirectGemini: false,
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash'
    };
  }

  return { apiKey: '', isDirectGemini: false, model: '' };
}

export function detectSubjectFromText(text: string, fileName = ''): { subject: string; topic: string } {
  const combined = `${fileName} ${text}`.toLowerCase();
  if (combined.includes('vật lý') || combined.includes('vật lí') || combined.includes('môn lý') || combined.includes('lí 12') || combined.includes('lý 12')) {
    return { subject: 'Vật lý', topic: 'Dao động cơ' };
  }
  if (combined.includes('hóa học') || combined.includes('hóa lí') || combined.includes('môn hóa') || combined.includes('hóa 12')) {
    return { subject: 'Hóa học', topic: 'Este & Lipit' };
  }
  if (combined.includes('sinh học') || combined.includes('môn sinh') || combined.includes('sinh 12')) {
    return { subject: 'Sinh học', topic: 'Cơ chế di truyền & Biến dị' };
  }
  if (combined.includes('tiếng anh') || combined.includes('môn anh') || combined.includes('english') || combined.includes('anh 12')) {
    return { subject: 'Tiếng Anh', topic: 'Ngữ pháp & Từ vựng (Grammar & Vocabulary)' };
  }
  if (combined.includes('ngữ văn') || combined.includes('môn văn') || combined.includes('văn học') || combined.includes('văn 12')) {
    return { subject: 'Ngữ văn', topic: 'Nghị luận văn học' };
  }
  if (combined.includes('lịch sử') || combined.includes('môn sử') || combined.includes('sử 12')) {
    return { subject: 'Lịch sử', topic: 'Lịch sử Việt Nam' };
  }
  if (combined.includes('địa lý') || combined.includes('địa lí') || combined.includes('môn địa') || combined.includes('địa 12')) {
    return { subject: 'Địa lý', topic: 'Địa lý tự nhiên' };
  }
  return { subject: 'Toán học', topic: 'Hàm số & Đồ thị' };
}

function safeParseJson(rawText: string): any {
  if (!rawText) return {};
  
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    try {
      // Escape unescaped single backslashes in LaTeX formulas (\frac, \text, \sqrt, \alpha...)
      const sanitized = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
      return JSON.parse(sanitized);
    } catch (secondErr) {
      console.warn('[safeParseJson] Failed to parse AI JSON:', (firstErr as any)?.message);
      throw firstErr;
    }
  }
}

export class GeminiVisionService {
  /**
   * Helper to execute AI JSON requests to either Gemini Direct or OpenRouter API.
   */
  private static async callAiJson(prompt: string, imageBase64?: string): Promise<any> {
    const { apiKey, isDirectGemini, model } = getEffectiveApiKey();
    if (!apiKey) {
      throw new Error('Không tìm thấy AI API Key (GEMINI_API_KEY hoặc OPENROUTER_API_KEY)!');
    }

    if (isDirectGemini) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-flash-latest'}:generateContent?key=${apiKey}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: imageBase64 ? [
              { text: prompt },
              { inlineData: { mimeType: 'image/png', data: imageBase64 } }
            ] : [
              { text: prompt }
            ]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Gemini direct API returned ${resp.status}: ${errText}`);
      }

      const data = (await resp.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return safeParseJson(rawText);
    } else {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const messages = [{
        role: 'user',
        content: imageBase64 ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
        ] : prompt
      }];

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://edupath.vn',
          'X-Title': 'EduPath AI Import V3'
        },
        body: JSON.stringify({
          model: model || 'google/gemini-2.5-flash',
          messages,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`OpenRouter API returned ${resp.status}: ${errText}`);
      }

      const data = (await resp.json()) as any;
      const rawText = data?.choices?.[0]?.message?.content || '';
      return safeParseJson(rawText);
    }
  }

  /**
   * Pre-analyzes the full exam text/document to extract global metadata:
   * 1. Global Answer Key table (Bảng đáp án)
   * 2. Detailed Explanations section (Lời giải chi tiết)
   * 3. School subject, topic, and difficulty
   */
  static async analyzeFullDocument(examDocument: any): Promise<GlobalDocumentAnalysis> {
    console.log('[GeminiVision V3] 🧠 Pre-analyzing full exam document for Answer Key & Detailed Explanations...');

    const fullText = (examDocument?.blocks || [])
      .map((b: any) => b.text || '')
      .filter(Boolean)
      .join('\n');

    const detectedSubject = detectSubjectFromText(fullText, examDocument?.fileName || '');

    const defaultResult: GlobalDocumentAnalysis = {
      answerKey: {},
      explanations: {},
      subject: detectedSubject.subject,
      topic: detectedSubject.topic,
      defaultDifficulty: 'MEDIUM'
    };

    if (!fullText || fullText.length < 30) {
      return defaultResult;
    }

    const truncatedText = fullText.slice(0, 40000); // Limit text payload

    const prompt = `
SYSTEM DIRECTIVE:
You are an expert exam analyzer AI.
Scan the ENTIRE document text below to extract global exam metadata.

CRITICAL INSTRUCTIONS:
1. Scan for a Global Answer Key table (Bảng đáp án / ĐÁP ÁN) in the document. Extract the correct option choice ('A', 'B', 'C', 'D' or short answer) for each question number. Store in "answerKey": { "1": "A", "2": "C", ... }.
2. Scan for a Detailed Solutions/Explanations section (Lời giải chi tiết / HƯỚNG DẪN GIẢI). Extract the detailed explanation text for each question number. Store in "explanations": { "1": "Lời giải chi tiết câu 1...", ... }.
3. Identify the main Subject ("Toán học", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "Tiếng Anh", "Ngữ văn", etc.), Topic/Chapter, and general Difficulty level ("EASY", "MEDIUM", "HARD").
4. Return JSON ONLY matching the schema below. Do NOT include markdown wrappers.

EXPECTED JSON SCHEMA:
{
  "answerKey": { "1": "A", "2": "B", "3": "C" },
  "explanations": { "1": "Lời giải chi tiết...", "2": "Lời giải..." },
  "subject": "${detectedSubject.subject}",
  "topic": "${detectedSubject.topic}",
  "defaultDifficulty": "MEDIUM"
}

DOCUMENT TEXT:
${truncatedText}
`;

    try {
      const parsed = await this.callAiJson(prompt);

      const parsedAnswerKey: Record<number, string> = {};
      if (parsed.answerKey && typeof parsed.answerKey === 'object') {
        Object.entries(parsed.answerKey).forEach(([k, v]) => {
          const num = parseInt(k, 10);
          if (!isNaN(num) && typeof v === 'string') {
            parsedAnswerKey[num] = v.trim().toUpperCase();
          }
        });
      }

      const parsedExplanations: Record<number, string> = {};
      if (parsed.explanations && typeof parsed.explanations === 'object') {
        Object.entries(parsed.explanations).forEach(([k, v]) => {
          const num = parseInt(k, 10);
          if (!isNaN(num) && typeof v === 'string') {
            parsedExplanations[num] = v.trim();
          }
        });
      }

      console.log(`[GeminiVision V3] ✅ Pre-analysis complete: Extracted ${Object.keys(parsedAnswerKey).length} answers, ${Object.keys(parsedExplanations).length} explanations. Subject: ${parsed.subject || detectedSubject.subject}`);

      return {
        answerKey: parsedAnswerKey,
        explanations: parsedExplanations,
        subject: parsed.subject || detectedSubject.subject,
        topic: parsed.topic || detectedSubject.topic,
        defaultDifficulty: parsed.defaultDifficulty || 'MEDIUM'
      };
    } catch (err: any) {
      console.warn(`[GeminiVision V3] Pre-analysis failed or no key: ${err.message}. Using text detection fallback.`);
      return defaultResult;
    }
  }

  /**
   * Sends ONLY ONE cropped question image to Gemini Vision / OpenRouter Vision API.
   */
  static async processQuestionCrop(
    crop: CroppedQuestionManifest,
    section = 'PART_I',
    globalAnalysis?: GlobalDocumentAnalysis
  ): Promise<GeminiVisionQuestionOutput> {
    console.log(`[GeminiVision V3] 👁️ Processing question crop image: ${crop.cropFilename}...`);

    const candidatePaths = [
      crop.cropPath,
      path.resolve(process.cwd(), crop.cropPath),
      path.resolve(process.cwd(), '..', crop.cropPath),
      path.resolve(process.cwd(), '..', '..', crop.cropPath),
      path.resolve(process.cwd(), 'apps', 'api', crop.cropPath)
    ];

    let actualCropPath = '';
    for (const cp of candidatePaths) {
      if (fs.existsSync(cp)) {
        actualCropPath = cp;
        break;
      }
    }

    if (!actualCropPath) {
      console.warn(`[GeminiVision V3] Crop file not found at ${crop.cropPath}. Generating fallback...`);
      return this.generateFallbackVisionOutput(crop, section, globalAnalysis);
    }

    const imageBase64 = fs.readFileSync(actualCropPath).toString('base64');

    const knownAnswer = globalAnalysis?.answerKey?.[crop.questionIndex];
    const knownExplanation = globalAnalysis?.explanations?.[crop.questionIndex];
    const globalSubject = globalAnalysis?.subject;
    const globalTopic = globalAnalysis?.topic;
    const globalDifficulty = globalAnalysis?.defaultDifficulty;

    const inferredType = section === 'PART_II' ? 'TRUE_FALSE' : (section === 'PART_III' ? 'SHORT_ANSWER' : 'MULTIPLE_CHOICE');

    const prompt = `
SYSTEM DIRECTIVE:
You are an expert exam OCR and LaTeX extraction vision AI.
Analyze ONLY this single cropped exam question image.

CRITICAL QUESTION TYPE RULES (OVERRIDE BY IMAGE CONTENT):
1. IF the cropped image visibly contains 4 option choices starting with A., B., C., D. (e.g. "A. -1. B. -5. C. 1. D. -6."), YOU MUST set "type": "MULTIPLE_CHOICE" and extract options A, B, C, D regardless of section context!
2. IF the cropped image visibly contains sub-statements starting with a), b), c), d) (Trắc nghiệm Đúng/Sai), YOU MUST set "type": "TRUE_FALSE"!
3. IF the cropped image asks for a short numerical answer without options A-D or a-d, YOU MUST set "type": "SHORT_ANSWER"!

CRITICAL INSTRUCTIONS BY SECTION & QUESTION TYPE:
- SECTION CONTEXT: "${section}"
- IF section is "PART_I" (or single choice): Set "type": "MULTIPLE_CHOICE". Extract options A, B, C, D into "options": [ { "label": "A", "content": "..." }, { "label": "B", "content": "..." }, { "label": "C", "content": "..." }, { "label": "D", "content": "..." } ]. Set "correctAnswer" to single letter e.g. "A", "B", "C", or "D".
- IF section is "PART_II" (Trắc nghiệm Đúng/Sai): Set "type": "TRUE_FALSE". Extract sub-statements a), b), c), d) into "options": [ { "label": "a", "content": "..." }, { "label": "b", "content": "..." }, { "label": "c", "content": "..." }, { "label": "d", "content": "..." } ]. Set "correctAnswer" to 4 True/False choices separated by commas e.g. "Đ,S,Đ,S" or "Đ,Đ,S,Đ" (where Đ = Đúng, S = Sai).
- IF section is "PART_III" (Câu hỏi trả lời ngắn / điền số): Set "type": "SHORT_ANSWER". Set "options": []. Set "correctAnswer" to the short numeric or text answer e.g. "15", "-2.5", "0.5".
- IF Essay question: Set "type": "ESSAY". Set "options": [].

FORMULAS & DIAGRAMS:
- Convert all mathematical equations and formulas into valid inline LaTeX $...$ or block LaTeX $$...$$.
- Detect if there is a diagram/graph (hasDiagram: true/false) or table (hasTable: true/false).
- Determine Subject ("Toán học", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "Tiếng Anh", "Ngữ văn"), Topic, and Difficulty ("EASY", "MEDIUM", "HARD").
${knownAnswer ? `- PRE-ANALYZED ANSWER KEY: Question ${crop.questionIndex} has answer "${knownAnswer}". Set "correctAnswer": "${knownAnswer}".` : ''}
${knownExplanation ? `- PRE-ANALYZED EXPLANATION: Question ${crop.questionIndex} has explanation: "${knownExplanation}". Set "explanation": "${knownExplanation}".` : ''}

EXPECTED JSON SCHEMA:
{
  "questionIndex": ${crop.questionIndex},
  "content": "Full extracted question text with LaTeX $...$",
  "type": "${inferredType}",
  "section": "${section}",
  "options": [
    ${inferredType === 'SHORT_ANSWER' || inferredType === 'ESSAY' ? '' : (inferredType === 'TRUE_FALSE' ? `
    { "label": "a", "content": "Nội dung ý a" },
    { "label": "b", "content": "Nội dung ý b" },
    { "label": "c", "content": "Nội dung ý c" },
    { "label": "d", "content": "Nội dung ý d" }
    ` : `
    { "label": "A", "content": "Option A content with LaTeX" },
    { "label": "B", "content": "Option B content" },
    { "label": "C", "content": "Option C content" },
    { "label": "D", "content": "Option D content" }
    `)}
  ],
  "correctAnswer": "${knownAnswer || (inferredType === 'TRUE_FALSE' ? 'Đ,Đ,Đ,Đ' : (inferredType === 'SHORT_ANSWER' ? '0' : 'A'))}",
  "explanation": "${knownExplanation || ''}",
  "latexFormulas": [],
  "hasDiagram": false,
  "hasTable": false,
  "subject": "${globalSubject || 'Vật lý'}",
  "topic": "${globalTopic || 'Dao động cơ'}",
  "difficulty": "${globalDifficulty || 'MEDIUM'}"
}
`;

    try {
      const parsed = await this.callAiJson(prompt, imageBase64);

      return {
        questionIndex: crop.questionIndex,
        content: parsed.content || `Câu ${crop.questionIndex}`,
        type: parsed.type || inferredType,
        section: parsed.section || section,
        options: parsed.options || [],
        correctAnswer: knownAnswer || parsed.correctAnswer || (inferredType === 'TRUE_FALSE' ? 'Đ,Đ,Đ,Đ' : (inferredType === 'SHORT_ANSWER' ? '0' : 'A')),
        explanation: knownExplanation || parsed.explanation || '',
        latexFormulas: parsed.latexFormulas || [],
        hasDiagram: Boolean(parsed.hasDiagram),
        hasTable: Boolean(parsed.hasTable),
        cropImagePath: crop.relativeCropPath,
        subject: globalSubject || parsed.subject || 'Vật lý',
        topic: globalTopic || parsed.topic || 'Vật lý THPT',
        difficulty: globalDifficulty || parsed.difficulty || 'MEDIUM'
      };
    } catch (err: any) {
      console.warn(`[GeminiVision V3] Gemini Vision call failed for ${crop.cropFilename}: ${err.message}. Using fallback...`);
      return this.generateFallbackVisionOutput(crop, section, globalAnalysis);
    }
  }

  /**
   * Processes all question crops in parallel.
   */
  static async processAllQuestionCrops(
    crops: CroppedQuestionManifest[],
    sectionsMap?: Record<number, string>,
    globalAnalysis?: GlobalDocumentAnalysis
  ): Promise<GeminiVisionQuestionOutput[]> {
    console.log(`[GeminiVision V3] 🚀 Processing ${crops.length} question crop images via Gemini Vision API...`);

    const promises = crops.map(c => 
      this.processQuestionCrop(
        c, 
        c.section || sectionsMap?.[c.questionIndex] || 'PART_I',
        globalAnalysis
      )
    );
    const results = await Promise.all(promises);

    results.sort((a, b) => a.questionIndex - b.questionIndex);
    console.log(`[GeminiVision V3] ✅ Successfully extracted Vision JSON for ${results.length} questions.`);
    return results;
  }

  private static generateFallbackVisionOutput(
    crop: CroppedQuestionManifest,
    section: string,
    globalAnalysis?: GlobalDocumentAnalysis
  ): GeminiVisionQuestionOutput {
    const knownAnswer = globalAnalysis?.answerKey?.[crop.questionIndex];
    const knownExplanation = globalAnalysis?.explanations?.[crop.questionIndex];

    const textSubject = detectSubjectFromText(crop.cropFilename, crop.cropFilename);
    const resolvedSubject = globalAnalysis?.subject && globalAnalysis.subject !== 'Toán học' 
      ? globalAnalysis.subject 
      : textSubject.subject;
    const resolvedTopic = globalAnalysis?.topic && globalAnalysis.topic !== 'Chuyên đề Toán học THPT' 
      ? globalAnalysis.topic 
      : textSubject.topic;

    let fallbackType = 'MULTIPLE_CHOICE';
    let fallbackOptions = [
      { label: 'A', content: 'Phương án A' },
      { label: 'B', content: 'Phương án B' },
      { label: 'C', content: 'Phương án C' },
      { label: 'D', content: 'Phương án D' }
    ];
    let fallbackAnswer = knownAnswer || 'A';

    if (section === 'PART_II') {
      fallbackType = 'TRUE_FALSE';
      fallbackOptions = [
        { label: 'a', content: 'Mệnh đề a' },
        { label: 'b', content: 'Mệnh đề b' },
        { label: 'c', content: 'Mệnh đề c' },
        { label: 'd', content: 'Mệnh đề d' }
      ];
      fallbackAnswer = knownAnswer || 'Đ,Đ,Đ,Đ';
    } else if (section === 'PART_III') {
      fallbackType = 'SHORT_ANSWER';
      fallbackOptions = [];
      fallbackAnswer = knownAnswer || '0';
    }

    return {
      questionIndex: crop.questionIndex,
      content: `Câu ${crop.questionIndex}`,
      type: fallbackType,
      section,
      options: fallbackOptions,
      correctAnswer: fallbackAnswer,
      explanation: knownExplanation || '',
      latexFormulas: [],
      hasDiagram: false,
      hasTable: false,
      cropImagePath: crop.relativeCropPath,
      subject: resolvedSubject,
      topic: resolvedTopic,
      difficulty: globalAnalysis?.defaultDifficulty || 'MEDIUM'
    };
  }
}

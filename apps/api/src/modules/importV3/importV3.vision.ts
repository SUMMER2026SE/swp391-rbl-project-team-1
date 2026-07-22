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

export function normalizeSubjectAndTopic(
  rawSubject: string,
  rawTopic: string,
  availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
): { subject: string; topic: string } {
  if (!availableSubjects || availableSubjects.length === 0) {
    return { subject: rawSubject || 'Vật lý', topic: rawTopic || 'Dao động cơ' };
  }

  const rawSubLower = (rawSubject || '').toLowerCase().trim();
  const rawTopLower = (rawTopic || '').toLowerCase().trim();

  // 1. Find matching subject
  let matchedSubj = availableSubjects.find(s => s.name.toLowerCase() === rawSubLower);
  if (!matchedSubj && rawSubLower) {
    matchedSubj = availableSubjects.find(s => 
      s.name.toLowerCase().includes(rawSubLower) || rawSubLower.includes(s.name.toLowerCase())
    );
  }
  if (!matchedSubj && rawSubLower) {
    if (rawSubLower.includes('lý') || rawSubLower.includes('lí')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('lý') || s.name.toLowerCase().includes('lí'));
    } else if (rawSubLower.includes('toán')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('toán'));
    } else if (rawSubLower.includes('hóa')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('hóa'));
    } else if (rawSubLower.includes('sinh')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('sinh'));
    } else if (rawSubLower.includes('anh') || rawSubLower.includes('english')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('anh'));
    } else if (rawSubLower.includes('văn')) {
      matchedSubj = availableSubjects.find(s => s.name.toLowerCase().includes('văn'));
    }
  }

  const finalSubject = matchedSubj ? matchedSubj.name : (availableSubjects[0]?.name || rawSubject || 'Vật lý');

  // 2. Find matching topic within chosen subject
  const availableTopics = matchedSubj ? matchedSubj.topics : (availableSubjects[0]?.topics || []);
  let matchedTopic = availableTopics.find(t => t.name.toLowerCase() === rawTopLower);
  if (!matchedTopic && rawTopLower) {
    matchedTopic = availableTopics.find(t => 
      t.name.toLowerCase().includes(rawTopLower) || rawTopLower.includes(t.name.toLowerCase())
    );
  }

  const finalTopic = matchedTopic ? matchedTopic.name : (availableTopics[0]?.name || rawTopic || 'Chủ đề tổng hợp');

  return { subject: finalSubject, topic: finalTopic };
}

export function detectSubjectFromText(
  text: string, 
  fileName = '',
  availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
): { subject: string; topic: string } {
  const combined = `${fileName} ${text}`.toLowerCase();
  let rawSub = 'Toán học';
  let rawTop = 'Hàm số & Đồ thị';

  if (combined.includes('vật lý') || combined.includes('vật lí') || combined.includes('môn lý') || combined.includes('lí 12') || combined.includes('lý 12')) {
    rawSub = 'Vật lý'; rawTop = 'Dao động cơ';
  } else if (combined.includes('hóa học') || combined.includes('hóa lí') || combined.includes('môn hóa') || combined.includes('hóa 12')) {
    rawSub = 'Hóa học'; rawTop = 'Este & Lipit';
  } else if (combined.includes('sinh học') || combined.includes('môn sinh') || combined.includes('sinh 12')) {
    rawSub = 'Sinh học'; rawTop = 'Cơ chế di truyền & Biến dị';
  } else if (combined.includes('tiếng anh') || combined.includes('môn anh') || combined.includes('english') || combined.includes('anh 12')) {
    rawSub = 'Tiếng Anh'; rawTop = 'Ngữ pháp & Từ vựng (Grammar & Vocabulary)';
  } else if (combined.includes('ngữ văn') || combined.includes('môn văn') || combined.includes('văn học') || combined.includes('văn 12')) {
    rawSub = 'Ngữ văn'; rawTop = 'Nghị luận văn học';
  } else if (combined.includes('lịch sử') || combined.includes('môn sử') || combined.includes('sử 12')) {
    rawSub = 'Lịch sử'; rawTop = 'Lịch sử Việt Nam';
  } else if (combined.includes('địa lý') || combined.includes('địa lí') || combined.includes('môn địa') || combined.includes('địa 12')) {
    rawSub = 'Địa lý'; rawTop = 'Địa lý tự nhiên';
  }

  return normalizeSubjectAndTopic(rawSub, rawTop, availableSubjects);
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
  static async analyzeFullDocument(
    examDocument: any,
    availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
  ): Promise<GlobalDocumentAnalysis> {
    console.log('[GeminiVision V3] 🧠 Pre-analyzing full exam document for Answer Key & Detailed Explanations...');

    const fullText = (examDocument?.blocks || [])
      .map((b: any) => b.text || '')
      .filter(Boolean)
      .join('\n');

    const detectedSubject = detectSubjectFromText(fullText, examDocument?.fileName || '', availableSubjects);

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

    let subjectsPromptList = '';
    if (availableSubjects && availableSubjects.length > 0) {
      subjectsPromptList = availableSubjects.map(s => {
        const tNames = (s.topics || []).map(t => `"${t.name}"`).join(', ');
        return `- Subject: "${s.name}" -> Allowed Topics: [${tNames}]`;
      }).join('\n');
    }

    const truncatedText = fullText.slice(0, 40000); // Limit text payload

    const prompt = `
SYSTEM DIRECTIVE:
You are an expert exam analyzer AI.
Scan the ENTIRE document text below to extract global exam metadata.

CRITICAL INSTRUCTIONS:
1. Scan for a Global Answer Key table (Bảng đáp án / ĐÁP ÁN) in the document. Extract the correct option choice ('A', 'B', 'C', 'D' or short answer) for each question number. Store in "answerKey": { "1": "A", "2": "C", ... }.
2. Scan for a Detailed Solutions/Explanations section (Lời giải chi tiết / HƯỚNG DẪN GIẢI). Extract the detailed explanation text for each question number. Store in "explanations": { "1": "Lời giải chi tiết câu 1...", ... }.
3. Identify the main Subject ("subject") and Topic ("topic") strictly from the provided allowed database list below.
${subjectsPromptList ? `
STRICT SUBJECT & TOPIC SELECTION LIST:
You MUST pick the Subject ("subject") and Topic ("topic") ONLY from the following allowed options:
${subjectsPromptList}
` : ''}
4. Determine general Difficulty level ("EASY", "MEDIUM", "HARD").
5. Return JSON ONLY matching the schema below. Do NOT include markdown wrappers.

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

      const normalized = normalizeSubjectAndTopic(
        parsed.subject || detectedSubject.subject,
        parsed.topic || detectedSubject.topic,
        availableSubjects
      );

      console.log(`[GeminiVision V3] ✅ Pre-analysis complete: Extracted ${Object.keys(parsedAnswerKey).length} answers, ${Object.keys(parsedExplanations).length} explanations. Subject: ${normalized.subject}, Topic: ${normalized.topic}`);

      return {
        answerKey: parsedAnswerKey,
        explanations: parsedExplanations,
        subject: normalized.subject,
        topic: normalized.topic,
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
    globalAnalysis?: GlobalDocumentAnalysis,
    availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
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
      return this.generateFallbackVisionOutput(crop, section, globalAnalysis, availableSubjects);
    }

    const imageBase64 = fs.readFileSync(actualCropPath).toString('base64');

    const knownAnswer = globalAnalysis?.answerKey?.[crop.questionIndex];
    const knownExplanation = globalAnalysis?.explanations?.[crop.questionIndex];
    const globalSubject = globalAnalysis?.subject;
    const globalTopic = globalAnalysis?.topic;
    const globalDifficulty = globalAnalysis?.defaultDifficulty;

    const inferredType = section === 'PART_II' ? 'TRUE_FALSE' : (section === 'PART_III' ? 'SHORT_ANSWER' : 'MULTIPLE_CHOICE');

    let subjectsPromptList = '';
    if (availableSubjects && availableSubjects.length > 0) {
      subjectsPromptList = availableSubjects.map(s => {
        const tNames = (s.topics || []).map(t => `"${t.name}"`).join(', ');
        return `- Subject: "${s.name}" -> Allowed Topics: [${tNames}]`;
      }).join('\n');
    }

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

FORMULAS & DIAGRAMS & METADATA:
- Convert all mathematical equations and formulas into valid inline LaTeX $...$ or block LaTeX $$...$$.
- Detect if there is a diagram/graph (hasDiagram: true/false) or table (hasTable: true/false).
- Classify the specific Topic ("topic") and Difficulty ("difficulty") for THIS INDIVIDUAL QUESTION based on its mathematical formulas, text, and concepts:
  * "subject": "${globalSubject || 'Toán học'}"
  * "topic": Must be the single most relevant topic name chosen from the allowed list for subject "${globalSubject || 'Toán học'}" (e.g. "Mũ & Lôgarit", "Nguyên hàm & Tích phân", "Số phức", "Hình học tọa độ Oxyz", "Tổ hợp & Xác suất", etc.).
  * "difficulty": Must be "EASY" (Dễ), "MEDIUM" (Trung bình), or "HARD" (Khó).
${subjectsPromptList ? `ALLOWED LIST:\n${subjectsPromptList}` : ''}
${knownAnswer ? `- PRE-ANALYZED ANSWER KEY: Question ${crop.questionIndex} has answer "${knownAnswer}". Set "correctAnswer": "${knownAnswer}".` : ''}
${knownExplanation ? `- PRE-ANALYZED EXPLANATION: Question ${crop.questionIndex} has explanation: "${knownExplanation}". Set "explanation": "${knownExplanation}".` : ''}

EXPECTED JSON SCHEMA:
{
  "questionIndex": ${crop.questionIndex},
  "content": "Full extracted question text with LaTeX $...$",
  "type": "${inferredType}",
  "section": "${section}",
  "options": [
    ${(inferredType as string) === 'SHORT_ANSWER' || (inferredType as string) === 'ESSAY' ? '' : (inferredType === 'TRUE_FALSE' ? `
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
  "subject": "${globalSubject || 'Toán học'}",
  "topic": "Classified specific topic name from allowed list",
  "difficulty": "EASY, MEDIUM, or HARD"
}
`;

    try {
      const parsed = await this.callAiJson(prompt, imageBase64);

      const normalized = normalizeSubjectAndTopic(
        parsed.subject || globalSubject || 'Toán học',
        parsed.topic || globalTopic || 'Chủ đề tổng hợp',
        availableSubjects
      );

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
        subject: normalized.subject,
        topic: normalized.topic,
        difficulty: parsed.difficulty || globalDifficulty || 'MEDIUM'
      };

    } catch (err: any) {
      console.warn(`[GeminiVision V3] Gemini Vision call failed for ${crop.cropFilename}: ${err.message}. Using fallback...`);
      return this.generateFallbackVisionOutput(crop, section, globalAnalysis, availableSubjects);
    }
  }

  /**
   * Processes all question crops in parallel.
   */
  static async processAllQuestionCrops(
    crops: CroppedQuestionManifest[],
    sectionsMap?: Record<number, string>,
    globalAnalysis?: GlobalDocumentAnalysis,
    availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
  ): Promise<GeminiVisionQuestionOutput[]> {
    console.log(`[GeminiVision V3] 🚀 Processing ${crops.length} question crop images via Gemini Vision API...`);

    const promises = crops.map(c => 
      this.processQuestionCrop(
        c, 
        c.section || sectionsMap?.[c.questionIndex] || 'PART_I',
        globalAnalysis,
        availableSubjects
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
    globalAnalysis?: GlobalDocumentAnalysis,
    availableSubjects?: Array<{ name: string; topics: Array<{ name: string }> }>
  ): GeminiVisionQuestionOutput {
    const knownAnswer = globalAnalysis?.answerKey?.[crop.questionIndex];
    const knownExplanation = globalAnalysis?.explanations?.[crop.questionIndex];

    const textSubject = detectSubjectFromText(crop.cropFilename, crop.cropFilename, availableSubjects);
    const normalized = normalizeSubjectAndTopic(
      globalAnalysis?.subject || textSubject.subject,
      globalAnalysis?.topic || textSubject.topic,
      availableSubjects
    );

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
      type: fallbackType as any,
      section,
      options: fallbackOptions,
      correctAnswer: fallbackAnswer,
      explanation: knownExplanation || '',
      latexFormulas: [],
      hasDiagram: false,
      hasTable: false,
      cropImagePath: crop.relativeCropPath,
      subject: normalized.subject,
      topic: normalized.topic,
      difficulty: globalAnalysis?.defaultDifficulty || 'MEDIUM'
    };
  }
}


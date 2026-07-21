import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma.js';
import { ImportV2Repository } from './importV2.repository.js';
import { MineruService } from '../../services/mineru.service.js';
import { DocumentNormalizer } from './importV2.normalizer.js';
import { ExamSegmenter } from './importV2.segmenter.js';
import { QuestionCandidateBuilder } from './importV2.candidateBuilder.js';
import { QuestionDetectorService } from './importV2.detector.js';

export class ImportV2Service {
  // In-memory cache for full pipeline intermediate artifacts (Debugger 7 Tabs)
  private static artifactsCache = new Map<number, any>();

  static async createSession(userId: number, fileName: string, fileSize: number, filePath?: string) {
    const session = await ImportV2Repository.createSession(userId, fileName, fileSize, filePath);
    
    // Trigger background processing pipeline
    this.runBackgroundPipeline(session.id, filePath || '', fileName, userId);

    return session;
  }

  static async getSessions(userId: number) {
    return ImportV2Repository.getSessionsByUser(userId);
  }

  static async getSessionById(id: number, userId: number) {
    const session = await ImportV2Repository.getSessionById(id);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền truy cập phiên này!');

    const cachedArtifacts = this.artifactsCache.get(id) || {};
    return {
      ...session,
      media: {
        ...(session as any).media,
        pipelineArtifacts: cachedArtifacts
      }
    };
  }

  // Alias for backward compatibility
  static async runBackgroundParser(sessionId: number, filePath: string, fileName: string, userId: number) {
    return this.runBackgroundPipeline(sessionId, filePath, fileName, userId);
  }

  /**
   * New Architecture Pipeline:
   * PDF -> MinerU -> Document Normalizer -> Exam Segmenter -> Question Candidate Builder -> Gemini Classifier -> Question Graph -> Teacher Review Studio
   */
  static async runBackgroundPipeline(sessionId: number, filePath: string, fileName: string, userId: number) {
    const pipelineArtifacts: any = {};

    try {
      await ImportV2Repository.createLog(sessionId, 'INFO', `🚀 Step 1: Uploading & Initializing pipeline for: ${fileName}`);

      // STEP 2: Parse document using MinerU HTTP Service
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 2: Sending document to MinerU Standalone Service (http://localhost:8001/parse)...');
      const startTimeMineru = Date.now();
      const mineruJson = await MineruService.parseDocument(filePath, fileName);
      const mineruTime = Date.now() - startTimeMineru;
      pipelineArtifacts.mineruJson = mineruJson;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 2 Complete: MinerU parsed ${mineruJson.pages?.length || 1} pages in ${mineruTime}ms.`);

      // STEP 3: Normalize document into ExamDocument schema
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 3: Normalizing document structure (Document Normalizer)...');
      const startTimeNorm = Date.now();
      const examDocument = DocumentNormalizer.normalize(mineruJson);
      const normTime = Date.now() - startTimeNorm;
      pipelineArtifacts.examDocument = examDocument;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 3 Complete: Document Normalizer indexed ${examDocument.allBlocks.length} clean blocks in ${normTime}ms.`);

      // STEP 4: Segment document into logical exam parts
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 4: Segmenting exam sections & worker batches (Exam Segmenter)...');
      const startTimeSeg = Date.now();
      const segments = ExamSegmenter.segment(examDocument);
      const segTime = Date.now() - startTimeSeg;
      pipelineArtifacts.segments = segments;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 4 Complete: Exam Segmenter created ${segments.length} sections in ${segTime}ms.`);

      // STEP 4.5 [NEW]: Group blocks into QuestionCandidates BEFORE Gemini AI
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 4.5: Building QuestionCandidates by Reading Order & Regex markers...');
      const startTimeCand = Date.now();
      const candidates = QuestionCandidateBuilder.buildCandidates(examDocument, segments);
      const candTime = Date.now() - startTimeCand;
      pipelineArtifacts.questionCandidates = candidates;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 4.5 Complete: Built & Validated ${candidates.length} QuestionCandidates in ${candTime}ms. Saved scratch/question_candidates.json.`);

      // STEP 5: Gemini AI Question Classification (Classifier Only)
      await ImportV2Repository.createLog(sessionId, 'INFO', `Step 5: Classifying ${candidates.length} QuestionCandidates with Gemini AI...`);
      const startTimeGemini = Date.now();
      const detectedQuestions = await QuestionDetectorService.classifyCandidates(candidates);
      const geminiTime = Date.now() - startTimeGemini;
      pipelineArtifacts.geminiRawResponse = detectedQuestions;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 5 Complete: Gemini AI classified ${detectedQuestions.length} candidates in ${geminiTime}ms.`);

      if (!detectedQuestions || detectedQuestions.length === 0) {
        throw new Error('Gemini AI không phân loại được câu hỏi nào từ danh sách QuestionCandidate.');
      }

      // STEP 6: Assemble Exam Draft questions mapping existing Block IDs
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 6: Building Question Graph mapping Block IDs...');
      const allQuestions: any[] = [];
      for (let k = 0; k < detectedQuestions.length; k++) {
        const dq = detectedQuestions[k];

        // Resolve text content and options from mapped Block IDs
        const qTextBlocks = (dq.questionBlocks || [])
          .map(bId => examDocument.blockMap[bId]?.content)
          .filter(Boolean)
          .join('\n');

        const optA = (dq.optionA || []).map(bId => examDocument.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optB = (dq.optionB || []).map(bId => examDocument.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optC = (dq.optionC || []).map(bId => examDocument.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optD = (dq.optionD || []).map(bId => examDocument.blockMap[bId]?.content).filter(Boolean).join(' ');

        const options = [];
        if (optA) options.push({ label: 'A', content: optA });
        if (optB) options.push({ label: 'B', content: optB });
        if (optC) options.push({ label: 'C', content: optC });
        if (optD) options.push({ label: 'D', content: optD });

        const isUncertain = !qTextBlocks || (options.length === 0 && dq.type === 'single_choice');

        allQuestions.push({
          content: qTextBlocks || `Câu ${dq.questionNumber}`,
          options: options.length > 0 ? options : [],
          correctAnswer: 'A',
          explanation: '',
          difficulty: 'MEDIUM',
          status: isUncertain ? 'NEEDS_TEACHER_REVIEW' : 'OK',
          statusDetails: isUncertain ? 'Uncertain question boundaries - Needs Teacher Verification' : null,
          type: dq.type === 'single_choice' ? 'MULTIPLE_CHOICE' : dq.type.toUpperCase(),
          section: dq.section || 'PHẦN I',
          questionOrder: dq.questionNumber || (k + 1),
          regions: {
            questionBlocks: dq.questionBlocks || [],
            imageBlocks: dq.imageBlocks || [],
            formulaBlocks: dq.formulaBlocks || [],
            optionA: dq.optionA || [],
            optionB: dq.optionB || [],
            optionC: dq.optionC || [],
            optionD: dq.optionD || []
          },
          media: {
            blockMap: examDocument.blockMap
          }
        });
      }

      pipelineArtifacts.questionGraph = allQuestions;
      this.artifactsCache.set(sessionId, pipelineArtifacts);

      const sessionExists = await prisma.importSession.findUnique({ where: { id: sessionId } });
      if (!sessionExists) {
        console.log(`[ImportV2] Session #${sessionId} was deleted. Aborting background save.`);
        return;
      }

      await ImportV2Repository.createImportQuestions(sessionId, allQuestions);
      await ImportV2Repository.updateSession(sessionId, { status: 'REVIEWING' });
      await ImportV2Repository.createLog(sessionId, 'INFO', `Step 7: ✅ Teacher Review Studio initialized successfully!`);
    } catch (err: any) {
      console.error('[ImportV2 Pipeline Error]', err);
      this.artifactsCache.set(sessionId, pipelineArtifacts);
      const exists = await prisma.importSession.findUnique({ where: { id: sessionId } });
      if (exists) {
        await ImportV2Repository.updateSession(sessionId, { status: 'FAILED' });
        await ImportV2Repository.createLog(sessionId, 'ERROR', 'Tiến trình nhập đề thất bại!', err.message);
      }
    }
  }

  /**
   * Re-run a specific stage (normalizer, segmenter, candidates, gemini) using cached artifacts.
   */
  static async rerunStage(sessionId: number, stageName: string) {
    const session = await prisma.importSession.findUnique({ where: { id: sessionId }, include: { questions: true } });
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');

    const artifacts = this.artifactsCache.get(sessionId) || {};
    if (!artifacts.mineruJson) {
      throw new Error('Không tìm thấy dữ liệu MinerU JSON trong cache phiên để chạy lại!');
    }

    await ImportV2Repository.createLog(sessionId, 'INFO', `🔄 Re-running stage: ${stageName}...`);

    if (stageName === 'normalizer') {
      const examDoc = DocumentNormalizer.normalize(artifacts.mineruJson);
      artifacts.examDocument = examDoc;
      this.artifactsCache.set(sessionId, artifacts);
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Re-run Normalizer complete: ${examDoc.allBlocks.length} blocks.`);
    } else if (stageName === 'segmenter') {
      const examDoc = artifacts.examDocument || DocumentNormalizer.normalize(artifacts.mineruJson);
      const segments = ExamSegmenter.segment(examDoc);
      artifacts.segments = segments;
      this.artifactsCache.set(sessionId, artifacts);
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Re-run Segmenter complete: ${segments.length} sections.`);
    } else if (stageName === 'candidates') {
      const examDoc = artifacts.examDocument || DocumentNormalizer.normalize(artifacts.mineruJson);
      const segments = artifacts.segments || ExamSegmenter.segment(examDoc);
      const candidates = QuestionCandidateBuilder.buildCandidates(examDoc, segments);
      artifacts.questionCandidates = candidates;
      this.artifactsCache.set(sessionId, artifacts);
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Re-run QuestionCandidates complete: ${candidates.length} candidates.`);
    } else if (stageName === 'gemini') {
      const examDoc = artifacts.examDocument || DocumentNormalizer.normalize(artifacts.mineruJson);
      const segments = artifacts.segments || ExamSegmenter.segment(examDoc);
      const candidates = artifacts.questionCandidates || QuestionCandidateBuilder.buildCandidates(examDoc, segments);

      const detectedQuestions = await QuestionDetectorService.classifyCandidates(candidates);
      artifacts.geminiRawResponse = detectedQuestions;
      
      // Update session questions
      await prisma.importQuestion.deleteMany({ where: { sessionId } });

      const allQuestions: any[] = [];
      for (let k = 0; k < detectedQuestions.length; k++) {
        const dq = detectedQuestions[k];
        const qTextBlocks = (dq.questionBlocks || []).map(bId => examDoc.blockMap[bId]?.content).filter(Boolean).join('\n');
        const optA = (dq.optionA || []).map(bId => examDoc.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optB = (dq.optionB || []).map(bId => examDoc.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optC = (dq.optionC || []).map(bId => examDoc.blockMap[bId]?.content).filter(Boolean).join(' ');
        const optD = (dq.optionD || []).map(bId => examDoc.blockMap[bId]?.content).filter(Boolean).join(' ');

        const options = [];
        if (optA) options.push({ label: 'A', content: optA });
        if (optB) options.push({ label: 'B', content: optB });
        if (optC) options.push({ label: 'C', content: optC });
        if (optD) options.push({ label: 'D', content: optD });

        allQuestions.push({
          content: qTextBlocks || `Câu ${dq.questionNumber}`,
          options: options.length > 0 ? options : [],
          correctAnswer: 'A',
          explanation: '',
          difficulty: 'MEDIUM',
          status: 'OK',
          type: dq.type === 'single_choice' ? 'MULTIPLE_CHOICE' : dq.type.toUpperCase(),
          section: dq.section || 'PHẦN I',
          questionOrder: dq.questionNumber || (k + 1),
          regions: {
            questionBlocks: dq.questionBlocks || [],
            imageBlocks: dq.imageBlocks || [],
            formulaBlocks: dq.formulaBlocks || [],
            optionA: dq.optionA || [],
            optionB: dq.optionB || [],
            optionC: dq.optionC || [],
            optionD: dq.optionD || []
          },
          media: { blockMap: examDoc.blockMap }
        });
      }

      await ImportV2Repository.createImportQuestions(sessionId, allQuestions);
      artifacts.questionGraph = allQuestions;
      this.artifactsCache.set(sessionId, artifacts);
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Re-run Gemini complete: Re-generated ${allQuestions.length} questions.`);
    }

    return this.getSessionById(sessionId, session.userId);
  }

  static async updateQuestion(sessionId: number, questionId: number, data: any) {
    const q = await prisma.importQuestion.findUnique({ where: { id: questionId } });
    if (!q) throw new Error('NOT_FOUND: Câu hỏi không tồn tại!');

    return prisma.importQuestion.update({
      where: { id: questionId },
      data: {
        content: data.content !== undefined ? data.content : q.content,
        options: data.options !== undefined ? data.options : q.options,
        correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : q.correctAnswer,
        explanation: data.explanation !== undefined ? data.explanation : q.explanation,
        difficulty: data.difficulty !== undefined ? data.difficulty : q.difficulty,
        type: data.type !== undefined ? data.type : q.type,
        section: data.section !== undefined ? data.section : q.section,
        questionOrder: data.questionOrder !== undefined ? data.questionOrder : q.questionOrder,
        status: data.status !== undefined ? data.status : q.status,
        statusDetails: data.statusDetails !== undefined ? data.statusDetails : q.statusDetails,
        media: data.media !== undefined ? data.media : q.media
      }
    });
  }

  static async duplicateQuestion(sessionId: number, questionId: number) {
    const q = await prisma.importQuestion.findUnique({ where: { id: questionId } });
    if (!q) throw new Error('NOT_FOUND: Câu hỏi không tồn tại!');

    const newQuestion = await prisma.importQuestion.create({
      data: {
        sessionId,
        content: `${q.content} (Bản sao)`,
        options: q.options ? JSON.parse(JSON.stringify(q.options)) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        type: q.type,
        section: q.section,
        status: q.status,
        questionOrder: q.questionOrder + 1,
        media: q.media ? JSON.parse(JSON.stringify(q.media)) : undefined
      }
    });

    await this.reorderSessionQuestions(sessionId);
    return newQuestion;
  }

  static async mergeQuestions(sessionId: number, q1Id: number, q2Id: number) {
    const q1 = await prisma.importQuestion.findUnique({ where: { id: q1Id } });
    const q2 = await prisma.importQuestion.findUnique({ where: { id: q2Id } });

    if (!q1 || !q2) throw new Error('NOT_FOUND: Một trong hai câu hỏi gộp không tồn tại!');

    await prisma.importQuestion.update({
      where: { id: q1Id },
      data: {
        content: `${q1.content}\n${q2.content}`
      }
    });

    await prisma.importQuestion.delete({ where: { id: q2Id } });
    await this.reorderSessionQuestions(sessionId);

    return ImportV2Repository.getSessionById(sessionId);
  }

  static async splitQuestion(sessionId: number, questionId: number, splitIndex: number) {
    const q = await prisma.importQuestion.findUnique({ where: { id: questionId } });
    if (!q) throw new Error('NOT_FOUND: Câu hỏi không tồn tại!');

    await prisma.importQuestion.update({
      where: { id: questionId },
      data: { content: `${q.content} (Phần 1)` }
    });

    await prisma.importQuestion.create({
      data: {
        sessionId,
        content: `${q.content} (Phần 2)`,
        options: q.options ? JSON.parse(JSON.stringify(q.options)) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        type: q.type,
        section: q.section,
        status: q.status,
        questionOrder: q.questionOrder + 1
      }
    });

    await this.reorderSessionQuestions(sessionId);
    return ImportV2Repository.getSessionById(sessionId);
  }

  static async reorderSessionQuestions(sessionId: number) {
    const questions = await prisma.importQuestion.findMany({
      where: { sessionId },
      orderBy: { id: 'asc' }
    });

    for (let i = 0; i < questions.length; i++) {
      await prisma.importQuestion.update({
        where: { id: questions[i].id },
        data: { questionOrder: i + 1 }
      });
    }
  }

  static async cleanupSessionFiles(sessionId: number, filePath?: string | null) {
    try {
      const rootDir = path.resolve(process.cwd(), '..', '..');

      // 1. Delete crops directory for session
      const cropDir = path.join(rootDir, 'scratch', 'crops', `session_${sessionId}`);
      if (fs.existsSync(cropDir)) {
        fs.rmSync(cropDir, { recursive: true, force: true });
        console.log(`[FileCleanup] 🗑️ Removed crop directory for session ${sessionId}`);
      }

      // 2. Delete original uploaded file if stored locally
      if (filePath && fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
        console.log(`[FileCleanup] 🗑️ Removed uploaded file: ${filePath}`);
      }
    } catch (err: any) {
      console.warn(`[FileCleanup] Warning cleaning up files for session ${sessionId}:`, err.message);
    }
  }

  static async cleanupOrphanImportFiles() {
    try {
      const activeSessions = await prisma.importSession.findMany({
        select: { id: true }
      });
      const activeIds = new Set(activeSessions.map(s => s.id));

      const rootDir = path.resolve(process.cwd(), '..', '..');
      const cropsParentDir = path.join(rootDir, 'scratch', 'crops');

      if (fs.existsSync(cropsParentDir)) {
        const entries = fs.readdirSync(cropsParentDir, { withFileTypes: true });
        let cleanedCount = 0;
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('session_')) {
            const idStr = entry.name.replace('session_', '');
            const sessionId = parseInt(idStr, 10);
            if (!isNaN(sessionId) && !activeIds.has(sessionId)) {
              const orphanDir = path.join(cropsParentDir, entry.name);
              fs.rmSync(orphanDir, { recursive: true, force: true });
              cleanedCount++;
            }
          }
        }
        if (cleanedCount > 0) {
          console.log(`[FileCleanup] 🧹 Cleaned up ${cleanedCount} orphan session crop folders.`);
        }
      }

      // If no active import sessions remain, also wipe MinerU extracted_images
      if (activeIds.size === 0) {
        const mineruDirs = [
          path.join(rootDir, 'tools', 'mineru', 'extracted_images'),
          path.join(rootDir, 'tools', 'mineru', 'output', 'extracted_images'),
          path.join(rootDir, 'tools', 'mineru', 'output', 'images')
        ];
        for (const dir of mineruDirs) {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              fs.rmSync(path.join(dir, f), { recursive: true, force: true });
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[FileCleanup] Failed running orphan cleanup:', err.message);
    }
  }

  static async deleteSession(id: number, userId: number) {
    const session = await ImportV2Repository.getSessionById(id);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền xóa phiên này!');

    this.artifactsCache.delete(id);
    await this.cleanupSessionFiles(id, session.filePath);

    const result = await ImportV2Repository.deleteSession(id);
    this.cleanupOrphanImportFiles().catch(() => {});
    return result;
  }

  static async confirmImport(sessionId: number, userId: number, decisions: Array<{ importQuestionId: number; action: string }>) {
    const session = await ImportV2Repository.getSessionById(sessionId);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền duyệt phiên này!');

    for (const q of session.questions) {
      const dec = decisions?.find(d => d.importQuestionId === q.id);
      const action = dec ? dec.action : 'CREATE_NEW';

      if (action === 'REUSE') {
        continue;
      }

      const mediaObj = (q.media as any) || {};
      const imageUrl = mediaObj?.imageUrl || '';

      await ImportV2Repository.confirmQuestionInBank(userId, session.fileName, q, imageUrl);
    }

    await ImportV2Repository.updateSession(sessionId, { status: 'COMPLETED' });
    return { success: true };
  }
}

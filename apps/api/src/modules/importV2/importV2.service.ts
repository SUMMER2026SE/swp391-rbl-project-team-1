import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma.js';
import { ImportV2Repository } from './importV2.repository.js';
import { DatalabService } from '../../services/datalab.service.js';
import { ImportV2Gemini } from './importV2.gemini.js';

export class ImportV2Service {
  static async createSession(userId: number, fileName: string, fileSize: number, filePath?: string) {
    const session = await ImportV2Repository.createSession(userId, fileName, fileSize, filePath);
    
    // Trigger background process (async)
    this.runBackgroundParser(session.id, filePath || '', fileName, userId);

    return session;
  }

  static async getSessions(userId: number) {
    return ImportV2Repository.getSessionsByUser(userId);
  }

  static async getSessionById(id: number, userId: number) {
    const session = await ImportV2Repository.getSessionById(id);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền truy cập phiên này!');
    return session;
  }

  /**
   * Main New Import Architecture Workflow:
   * Teacher Upload -> Datalab API -> Document JSON -> Raw Storage -> Gemini 2.5 Flash -> Exam Draft -> Review -> Bank
   */
  static async runBackgroundParser(sessionId: number, filePath: string, fileName: string, userId: number) {
    try {
      await ImportV2Repository.createLog(sessionId, 'INFO', `Khởi động tiến trình xử lý tệp đề thi: ${fileName}`);

      // STEP 1: Parse document using Datalab API Service
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Đang gửi tài liệu cho Datalab Document Intelligence API...');
      const docJson = await DatalabService.parseDocument(filePath, fileName);

      // STEP 2: Store Raw Document JSON for future AI regeneration (Requirement Step 8)
      if (process.env.IMPORT_SAVE_RAW_DOCUMENT !== 'false') {
        try {
          await ImportV2Repository.updateSession(sessionId, {
            filePath: filePath
          });
        } catch (e: any) {
          console.warn('[ImportV2] Failed to save raw document:', e.message);
        }
      }

      // STEP 3: Convert Document JSON to Exam Draft via Gemini 2.5 Flash AI Engine
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Đang chuyển đổi Document JSON sang Bản nháp Đề thi qua Gemini 2.5 Flash AI...');
      const parsedQuestions = await ImportV2Gemini.convertDocumentJsonToExamDraft(docJson);

      if (!parsedQuestions || parsedQuestions.length === 0) {
        throw new Error('Không thể chuyển đổi đề thi. Gemini AI không tìm thấy câu hỏi trong tệp.');
      }

      // STEP 4: Store Exam Draft questions into ImportQuestion table
      const allQuestions: any[] = [];
      for (let k = 0; k < parsedQuestions.length; k++) {
        const pq = parsedQuestions[k];
        allQuestions.push({
          content: pq.content || `Câu hỏi ${pq.questionOrder || (k + 1)}`,
          options: pq.options || [],
          correctAnswer: pq.correctAnswer || (pq.options && pq.options[0] ? pq.options[0].label : 'A'),
          explanation: pq.explanation || '',
          difficulty: pq.difficulty || 'MEDIUM',
          status: 'OK',
          type: pq.type || 'MULTIPLE_CHOICE',
          section: pq.section || 'PHẦN I',
          questionOrder: pq.questionOrder || (k + 1),
          regions: {
            topic: pq.topic || 'Kiến thức cốt lõi',
            knowledge: pq.knowledge || '',
            confidence: pq.confidence || 0.95
          },
          media: {
            confidence: pq.confidence || 0.95
          }
        });
      }

      const sessionExists = await prisma.importSession.findUnique({ where: { id: sessionId } });
      if (!sessionExists) {
        console.log(`[ImportV2] Session #${sessionId} was deleted by user. Aborting background save.`);
        return;
      }

      await ImportV2Repository.createImportQuestions(sessionId, allQuestions);
      await ImportV2Repository.updateSession(sessionId, { status: 'REVIEWING' });
      await ImportV2Repository.createLog(sessionId, 'INFO', `Phân tích hoàn tất! Đã khởi tạo bản nháp ${allQuestions.length} câu hỏi với Gemini 2.5 Flash.`);
    } catch (err: any) {
      console.error('[ImportV2 Background Error]', err);
      const exists = await prisma.importSession.findUnique({ where: { id: sessionId } });
      if (exists) {
        await ImportV2Repository.updateSession(sessionId, { status: 'FAILED' });
        await ImportV2Repository.createLog(sessionId, 'ERROR', 'Tiến trình nhập đề thất bại!', err.message);
      }
    }
  }

  /**
   * Question Operations: Update question fields in draft
   */
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
        regions: data.regions !== undefined ? data.regions : q.regions,
        media: data.media !== undefined ? data.media : q.media
      }
    });
  }

  /**
   * Duplicate a question in draft
   */
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
        questionOrder: q.questionOrder + 1,
        regions: q.regions ? JSON.parse(JSON.stringify(q.regions)) : undefined,
        media: q.media ? JSON.parse(JSON.stringify(q.media)) : undefined
      }
    });

    await this.reorderSessionQuestions(sessionId);
    return newQuestion;
  }

  /**
   * Merge two questions in draft
   */
  static async mergeQuestions(sessionId: number, q1Id: number, q2Id: number) {
    const q1 = await prisma.importQuestion.findUnique({ where: { id: q1Id } });
    const q2 = await prisma.importQuestion.findUnique({ where: { id: q2Id } });

    if (!q1 || !q2) throw new Error('NOT_FOUND: Một trong hai câu hỏi gộp không tồn tại!');

    await prisma.importQuestion.update({
      where: { id: q1Id },
      data: {
        content: `${q1.content}\n${q2.content}`,
        options: q1.options || q2.options || [],
        correctAnswer: q1.correctAnswer || q2.correctAnswer || '',
        explanation: q1.explanation || q2.explanation || ''
      }
    });

    await prisma.importQuestion.delete({ where: { id: q2Id } });
    await this.reorderSessionQuestions(sessionId);

    return ImportV2Repository.getSessionById(sessionId);
  }

  /**
   * Split a question into two draft questions
   */
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
        questionOrder: q.questionOrder + 1,
        regions: q.regions ? JSON.parse(JSON.stringify(q.regions)) : undefined,
        media: q.media ? JSON.parse(JSON.stringify(q.media)) : undefined
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

  static async deleteSession(id: number, userId: number) {
    const session = await ImportV2Repository.getSessionById(id);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền xóa phiên này!');
    return ImportV2Repository.deleteSession(id);
  }

  /**
   * Confirm and save questions into official Question Bank
   */
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

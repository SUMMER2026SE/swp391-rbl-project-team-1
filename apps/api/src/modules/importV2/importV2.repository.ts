import { prisma } from '../../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export class ImportV2Repository {
  static async createSession(userId: number, fileName: string, fileSize: number, filePath?: string) {
    return prisma.importSession.create({
      data: {
        userId,
        fileName,
        fileSize,
        filePath,
        status: 'PROCESSING'
      }
    });
  }

  static async getSessionsByUser(userId: number) {
    return prisma.importSession.findMany({
      where: { userId },
      include: {
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getSessionById(id: number) {
    return prisma.importSession.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { questionOrder: 'asc' } },
        ImportLog: { orderBy: { createdAt: 'asc' } }
      }
    });
  }

  static async updateSession(id: number, data: Partial<Prisma.ImportSessionUpdateInput>) {
    return prisma.importSession.update({
      where: { id },
      data
    });
  }

  static async createLog(sessionId: number, level: 'INFO' | 'WARNING' | 'ERROR', message: string, details?: string) {
    return prisma.importLog.create({
      data: {
        sessionId,
        level,
        message,
        details
      }
    });
  }

  static async createImportQuestions(sessionId: number, questions: any[]) {
    return prisma.importQuestion.createMany({
      data: questions.map((q) => ({
        sessionId,
        content: q.content,
        options: q.options ? (q.options as any) : undefined,
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || null,
        difficulty: q.difficulty || 'MEDIUM',
        status: q.status || 'OK',
        statusDetails: q.statusDetails || null,
        type: q.type || 'MULTIPLE_CHOICE',
        section: q.section || 'PHẦN I',
        questionOrder: q.questionOrder || 1,
        regions: q.regions ? (q.regions as any) : undefined,
        media: q.media ? (q.media as any) : undefined
      }))
    });
  }

  static async getImportQuestionById(id: number) {
    return prisma.importQuestion.findUnique({
      where: { id },
      include: { session: true }
    });
  }

  static async updateImportQuestion(id: number, data: any) {
    return prisma.importQuestion.update({
      where: { id },
      data: {
        content: data.content,
        options: data.options !== undefined ? (data.options as any) : undefined,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        difficulty: data.difficulty,
        type: data.type,
        section: data.section,
        questionOrder: data.questionOrder,
        status: data.status,
        statusDetails: data.statusDetails,
        regions: data.regions !== undefined ? (data.regions as any) : undefined,
        media: data.media !== undefined ? (data.media as any) : undefined
      }
    });
  }

  static async deleteSession(id: number) {
    return prisma.importSession.delete({
      where: { id }
    });
  }

  static async confirmQuestionInBank(
    userId: number,
    sessionName: string,
    questionData: any,
    imageUrl: string
  ) {
    return prisma.$transaction(async (tx) => {
      const cleanTitle = (sessionName || 'Đề thi').replace(/\.(pdf|docx|doc)$/i, '').trim();
      const questionTitle = `Câu ${questionData.questionOrder || 1}. (${cleanTitle})`;
      
      let rawContent = (questionData.content || '').trim();
      rawContent = rawContent.replace(/Câu \d+:\s*Nội dung được trích xuất từ ảnh cắt[^\n]*/gi, '').trim();
      rawContent = rawContent.replace(/Nội dung được trích xuất từ ảnh cắt[^\n]*/gi, '').trim();

      let finalContent = rawContent;
      if (!rawContent || rawContent === `Câu ${questionData.questionOrder || 1}`) {
        finalContent = questionTitle;
      } else if (!rawContent.startsWith(questionTitle)) {
        finalContent = `${questionTitle}\n${rawContent}`;
      }

      const lowerName = cleanTitle.toLowerCase();
      let inferredSubject = (questionData.media as any)?.subject;
      if (!inferredSubject) {
        if (lowerName.includes('lý') || lowerName.includes('ly')) inferredSubject = 'Vật lý';
        else if (lowerName.includes('hóa') || lowerName.includes('hoa')) inferredSubject = 'Hóa học';
        else if (lowerName.includes('anh') || lowerName.includes('english')) inferredSubject = 'Tiếng Anh';
        else if (lowerName.includes('văn') || lowerName.includes('van')) inferredSubject = 'Ngữ văn';
        else if (lowerName.includes('sinh')) inferredSubject = 'Sinh học';
        else if (lowerName.includes('sử') || lowerName.includes('su')) inferredSubject = 'Lịch sử';
        else if (lowerName.includes('địa') || lowerName.includes('dia')) inferredSubject = 'Địa lý';
        else inferredSubject = 'Toán học';
      }

      const newQuestion = await tx.question.create({
        data: {
          content: finalContent,
          options: questionData.options ? (questionData.options as any) : [],
          correctAnswer: questionData.correctAnswer || '',
          explanation: questionData.explanation || '',
          subject: inferredSubject,
          topic: (questionData.media as any)?.topic || questionData.regions?.topic || 'Chương 1',
          difficulty: questionData.difficulty === 'EASY' ? 'EASY' : questionData.difficulty === 'HARD' ? 'HARD' : 'MEDIUM',
          createdBy: userId,
          type: questionData.type || 'MULTIPLE_CHOICE',
          section: questionData.section || 'PHẦN I',
          questionOrder: questionData.questionOrder || 1,
          status: 'APPROVED',
          imageUrl: imageUrl
        }
      });

      const optionsArray = Array.isArray(questionData.options) ? questionData.options : [];
      if (optionsArray.length > 0) {
        await tx.questionOption.createMany({
          data: optionsArray.map((opt: any) => ({
            questionId: newQuestion.id,
            optionLabel: opt.label,
            optionText: opt.content || opt.text || '',
            isCorrect: (() => {
              if (questionData.type === 'TRUE_FALSE') {
                const currentAnswers = (questionData.correctAnswer || '').split(',');
                const labelIdx = optionsArray.findIndex((o: any) => o.label === opt.label);
                const val = currentAnswers[labelIdx === -1 ? 0 : labelIdx] || 'Đ';
                return val === 'Đ';
              }
              const correctList = (questionData.correctAnswer || '').split(',').map((s: string) => s.trim());
              return correctList.includes(opt.label);
            })()
          }))
        });
      }

      return newQuestion;
    });
  }

  static async updateQuestionInBank(
    questionId: number,
    sessionName: string,
    questionData: any,
    imageUrl: string
  ) {
    return prisma.$transaction(async (tx) => {
      const cleanTitle = (sessionName || 'Đề thi').replace(/\.(pdf|docx|doc)$/i, '').trim();
      const questionTitle = `Câu ${questionData.questionOrder || 1}. (${cleanTitle})`;
      
      let rawContent = (questionData.content || '').trim();
      rawContent = rawContent.replace(/Câu \d+:\s*Nội dung được trích xuất từ ảnh cắt[^\n]*/gi, '').trim();
      rawContent = rawContent.replace(/Nội dung được trích xuất từ ảnh cắt[^\n]*/gi, '').trim();

      let finalContent = rawContent;
      if (!rawContent || rawContent === `Câu ${questionData.questionOrder || 1}`) {
        finalContent = questionTitle;
      } else if (!rawContent.startsWith(questionTitle)) {
        finalContent = `${questionTitle}\n${rawContent}`;
      }

      const lowerName = cleanTitle.toLowerCase();
      let inferredSubject = (questionData.media as any)?.subject;
      if (!inferredSubject) {
        if (lowerName.includes('lý') || lowerName.includes('ly')) inferredSubject = 'Vật lý';
        else if (lowerName.includes('hóa') || lowerName.includes('hoa')) inferredSubject = 'Hóa học';
        else if (lowerName.includes('anh') || lowerName.includes('english')) inferredSubject = 'Tiếng Anh';
        else if (lowerName.includes('văn') || lowerName.includes('van')) inferredSubject = 'Ngữ văn';
        else if (lowerName.includes('sinh')) inferredSubject = 'Sinh học';
        else if (lowerName.includes('sử') || lowerName.includes('su')) inferredSubject = 'Lịch sử';
        else if (lowerName.includes('địa') || lowerName.includes('dia')) inferredSubject = 'Địa lý';
        else inferredSubject = 'Toán học';
      }

      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: {
          content: finalContent,
          options: questionData.options ? (questionData.options as any) : [],
          correctAnswer: questionData.correctAnswer || '',
          explanation: questionData.explanation || '',
          subject: inferredSubject,
          topic: (questionData.media as any)?.topic || questionData.regions?.topic || 'Chương 1',
          difficulty: questionData.difficulty === 'EASY' ? 'EASY' : questionData.difficulty === 'HARD' ? 'HARD' : 'MEDIUM',
          type: questionData.type || 'MULTIPLE_CHOICE',
          section: questionData.section || 'PHẦN I',
          questionOrder: questionData.questionOrder || 1,
          status: 'APPROVED',
          ...(imageUrl ? { imageUrl } : {})
        }
      });

      // Re-create options for this question
      await tx.questionOption.deleteMany({ where: { questionId } });

      const optionsArray = Array.isArray(questionData.options) ? questionData.options : [];
      if (optionsArray.length > 0) {
        await tx.questionOption.createMany({
          data: optionsArray.map((opt: any) => ({
            questionId: updatedQuestion.id,
            optionLabel: opt.label,
            optionText: opt.content || opt.text || '',
            isCorrect: (() => {
              if (questionData.type === 'TRUE_FALSE') {
                const currentAnswers = (questionData.correctAnswer || '').split(',');
                const labelIdx = optionsArray.findIndex((o: any) => o.label === opt.label);
                const val = currentAnswers[labelIdx === -1 ? 0 : labelIdx] || 'Đ';
                return val === 'Đ';
              }
              const correctList = (questionData.correctAnswer || '').split(',').map((s: string) => s.trim());
              return correctList.includes(opt.label);
            })()
          }))
        });
      }

      return updatedQuestion;
    });
  }
}

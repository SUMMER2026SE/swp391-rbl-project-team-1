import { ExamManagementRepository } from '../repositories/examManagement.repository.js';

import { prisma } from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ExamManagementService {
  // --- EXAM SERVICES ---
  static async getExams(userId: number, filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const data = await ExamManagementRepository.getExams(userId, filters, skip, limit);
    const total = await ExamManagementRepository.countExams(userId, filters);
    
    // Map data for clean response format
    const formatted = data.map(ex => {
      const attemptsCount = ex.attempts?.length || 0;
      const scores = ex.attempts?.map(a => a.score) || [];
      const averageScore = attemptsCount > 0 ? Number((scores.reduce((a, b) => a + b, 0) / attemptsCount).toFixed(1)) : 0;
      const maxScore = attemptsCount > 0 ? Number(Math.max(...scores).toFixed(1)) : 0;

      return {
        id: ex.id,
        title: ex.title,
        subject: ex.subject,
        duration: ex.duration,
        year: ex.year,
        status: ex.status,
        grade: ex.grade,
        questionCount: ex.examQuestions?.length || 0,
        attemptsCount,
        averageScore,
        maxScore,
        createdAt: ex.createdAt
      };
    });

    return {
      exams: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getExamById(id: number, userId: number) {
    const exam = await ExamManagementRepository.getExamById(id);
    if (!exam) throw new Error('NOT_FOUND: Đề thi không tồn tại');
    if (exam.createdBy !== userId) throw new Error('FORBIDDEN: Bạn không có quyền truy cập đề thi này');
    return exam;
  }

  static async createExam(userId: number, data: any) {
    const { title, subject, duration, grade, description, year, creationMethod, questionIds, aiConfig } = data;
    let selectedQuestionIds = questionIds || [];

    if (creationMethod === 'AI' && aiConfig) {
      // AI query from bank
      const filters = {
        subject,
        topic: aiConfig.topic
      };
      
      const allQuestions = await ExamManagementRepository.getQuestions(filters, 0, 1000);
      const easy = allQuestions.filter(q => q.difficulty === 'EASY');
      const medium = allQuestions.filter(q => q.difficulty === 'MEDIUM');
      const hard = allQuestions.filter(q => q.difficulty === 'HARD');

      const selected = [
        ...easy.slice(0, aiConfig.easyCount || 0),
        ...medium.slice(0, aiConfig.mediumCount || 0),
        ...hard.slice(0, aiConfig.hardCount || 0)
      ];

      if (selected.length === 0) {
        throw new Error('VALIDATION_ERROR: Không tìm thấy đủ câu hỏi phù hợp trong ngân hàng câu hỏi');
      }

      selectedQuestionIds = selected.map(q => q.id);
    }

    const exam = await ExamManagementRepository.createExam({
      title,
      subject,
      subjectGroup: 'KHTN', // default
      duration,
      grade,
      description,
      year: year || new Date().getFullYear(),
      createdBy: userId,
      status: 'DRAFT',
      totalQuestions: selectedQuestionIds.length
    });

    if (selectedQuestionIds.length > 0) {
      await ExamManagementRepository.createExamQuestions(exam.id, selectedQuestionIds);
    }

    return exam;
  }

  static async updateExam(id: number, userId: number, data: any) {
    const exam = await this.getExamById(id, userId);
    if (exam.status.toLowerCase() === 'published') {
      throw new Error('VALIDATION_ERROR: Không thể sửa đề thi đã phát hành');
    }

    const { title, subject, duration, grade, description, year, questionIds } = data;
    const updated = await ExamManagementRepository.updateExam(id, {
      title,
      subject,
      duration,
      grade,
      description,
      year,
      totalQuestions: questionIds ? questionIds.length : undefined
    });

    if (questionIds) {
      await ExamManagementRepository.createExamQuestions(id, questionIds);
    }

    return updated;
  }

  static async cloneExam(id: number, userId: number) {
    const exam = await this.getExamById(id, userId);
    const newExam = await ExamManagementRepository.createExam({
      title: `${exam.title} (Bản sao)`,
      subject: exam.subject,
      subjectGroup: exam.subjectGroup,
      duration: exam.duration,
      grade: exam.grade,
      description: exam.description,
      year: exam.year,
      createdBy: userId,
      status: 'DRAFT',
      totalQuestions: exam.totalQuestions
    });

    const questionIds = exam.examQuestions.map(eq => eq.questionId);
    if (questionIds.length > 0) {
      await ExamManagementRepository.createExamQuestions(newExam.id, questionIds);
    }

    return newExam;
  }

  static async deleteExam(id: number, userId: number) {
    const exam = await this.getExamById(id, userId);
    if (exam.status.toLowerCase() !== 'draft') {
      throw new Error('VALIDATION_ERROR: Chỉ cho phép xóa đề thi ở trạng thái bản nháp (DRAFT)');
    }
    return ExamManagementRepository.deleteExam(id);
  }

  // --- QUESTION BANK SERVICES ---
  static async getQuestions(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const data = await ExamManagementRepository.getQuestions(filters, skip, limit);
    const total = await ExamManagementRepository.countQuestions(filters);

    return {
      questions: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async createQuestion(userId: number, data: any) {
    return ExamManagementRepository.createQuestion({
      ...data,
      createdBy: userId
    });
  }

  static async getQuestionById(id: number) {
    const question = await ExamManagementRepository.getQuestionById(id);
    if (!question) throw new Error('NOT_FOUND: Câu hỏi không tồn tại');
    return question;
  }

  static async updateQuestion(id: number, userId: number, data: any) {
    const question = await ExamManagementRepository.getQuestionById(id);
    if (!question) throw new Error('NOT_FOUND: Câu hỏi không tồn tại');
    if (question.createdBy !== userId) throw new Error('FORBIDDEN: Bạn không có quyền sửa câu hỏi của giáo viên khác');
    
    return ExamManagementRepository.updateQuestion(id, data);
  }

  static async reportQuestion(id: number, reporterId: number, reason: string) {
    const question = await ExamManagementRepository.getQuestionById(id);
    if (!question) throw new Error('NOT_FOUND: Câu hỏi không tồn tại');
    if (question.createdBy === reporterId) {
      throw new Error('VALIDATION_ERROR: Bạn không được tự báo cáo lỗi câu hỏi của chính mình');
    }
    return ExamManagementRepository.createReport({
      questionId: id,
      reporterId,
      reason,
      status: 'PENDING'
    });
  }



  // --- REPORT MODERATION ---
  static async getReportsForOwner(userId: number) {
    return ExamManagementRepository.getReportsByOwner(userId);
  }

  static async resolveReport(reportId: number, userId: number, status: string, explanation?: string) {
    const report = await prisma.questionReport.findUnique({
      where: { id: reportId },
      include: { question: true }
    });
    if (!report) throw new Error('NOT_FOUND: Báo cáo không tồn tại');
    if (report.question.createdBy !== userId) {
      throw new Error('FORBIDDEN: Chỉ có chủ sở hữu câu hỏi mới được giải quyết báo cáo');
    }
    return ExamManagementRepository.updateReport(reportId, {
      status: status as any,
      resolvedAt: new Date()
    });
  }

  // --- STATISTICS ---
  static async getTeacherStats(userId: number) {
    const metrics = await ExamManagementRepository.getTeacherMetrics(userId);
    
    // Aggregations using Prisma
    const questions = await prisma.question.findMany({
      where: { createdBy: userId },
      select: { subject: true, difficulty: true }
    });

    const bySubjectMap: Record<string, number> = {};
    const byDifficultyMap: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };

    questions.forEach(q => {
      const sub = q.subject || 'Khác';
      bySubjectMap[sub] = (bySubjectMap[sub] || 0) + 1;
      byDifficultyMap[q.difficulty] = (byDifficultyMap[q.difficulty] || 0) + 1;
    });

    const bySubject = Object.entries(bySubjectMap).map(([subject, count]) => ({ subject, count }));
    const byDifficulty = Object.entries(byDifficultyMap).map(([difficulty, count]) => ({ difficulty, count }));

    return {
      metrics,
      charts: {
        bySubject,
        byDifficulty
      }
    };
  }


}


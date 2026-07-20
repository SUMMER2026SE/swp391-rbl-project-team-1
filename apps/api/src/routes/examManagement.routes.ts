import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { uploadValidation } from '../middleware/upload.js';
import {
  validateCreateExam,
  validateCreateQuestion,
  validateUpdateExam
} from '../middleware/validation/examManagement.validation.js';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  cloneExam,
  deleteExam,
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  reportQuestion,
  uploadDocument,
  getImportSessions,
  getImportSessionById,
  updateImportQuestion,
  confirmImport,
  deleteImportSession,
  getReports,
  resolveReport,
  getStats
} from '../controllers/examManagement.controller.js';

const router = Router();

// Stats route
router.get('/statistics/teacher', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getStats);

// Exam routes
router.get('/exams', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getExams);
router.get('/exams/:id', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getExamById);
router.post('/exams', authenticateJWT, requireRole(['TEACHER']), validateCreateExam, createExam);
router.put('/exams/:id', authenticateJWT, requireRole(['TEACHER']), validateUpdateExam, updateExam);
router.post('/exams/:id/clone', authenticateJWT, requireRole(['TEACHER']), cloneExam);
router.delete('/exams/:id', authenticateJWT, requireRole(['TEACHER']), deleteExam);

// Question Bank routes
router.get('/questions', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getQuestions);
router.get('/questions/:id', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getQuestionById);
router.post('/questions', authenticateJWT, requireRole(['TEACHER']), validateCreateQuestion, createQuestion);
router.put('/questions/:id', authenticateJWT, requireRole(['TEACHER']), validateCreateQuestion, updateQuestion);
router.post('/questions/:id/report', authenticateJWT, requireRole(['TEACHER']), reportQuestion);

import { ImportV2Controller } from '../modules/importV2/importV2.controller.js';

// AI Document Import routes (Rebuilt Datalab + Gemini 2.5 Flash)
router.post('/import/upload', authenticateJWT, requireRole(['TEACHER']), uploadValidation, ImportV2Controller.uploadDocument);
router.get('/import/sessions', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.getSessions);
router.get('/import/sessions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.getSessionById);
router.put('/import/questions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.updateQuestion);
router.post('/import/sessions/:id/confirm', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.confirmImport);
router.delete('/import/sessions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.deleteSession);
router.post('/import/sessions/:id/merge', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.mergeQuestions);
router.post('/import/sessions/:id/split', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.splitQuestion);
router.post('/import/sessions/:id/duplicate', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.duplicateQuestion);

// Reports moderation routes
router.get('/reports/my-questions', authenticateJWT, requireRole(['TEACHER']), getReports);
router.patch('/reports/:id/status', authenticateJWT, requireRole(['TEACHER']), resolveReport);

export default router;

import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { uploadValidation, examUploadValidation } from '../middleware/upload.js';
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
  deleteQuestion,
  reportQuestion,
  getReports,
  resolveReport,
  getStats
} from '../controllers/examManagement.controller.js';
import { ImportV2Controller } from '../modules/importV2/importV2.controller.js';
import { ImportV3Controller } from '../modules/importV3/importV3.controller.js';

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
router.delete('/questions/:id', authenticateJWT, requireRole(['TEACHER']), deleteQuestion);
router.post('/questions/:id/report', authenticateJWT, requireRole(['TEACHER']), reportQuestion);

// AI Document Import V2 routes (MinerU Standalone API + Gemini Block Mapping)
router.post('/import/upload', authenticateJWT, requireRole(['TEACHER']), examUploadValidation, ImportV2Controller.uploadDocument);
router.get('/import/sessions', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.getSessions);
router.get('/import/sessions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.getSessionById);
router.put('/import/questions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.updateQuestion);
router.put('/import/sessions/:id/auto-save', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.autoSaveDraft);
router.post('/import/sessions/:id/rerun-stage', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.rerunStage);
router.post('/import/sessions/:id/confirm', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.confirmImport);
router.delete('/import/sessions/:id', authenticateJWT, requireRole(['TEACHER']), ImportV2Controller.deleteSession);

// NEW: AI Document Import V3 routes (Image First Pipeline: MinerU Page PNG -> Boundary -> Crop -> Gemini Vision)
router.post('/import-v3/upload', authenticateJWT, requireRole(['TEACHER']), examUploadValidation, ImportV3Controller.uploadDocumentV3);
router.get('/import-v3/session/:id', authenticateJWT, requireRole(['TEACHER']), ImportV3Controller.getSessionV3);
router.post('/import-v3/session/:id/recrop/:questionIndex', authenticateJWT, requireRole(['TEACHER']), ImportV3Controller.recropQuestionV3);
router.post('/import-v3/session/:id/explanation-image/:questionIndex', authenticateJWT, requireRole(['TEACHER']), uploadValidation, ImportV3Controller.uploadExplanationImageV3);
router.get('/import-v3/metadata/subjects-topics', authenticateJWT, requireRole(['TEACHER']), ImportV3Controller.getSubjectsAndTopics);

// Question Reports routes
router.get('/reports', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), getReports);
router.put('/reports/:id/resolve', authenticateJWT, requireRole(['ADMIN']), resolveReport);

export default router;

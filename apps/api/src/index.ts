import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './lib/socket.js';
import { prisma } from './lib/prisma.js';

import { login, logout, sendOtp, resendOtp, verifyOtpRegister, googleAuth, googleCompleteOnboarding, changePassword, forgotPassword, verifyResetOtp, resetPassword, requestRoleChange, getRoleChangeRequests, reviewRoleChange } from './controllers/auth.js';
import { getCourses, getCourseById, createCourse, getCourseStats } from './controllers/course.js';
import { getExams, getExamById, startAttempt, saveAnswer, submitAttempt, getAttempts, getExamQuestionsPublic, getAttemptById, getAttemptResult, getExamHistory, recordViolation, recordExamEvent, getExamEvents, recordViolationDetail, generateAiCoach, createSmartRetake, importExam } from './controllers/exam.js';
import { streamAIChat, refreshRoadmap, generateAIQuestions, generateMindmap, saveMindmap, getMindmaps, getMindmapById, deleteMindmap, generateFlashcards, getPublicMindmapById } from './controllers/ai.js';

import { chatbotConsult } from './controllers/chatbot.js';
import { getDocumentResources, getDocumentComments, addDocumentComment } from './controllers/document.js';
import { createVNPayPayment, vnpayWebhook, sepayWebhook, checkEnrollmentStatus, checkUserProStatus } from './controllers/payment.js';
import { authenticateJWT, requireRole } from './middleware/auth.js';
import {
  getCategories, createCategory, deleteCategory,
  getPosts, getPostById, createPost, deletePost, togglePinPost, reactPost,
  getComments, createComment, acceptCommentSolution,
  getStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup,
  getGroupAnnouncements, createGroupAnnouncement,
  getLeaderboard, getUserGamificationProfile,
  downloadResource, createReport, getReports, resolveReport
} from './controllers/forum.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Strip /api prefix for Vercel routing
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4);
  }
  next();
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Auth Routes
app.post('/login', login);
app.post('/logout', logout);
app.post('/auth/send-otp', sendOtp);
app.post('/auth/resend-otp', resendOtp);
app.post('/auth/verify-otp-register', verifyOtpRegister);
app.post('/auth/google', googleAuth);
app.post('/auth/forgot-password', forgotPassword);
app.post('/auth/verify-reset-otp', verifyResetOtp);
app.post('/auth/reset-password', resetPassword);
app.post('/auth/google/complete-onboarding', googleCompleteOnboarding);
app.post('/auth/change-password', authenticateJWT, changePassword);

// Role Change Routes
app.post('/auth/role-change-request', authenticateJWT, requestRoleChange);
app.get('/admin/role-change-requests', authenticateJWT, requireRole(['ADMIN']), getRoleChangeRequests);
app.post('/admin/role-change-requests/:id/review', authenticateJWT, requireRole(['ADMIN']), reviewRoleChange);
app.post('/admin/exams/import', authenticateJWT, requireRole(['ADMIN']), importExam);

// Protected Course Routes
app.get('/courses', getCourses);
app.get('/courses/:id', getCourseById);
app.get('/courses/:id/stats', getCourseStats);
app.post('/courses', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), createCourse);

// Document Resource Routes
app.get('/document-resources', getDocumentResources);
app.get('/document-resources/:id/comments', getDocumentComments);
app.post('/document-resources/:id/comments', authenticateJWT, addDocumentComment);

// Protected Exam Routes
app.get('/exams', getExams);
app.get('/exams/:id', getExamById);
app.get('/exams/:id/questions', getExamQuestionsPublic);

app.get('/exams/attempts', authenticateJWT, requireRole(['STUDENT']), getAttempts);
app.get('/exams/attempts/:attemptId', authenticateJWT, requireRole(['STUDENT']), getAttemptById);
app.post('/exams/:id/attempts', authenticateJWT, requireRole(['STUDENT']), startAttempt);
app.post('/exams/:id/attempts/:attemptId/submit', authenticateJWT, requireRole(['STUDENT']), submitAttempt);

// Upgraded Exam Simulation Endpoints
app.post('/exam-attempts/start', authenticateJWT, requireRole(['STUDENT']), (req, res, next) => {
  req.params.id = String(req.body.examId);
  next();
}, startAttempt);
app.post('/exam-attempts/:attemptId/save-answer', authenticateJWT, requireRole(['STUDENT']), saveAnswer);
app.post('/exam-attempts/:attemptId/submit', authenticateJWT, requireRole(['STUDENT']), submitAttempt);
app.get('/exam-attempts/:attemptId/result', authenticateJWT, requireRole(['STUDENT']), getAttemptResult);
app.post('/exam-attempts/:attemptId/violation', authenticateJWT, requireRole(['STUDENT']), recordViolation);
app.post('/exam-attempts/:attemptId/violation-detail', authenticateJWT, requireRole(['STUDENT']), recordViolationDetail);
app.post('/exam-attempts/:attemptId/events', authenticateJWT, requireRole(['STUDENT']), recordExamEvent);
app.get('/exam-attempts/:attemptId/events', authenticateJWT, requireRole(['STUDENT']), getExamEvents);
app.post('/exam-attempts/:attemptId/ai-coach', authenticateJWT, requireRole(['STUDENT']), generateAiCoach);
app.post('/exams/:id/smart-retake', authenticateJWT, requireRole(['STUDENT']), createSmartRetake);
app.get('/users/me/exam-history', authenticateJWT, requireRole(['STUDENT']), getExamHistory);

// Protected Payment Routes
app.post('/enrollments', authenticateJWT, requireRole(['STUDENT']), createVNPayPayment);
app.get('/enrollments/webhook', vnpayWebhook);
app.get('/enrollments/status', authenticateJWT, requireRole(['STUDENT']), checkEnrollmentStatus);
app.post('/enrollments/sepay-webhook', sepayWebhook);
app.get('/users/pro-status', authenticateJWT, requireRole(['STUDENT']), checkUserProStatus);

// Protected AI Routes
app.post('/ai/chat', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req as any, res, next);
  }
  next();
}, streamAIChat);
app.post('/ai/roadmap/refresh', authenticateJWT, requireRole(['STUDENT']), refreshRoadmap);
app.post('/ai/generate-questions', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), generateAIQuestions);

// AI Mindmap Routes
app.post('/ai/mindmap', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req as any, res, next);
  }
  next();
}, generateMindmap);

app.post('/ai/flashcards', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req as any, res, next);
  }
  next();
}, generateFlashcards);
app.post('/mindmaps', authenticateJWT, saveMindmap);
app.get('/mindmaps', authenticateJWT, getMindmaps);
app.get('/mindmaps/:id', authenticateJWT, getMindmapById);
app.get('/mindmaps/public/:id', getPublicMindmapById);
app.delete('/mindmaps/:id', authenticateJWT, deleteMindmap);

// Public AI Chatbot Route (No Auth required so landing page guests can use it!)
app.post('/chatbot', chatbotConsult);

// =========================================================================
// FORUM FEATURES ROUTING
// =========================================================================
app.get('/forum/categories', getCategories);
app.post('/forum/categories', authenticateJWT, requireRole(['ADMIN']), createCategory);
app.delete('/forum/categories/:id', authenticateJWT, requireRole(['ADMIN']), deleteCategory);

app.get('/forum/posts', getPosts);
app.get('/forum/posts/:id', getPostById);
app.post('/forum/posts', authenticateJWT, createPost);
app.delete('/forum/posts/:id', authenticateJWT, deletePost);
app.put('/forum/posts/:id/pin', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), togglePinPost);
app.post('/forum/posts/:id/react', authenticateJWT, reactPost);

app.get('/forum/posts/:postId/comments', getComments);
app.post('/forum/posts/:postId/comments', authenticateJWT, createComment);
app.put('/forum/comments/:id/accept', authenticateJWT, acceptCommentSolution);

app.get('/forum/study-groups', authenticateJWT, getStudyGroups);
app.post('/forum/study-groups', authenticateJWT, createStudyGroup);
app.post('/forum/study-groups/:id/join', authenticateJWT, joinStudyGroup);
app.post('/forum/study-groups/:id/leave', authenticateJWT, leaveStudyGroup);
app.get('/forum/study-groups/:id/announcements', authenticateJWT, getGroupAnnouncements);
app.post('/forum/study-groups/:id/announcements', authenticateJWT, createGroupAnnouncement);

app.get('/forum/leaderboard', getLeaderboard);
app.get('/forum/gamification/profile', authenticateJWT, getUserGamificationProfile);

app.post('/forum/resources/:id/download', downloadResource);
app.post('/forum/moderation/reports', authenticateJWT, createReport);
app.get('/forum/moderation/reports', authenticateJWT, requireRole(['ADMIN']), getReports);
app.put('/forum/moderation/reports/:id/resolve', authenticateJWT, requireRole(['ADMIN']), resolveReport);

// Root Hello check
app.get('/', (req, res) => {
  res.json({ success: true, data: "EduPath API Server is online!" });
});

const PORT = process.env.PORT || 4000;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`[API] EduPath Server is running on port: ${PORT}`);
  });
}

async function seedDefaultCategories() {
  try {
    const count = await prisma.forumCategory.count();
    if (count === 0) {
      console.log('[Seed] Seeding default forum categories...');
      const defaultCategories = [
        { name: 'Toán học', slug: 'toan-hoc', description: 'Thảo luận và học hỏi kiến thức môn Toán học THPTQG' },
        { name: 'Vật lý', slug: 'vat-ly', description: 'Trao đổi lời giải bài tập Vật lý và đề thi thử' },
        { name: 'Hóa học', slug: 'hoa-hoc', description: 'Góc học tập môn Hóa học lớp 10, 11, 12' },
        { name: 'Tiếng Anh', slug: 'tieng-anh', description: 'Chia sẻ từ vựng, ngữ pháp và đề thi mẫu THPTQG' },
        { name: 'Sinh học', slug: 'sinh-hoc', description: 'Nơi thảo luận về môn Sinh học và kiến thức liên quan' },
        { name: 'Thảo luận chung', slug: 'thao-luan-chung', description: 'Chia sẻ kinh nghiệm thi cử, phương pháp học tập chung' }
      ];

      for (const cat of defaultCategories) {
        await prisma.forumCategory.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN']
          }
        });
      }
      console.log('[Seed] Default forum categories seeded successfully!');
    }
  } catch (err) {
    console.error('[Seed Error] Failed to seed default categories:', err);
  }
}

// Auto-seed on startup
seedDefaultCategories();

export default app;


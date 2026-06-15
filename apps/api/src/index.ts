import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './lib/socket.js';

// Controller imports
import {
  login, logout, sendOtp, resendOtp, verifyOtpRegister,
  googleAuth, forgotPassword, resetPassword, googleCompleteOnboarding,
  changePassword, requestRoleChange, getRoleChangeRequests, reviewRoleChange
} from './controllers/auth.js';
import { getCourses, getCourseById, createCourse, getCourseStats } from './controllers/course.js';
import { getExams, startAttempt, submitAttempt } from './controllers/exam.js';
import { streamAIChat, refreshRoadmap, generateAIQuestions } from './controllers/ai.js';
import { chatbotConsult } from './controllers/chatbot.js';
import { createVNPayPayment, vnpayWebhook, sepayWebhook, checkEnrollmentStatus, checkUserProStatus } from './controllers/payment.js';
import { authenticateJWT, requireRole } from './middleware/auth.js';
import {
  getCategories, createCategory, deleteCategory,
  getPosts, getPostById, createPost, deletePost, togglePinPost, reactPost,
  getComments, createComment, acceptCommentSolution,
  getStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup,
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
app.post('/auth/reset-password', resetPassword);
app.post('/auth/google/complete-onboarding', googleCompleteOnboarding);
app.post('/auth/change-password', authenticateJWT, changePassword);

// Role Change Routes
app.post('/auth/role-change-request', authenticateJWT, requestRoleChange);
app.get('/admin/role-change-requests', authenticateJWT, requireRole(['ADMIN']), getRoleChangeRequests);
app.post('/admin/role-change-requests/:id/review', authenticateJWT, requireRole(['ADMIN']), reviewRoleChange);

// Protected Course Routes
app.get('/courses', getCourses);
app.get('/courses/:id', getCourseById);
app.get('/courses/:id/stats', getCourseStats);
app.post('/courses', authenticateJWT, requireRole(['TEACHER', 'ADMIN']), createCourse);

// Protected Exam Routes
app.get('/exams', getExams);
app.post('/exams/:id/attempts', authenticateJWT, requireRole(['STUDENT']), startAttempt);
app.post('/exams/:id/attempts/:attemptId/submit', authenticateJWT, requireRole(['STUDENT']), submitAttempt);

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

export default app;

export const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '/api');

async function request(path, options = {}) {
  let token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  let res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  // Handle expired/invalid JWT token by clearing and retrying as guest
  if ((res.status === 401 || res.status === 403) && token) {
    localStorage.removeItem('access_token');
    // Clear authorization header and retry
    const retryHeaders = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    delete retryHeaders['Authorization'];
    
    res = await fetch(`${API_BASE}${path}`, {
      headers: retryHeaders,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const err = new Error(data.error || `Lỗi ${res.status}`);
    err.data = data.data || null;
    throw err;
  }
  return data.data;
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', body: { email, password } }),

  sendOtp: (payload) =>
    request('/auth/send-otp', { method: 'POST', body: payload }),

  resendOtp: (email) =>
    request('/auth/resend-otp', { method: 'POST', body: { email } }),

  verifyOtpRegister: (email, otp) =>
    request('/auth/verify-otp-register', { method: 'POST', body: { email, otp } }),

  googleAuth: (profile) =>
    request('/auth/google', { method: 'POST', body: profile }),

  googleCompleteOnboarding: (tempToken, role, subjectGroup) =>
    request('/auth/google/complete-onboarding', {
      method: 'POST',
      body: { tempToken, role, subjectGroup }
    }),

  chatbot: (message, history) =>
    request('/chatbot', { method: 'POST', body: { message, history } }),

  changePassword: (oldPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),

  verifyResetOtp: (email, otp) =>
    request('/auth/verify-reset-otp', { method: 'POST', body: { email, otp } }),

  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: { token, password } }),

  getCourses: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/courses?${params}`);
  },

  getCourseById: (id) => request(`/courses/${id}`),

  createCourse: (payload) => request('/courses', { method: 'POST', body: payload }),

  getExams: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });
    return request(`/exams?${params.toString()}`);
  },

  getDocumentResources: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });
    return request(`/document-resources?${params.toString()}`);
  },
  getDocumentComments: (documentId) => request(`/document-resources/${documentId}/comments`),
  addDocumentComment: (documentId, content) => request(`/document-resources/${documentId}/comments`, {
    method: 'POST',
    body: { content },
  }),

  getExamById: (examId) => request(`/exams/${examId}`),

  getExamQuestionsPublic: (examId) => request(`/exams/${examId}/questions`),

  getAttempts: () => request('/exams/attempts'),

  getAttemptById: (attemptId) => request(`/exams/attempts/${attemptId}`),

  startAttempt: (examId, retakeMode = null, questionIds = []) => request('/exam-attempts/start', { method: 'POST', body: { examId, retakeMode, questionIds } }),

  saveAttemptAnswer: (attemptId, questionId, selectedAnswer) =>
    request(`/exam-attempts/${attemptId}/save-answer`, { method: 'POST', body: { questionId, selectedAnswer } }),

  submitAttempt: (attemptId, answers = [], retakeMode = null, questionIds = []) => 
    request(`/exam-attempts/${attemptId}/submit`, { method: 'POST', body: { answers, retakeMode, questionIds } }),

  getAttemptResult: (attemptId) => request(`/exam-attempts/${attemptId}/result`),

  getExamHistory: () => request('/users/me/exam-history'),

  recordViolation: (attemptId) => request(`/exam-attempts/${attemptId}/violation`, { method: 'POST' }),

  recordViolationDetail: (attemptId, violationType) =>
    request(`/exam-attempts/${attemptId}/violation-detail`, { method: 'POST', body: { violationType } }),

  recordExamEvent: (attemptId, eventType, questionId, payload) =>
    request(`/exam-attempts/${attemptId}/events`, { method: 'POST', body: { eventType, questionId, payload } }),

  getExamEvents: (attemptId) =>
    request(`/exam-attempts/${attemptId}/events`),

  generateAiCoach: (attemptId) =>
    request(`/exam-attempts/${attemptId}/ai-coach`, { method: 'POST' }),

  createSmartRetake: (examId, mode, attemptId) =>
    request(`/exams/${examId}/smart-retake`, { method: 'POST', body: { mode, attemptId } }),

  refreshRoadmap: () => request('/ai/roadmap/refresh', { method: 'POST' }),

  createVNPayPayment: (courseId) => request('/enrollments', { method: 'POST', body: { courseId } }),

  checkEnrollmentStatus: (courseId) => request(`/enrollments/status?courseId=${courseId}`),

  checkProStatus: () => request('/users/pro-status'),

  requestRoleChange: (requestedRole, reason) =>
    request('/auth/role-change-request', { method: 'POST', body: { requestedRole, reason } }),

  getRoleChangeRequests: () =>
    request('/admin/role-change-requests', { method: 'GET' }),

  reviewRoleChange: (requestId, action) =>
    request(`/admin/role-change-requests/${requestId}/review`, { method: 'POST', body: { action } }),

  // Forum API helpers
  getForumCategories: () =>
    request('/forum/categories', { method: 'GET' }),

  createForumCategory: (name, description, parentId) =>
    request('/forum/categories', { method: 'POST', body: { name, description, parentId } }),

  deleteForumCategory: (id) =>
    request(`/forum/categories/${id}`, { method: 'DELETE' }),

  getForumPosts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request(`/forum/posts?${query.toString()}`, { method: 'GET' });
  },

  getForumPostById: (id) =>
    request(`/forum/posts/${id}`, { method: 'GET' }),

  createForumPost: (postData) =>
    request('/forum/posts', { method: 'POST', body: postData }),

  deleteForumPost: (id) =>
    request(`/forum/posts/${id}`, { method: 'DELETE' }),

  togglePinForumPost: (id) =>
    request(`/forum/posts/${id}/pin`, { method: 'PUT' }),

  reactForumPost: (id, type) =>
    request(`/forum/posts/${id}/react`, { method: 'POST', body: { type } }),

  getForumComments: (postId) =>
    request(`/forum/posts/${postId}/comments`, { method: 'GET' }),

  createForumComment: (postId, content, parentId = null) =>
    request(`/forum/posts/${postId}/comments`, { method: 'POST', body: { content, parentId } }),

  acceptCommentSolution: (id) =>
    request(`/forum/comments/${id}/accept`, { method: 'PUT' }),

  getStudyGroups: () =>
    request('/forum/study-groups', { method: 'GET' }),

  createStudyGroup: (groupData) =>
    request('/forum/study-groups', { method: 'POST', body: groupData }),

  joinStudyGroup: (id) =>
    request(`/forum/study-groups/${id}/join`, { method: 'POST' }),

  leaveStudyGroup: (id) =>
    request(`/forum/study-groups/${id}/leave`, { method: 'POST' }),

  getForumLeaderboard: () =>
    request('/forum/leaderboard', { method: 'GET' }),

  getUserGamificationProfile: () =>
    request('/forum/gamification/profile', { method: 'GET' }),

  downloadResource: (id) =>
    request(`/forum/resources/${id}/download`, { method: 'POST' }),

  createForumReport: (postId, commentId, reason) =>
    request('/forum/moderation/reports', { method: 'POST', body: { postId, commentId, reason } }),

  importExam: (examData) =>
    request('/admin/exams/import', { method: 'POST', body: examData }),

  generateMindmap: (text) =>
    request('/ai/mindmap', {
      method: 'POST',
      body: { text },
    }),

  generateFlashcards: (text) =>
    request('/ai/flashcards', {
      method: 'POST',
      body: { text },
    }),

  saveMindmap: (title, content, id = null) =>
    request('/mindmaps', {
      method: 'POST',
      body: { title, content, id },
    }),

  getMindmaps: () =>
    request('/mindmaps', { method: 'GET' }),

  getMindmapById: (id) =>
    request(`/mindmaps/${id}`, { method: 'GET' }),

  deleteMindmap: (id) =>
    request(`/mindmaps/${id}`, { method: 'DELETE' }),

  getPublicMindmapById: (id) =>
    request(`/mindmaps/public/${id}`, { method: 'GET' }),

  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  banAdminUser: (id) => request(`/admin/users/${id}/ban`, { method: 'POST' }),
  getAdminLeads: () => request('/admin/leads'),
  createAdminLead: (payload) => request('/admin/leads', { method: 'POST', body: payload }),
  updateAdminLeadStatus: (id, status) => request(`/admin/leads/${id}/status`, { method: 'PUT', body: { status } }),
  getFeatureFlags: () => request('/admin/features'),
  toggleFeatureFlag: (id, isEnabled) => request(`/admin/features/${id}/toggle`, { method: 'POST', body: { isEnabled } }),
};


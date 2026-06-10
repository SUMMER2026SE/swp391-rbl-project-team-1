export const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '/api');

async function request(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
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

  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: { token, password } }),

  getCourses: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/courses?${params}`);
  },

  getCourseById: (id) => request(`/courses/${id}`),

  createCourse: (payload) => request('/courses', { method: 'POST', body: payload }),

  getExams: (subject) => request(`/exams${subject ? `?subject=${subject}` : ''}`),

  startAttempt: (examId) => request(`/exams/${examId}/attempts`, { method: 'POST' }),

  submitAttempt: (examId, attemptId, answers) => 
    request(`/exams/${examId}/attempts/${attemptId}/submit`, { method: 'POST', body: { answers } }),

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
    request('/forum/moderation/reports', { method: 'POST', body: { postId, commentId, reason } })
};


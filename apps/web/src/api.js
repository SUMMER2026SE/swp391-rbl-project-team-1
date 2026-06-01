const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Lỗi ${res.status}`);
  }
  return data.data;
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', body: { email, password } }),

  sendOtp: (payload) =>
    request('/auth/send-otp', { method: 'POST', body: payload }),

  verifyOtpRegister: (email, otp) =>
    request('/auth/verify-otp-register', { method: 'POST', body: { email, otp } }),

  googleAuth: (profile) =>
    request('/auth/google', { method: 'POST', body: profile }),

  chatbot: (message, history) =>
    request('/chatbot', { method: 'POST', body: { message, history } })
};

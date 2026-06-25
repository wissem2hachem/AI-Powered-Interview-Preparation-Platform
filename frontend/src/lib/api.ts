import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5275/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
};

// ── Resumes ───────────────────────────────────────────────────────────
export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => apiClient.get('/resumes'),
  getById: (id: string) => apiClient.get(`/resumes/${id}`),
  delete: (id: string) => apiClient.delete(`/resumes/${id}`),
};

// ── Sessions ──────────────────────────────────────────────────────────
export const sessionApi = {
  create: (data: { resumeId: string; jobRole: string; aiModel?: string; questionCount?: number }) =>
    apiClient.post('/sessions', data),
  list: () => apiClient.get('/sessions'),
  getById: (id: string) => apiClient.get(`/sessions/${id}`),
  complete: (id: string) => apiClient.patch(`/sessions/${id}/complete`),
  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
};

// ── Questions ─────────────────────────────────────────────────────────
export const questionApi = {
  generate: (sessionId: string, count = 8) =>
    apiClient.post(`/sessions/${sessionId}/questions/generate?count=${count}`),
  list: (sessionId: string) =>
    apiClient.get(`/sessions/${sessionId}/questions`),
  getIdealAnswer: (questionId: string) =>
    apiClient.get(`/questions/${questionId}/ideal-answer`),
};

// ── Answers ───────────────────────────────────────────────────────────
export const answerApi = {
  submitText: (data: { questionId: string; text: string }) =>
    apiClient.post('/answers/text', data),
  submitVoice: (questionId: string, audioBlob: Blob) => {
    const form = new FormData();
    form.append('questionId', questionId);
    form.append('audio', audioBlob, 'recording.webm');
    return apiClient.post('/answers/voice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id: string) => apiClient.get(`/answers/${id}`),
  generateFeedback: (id: string) => apiClient.post(`/answers/${id}/feedback`),
};

// ── Progress ──────────────────────────────────────────────────────────
export const progressApi = {
  list: () => apiClient.get('/progress'),
  stats: () => apiClient.get('/progress/stats'),
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const assignmentService = {
  fetchAll: () => api.get('/assignments'),
  create: (data) => api.post('/assignments/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  fetchOne: (id) => api.get(`/assignments/${id}`),
  fetchTeacherStats: () => api.get('/assignments/stats/teacher')
};

export const submissionService = {
  submit: (assignmentId, formData) => api.post(`/submissions/submit/${assignmentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  fetchByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  grade: (submissionId, data) => api.patch(`/submissions/grade/${submissionId}`, data)
};

export const mcqService = {
  fetchPractice: () => api.get('/mcqs/practice'),
  seed: () => api.post('/mcqs/seed')
};

export const aiService = {
  chat: (messages, context) => api.post('/ai/chat', { messages, context }),
};

export default api;

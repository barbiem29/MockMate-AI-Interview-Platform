import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm_token')
      localStorage.removeItem('mm_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
}

export const interviewAPI = {
  start:           (data)                 => api.post('/interviews/start', data),
  getById:         (id)                   => api.get(`/interviews/${id}`),
  getNextQuestion: (id)                   => api.get(`/interviews/${id}/next-question`),
  submitAnswer:    (id, questionId, data) => api.post(`/interviews/${id}/question/${questionId}/answer`, data),
  end:             (id)                   => api.post(`/interviews/${id}/end`),
}

export const resultAPI = {
  getMyResults:     ()            => api.get('/results'),
  getByInterviewId: (interviewId) => api.get(`/results/${interviewId}`),
}

export const proctorAPI = {
  addEvent: (data)        => api.post('/proctor', data),
  getLog:   (interviewId) => api.get(`/proctor/${interviewId}`),
}

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
}

export default api
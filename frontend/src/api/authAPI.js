import axiosClient from './axiosClient';

export const authAPI = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  logout: () => axiosClient.post('/auth/logout'),
  getProfile: () => axiosClient.get('/auth/profile'),
  forgotPassword: (data) => axiosClient.post('/auth/forgot_password', data),
  verifyResetToken: (token) => axiosClient.get(`/auth/reset_password/${token}`),
  resetPassword: (token, data) => axiosClient.post(`/auth/reset_password/${token}`, data),
  verifyEmail: (token) => axiosClient.get(`/auth/verify-email/${token}`),
  getMe: (token) => axiosClient.get('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),
};

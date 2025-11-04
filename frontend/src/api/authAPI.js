import axiosClient from './axiosClient';

export const authAPI = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  logout: () => axiosClient.post('/auth/logout'),
  getProfile: () => axiosClient.get('/auth/profile'),
};

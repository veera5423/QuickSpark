import axiosClient from './axiosClient';

export const chatWithResource = async (resourceId, question) => {
  try {
    const response = await axiosClient.post('/api/summarizer/chat-with-resource', {
      resource_id: resourceId,
      question: question
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Public Resources API
export const getPublicResources = async (searchQuery = '') => {
  try {
    const response = await axiosClient.get('/api/public/public-search', {
      params: { q: searchQuery }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitLink = async (url, description = '') => {
  try {
    const response = await axiosClient.post('/api/public/submit-link', { url, description });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitPdf = async (file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    const response = await axiosClient.post('/api/public/submit-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const interactWithResource = async (resourceId, actionType, reason = null) => {
  try {
    const data = { resource_id: resourceId, action_type: actionType };
    if (actionType === 'report' && reason) {
      data.reason = reason;
    }
      const response = await axiosClient.post(`/api/public/interact/${resourceId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin API
export const getAdminStats = async () => {
  try {
    const response = await axiosClient.get('/api/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosClient.get('/api/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const toggleUserStatus = async (userId, field) => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/toggle`, { field });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllResources = async () => {
  try {
    const response = await axiosClient.get('/api/admin/resources/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyResource = async (resourceId) => {
  try {
    const response = await axiosClient.post(`/api/public/admin/verify/${resourceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

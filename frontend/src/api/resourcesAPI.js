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

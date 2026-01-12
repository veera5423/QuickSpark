import axiosClient from './axiosClient';

export const voiceInterviewAPI = {
  generateQuestions: async (data) => {
    const response = await axiosClient.post('/api/voice-interview/generate_questions', data);
    return response.data;
  },

  evaluateAllAnswers: async (data) => {
    const response = await axiosClient.post('/api/voice-interview/evaluate_all_answers', data);
    return response.data;
  }
};
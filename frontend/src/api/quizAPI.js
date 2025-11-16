import axiosClient from './axiosClient';

export const quizAPI = {
  // Get user's resources for quiz generation
  getResources: async () => {
    const response = await axiosClient.get('api/resources/');
    return response.data;
  },

  // Generate quiz from resource
  generateQuiz: async (resourceId, level = 'medium', numQuestions = 5) => {
    const response = await axiosClient.post(`/api/quiz/generate-quiz/${resourceId}`, {
      level,
      num_questions: numQuestions
    });
    return response.data;
  },

  // Generate quiz from text
  generateQuizFromText: async (text, level = 'medium', numQuestions = 5) => {
    const response = await axiosClient.post('/api/quiz/generate-quiz-text', {
      text,
      level,
      num_questions: numQuestions
    });
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    const response = await axiosClient.post(`/api/quiz/submit-quiz/${quizId}`, {
      answers
    });
    return response.data;
  },

  // Get user's quiz attempts
  getAttempts: async () => {
    const response = await axiosClient.get('/api/quiz/get-attempts');
    return response.data;
  }
};

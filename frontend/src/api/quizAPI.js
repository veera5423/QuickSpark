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
  generateQuizFromText: async (text, level = 'medium', numQuestions = 5, skillId = null) => {
    const response = await axiosClient.post('/api/quiz/generate-quiz-text', {
      text,
      level,
      num_questions: numQuestions,
      skill_id: skillId
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
  },

  // // Generate skill quiz
  // generateSkillQuiz: async (skillId, skillName, level = 'medium', numQuestions = 5) => {
  //   const response = await axiosClient.post('/api/quiz/generate-quiz-text', {
  //     skill_id: skillId,
  //     skill_name: skillName,
  //     level,
  //     num_questions: numQuestions
  //   });
  //   return response.data;
  // },

  // Get completed skills
  getCompletedSkills: async () => {
    const response = await axiosClient.get('/api/quiz/completed-skills');
    console.log("completed-Skills:",response.data.completed_skill_ids);
    
    return response.data;
  },

  // Get attempt details
  getAttemptDetails: async (attemptId) => {
    const response = await axiosClient.get(`/api/quiz/get-attempt-details/${attemptId}`);
    return response.data;
  },

  // Get user's quizzes
  getQuizzes: async () => {
    const response = await axiosClient.get('/api/quiz/get-quizzes');
    return response.data;
  }
};

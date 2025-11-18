import axiosClient from './axiosClient';

export const careerAPI = {
  // Get all career roles
  getCareerRoles: async () => {
    const response = await axiosClient.get('/api/career/career-roles');
    return response.data;
  },

  // Get career role details by ID
  getCareerRoleDetails: async (roleId) => {
    const response = await axiosClient.get(`/api/career/career-roles/${roleId}`);
    return response.data;
  },

  // Get all skills
  getSkills: async () => {
    const response = await axiosClient.get('/api/career/skills');
    return response.data;
  },

  // Get skill details by ID
  getSkillDetails: async (skillId) => {
    const response = await axiosClient.get(`/api/career/skills/${skillId}`);
    return response.data.skill;
  }
};

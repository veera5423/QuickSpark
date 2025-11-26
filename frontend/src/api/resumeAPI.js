import axiosClient from "./axiosClient";

export const resumeAPI = {
  // Upload and summarize resume PDF
  getResumeScore: async (file) => {
    const formData = new FormData();
    formData.append('file', file);  
    try {
      const response = await axiosClient.post('/api/resume/resume-check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    //    console.log('content-type:', response.headers['content-type']);
    //     console.log('typeof data:', typeof response.data.result.feedback, response.data);

      return response.data;
    } catch (error) {   
        console.log("Error in API ",error );
        
        throw error.response ;
    }
  }
};
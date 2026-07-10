import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ◀️ Import Navigate
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const AISummarizer = () => {
  const navigate = useNavigate(); // ◀️ Initialize hook
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosClient.post('/api/summarizer/upload-and-summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 🚀 SUCCESS! Redirect to the full Chat/Summary view
      // The backend returns the new resource ID. We use it to navigate.
      const newId = response.data.resource_id; // This is the UUID from your backend
      navigate(`/dashboard/resources/chat/${newId}`);

    } catch (error) {
      console.error('Failed to upload file:', error);
      setError(error.response?.data?.message || 'Failed to upload and summarize PDF');
      if (error.response?.status === 429) {
        setLimitExceeded(true);
      }
      setUploading(false); // Only stop loading if there's an error
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Study assistant</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">AI Study Assistant</h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto px-4 mt-2">
          Upload a document to generate an AI summary, create quizzes, and chat with your study material.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto border-2 border-dashed border-slate-300 shadow-none hover:border-teal-300 transition-colors rounded-[2rem]">
        <div className="space-y-6 sm:space-y-8 py-6 sm:py-10 px-4 sm:px-6">
          
          {/* Upload UI */}
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center text-4xl">
                  {uploading ? (
                    <span className="animate-spin">⚙️</span>
                  ) : (
                    <span>📄</span>
                  )}
                </div>
              </div>
              
              <div>
                <Button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform hover:scale-105"
                >
                  {uploading ? 'Processing AI...' : 'Upload & Start Studying'}
                </Button>
              </div>
              
              <p className="text-sm text-slate-500">
                {uploading 
                  ? "Reading document, generating summary, and creating embeddings..." 
                  : "Supports PDF files up to 10MB"
                }
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {/* Usage Limit Exceeded Popup (same style as MockTests) */}
          {limitExceeded && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-lg max-w-sm sm:max-w-md w-full mx-4 border border-slate-200">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-red-600">Usage Limit Exceeded</h3>
                <p className="mb-4 text-sm sm:text-base text-slate-700">You have reached your summarization limit. Upgrade to premium for more uploads. To get upgrade access, add five public resources.</p>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    onClick={() => setLimitExceeded(false)}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => {
                      setLimitExceeded(false);
                      navigate('/dashboard/submit-resource');
                    }}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Features Grid (Visual Flair) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12 px-4">
        <div className="text-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-bold text-slate-950 text-sm sm:text-base">Smart Summaries</h3>
          <p className="text-xs sm:text-sm text-slate-500">Get key concepts instantly.</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-bold text-slate-950 text-sm sm:text-base">AI Chat</h3>
          <p className="text-xs sm:text-sm text-slate-500">Ask specific questions.</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="font-bold text-slate-950 text-sm sm:text-base">Auto-Quizzes</h3>
          <p className="text-xs sm:text-sm text-slate-500">Test your knowledge.</p>
        </div>
      </div>
    </div>
  );
};

export default AISummarizer;
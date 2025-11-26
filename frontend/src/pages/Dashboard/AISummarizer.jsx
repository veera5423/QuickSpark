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
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Assistant</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Upload a document to generate an AI summary, create quizzes, and chat with your study material.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 shadow-none hover:border-indigo-300 transition-colors">
        <div className="space-y-8 py-10">
          
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
                <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl">
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform hover:scale-105"
                >
                  {uploading ? 'Processing AI...' : 'Upload & Start Studying'}
                </Button>
              </div>
              
              <p className="text-sm text-gray-400">
                {uploading 
                  ? "Reading document, generating summary, and creating embeddings..." 
                  : "Supports PDF files up to 10MB"
                }
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {/* Usage Limit Exceeded Popup (same style as MockTests) */}
          {limitExceeded && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                <h3 className="text-lg font-bold mb-4 text-red-600">Usage Limit Exceeded</h3>
                <p className="mb-4 text-gray-700">You have reached your summarization limit. Upgrade to premium for more uploads. To Get Upgrade add five public resources   </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setLimitExceeded(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setLimitExceeded(false);
                      navigate('/dashboard/submit-resource');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Features Grid (Visual Flair) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="text-center p-4">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-bold text-gray-800">Smart Summaries</h3>
          <p className="text-sm text-gray-500">Get key concepts instantly.</p>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-bold text-gray-800">AI Chat</h3>
          <p className="text-sm text-gray-500">Ask specific questions.</p>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="font-bold text-gray-800">Auto-Quizzes</h3>
          <p className="text-sm text-gray-500">Test your knowledge.</p>
        </div>
      </div>
    </div>
  );
};

export default AISummarizer;
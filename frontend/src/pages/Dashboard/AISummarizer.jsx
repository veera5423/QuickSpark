import React, { useState, useRef } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const AISummarizer = () => {
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
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
      setFileName(file.name);

      const token = localStorage.getItem('token');
      console.log('Token before upload:', token ? 'Present' : 'Missing');  // Debug log

      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending request to /api/summarizer/upload-and-summarize with FormData');  // Debug log

      const response = await axiosClient.post('/api/summarizer/upload-and-summarize', formData, {
        withCredentials: true  // Ensure credentials are sent if needed
      });

      console.log('Upload response:', response.data);  // Debug log
    
  

      setSummary(response.data.summary);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Failed to upload file:', error);
      console.error('Error response:', error.response);  // Debug log
      console.error('Error status:', error.response?.status);  // Debug log
      console.error('Error data:', error.response?.data);  // Debug log
      setError(error.response?.data?.message || 'Failed to upload and summarize PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearSummary = () => {
    setSummary('');
    setFileName('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI PDF Summarizer</h1>
        <p className="text-gray-600">
          Upload a PDF document and get an AI-powered summary instantly
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <Button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  {uploading ? 'Processing...' : 'Choose PDF File'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Supports PDF files up to 10MB
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Summary Display */}
          {summary && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Summary</h3>
                <Button
                  onClick={clearSummary}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear
                </Button>
              </div>

              {fileName && (
                <p className="text-sm text-gray-600">
                  <strong>File:</strong> {fileName}
                </p>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Summary generated using AI. Results may vary.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!summary && !uploading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No summary yet. Upload a PDF to get started!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AISummarizer;

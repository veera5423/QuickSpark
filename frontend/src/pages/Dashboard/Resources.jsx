import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ◀️ Import for SPA navigation
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const Resources = () => {
  const navigate = useNavigate(); // ◀️ Hook for navigation
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      // Ensure this endpoint matches your backend route for fetching list
      const response = await axiosClient.get('/api/resources/'); 
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      // Call your combined endpoint (Upload + Summarize + Embed)
      await axiosClient.post('/api/summarizer/upload-and-summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reload resources to show the new one immediately
      await loadResources();

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Failed to upload file:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload and summarize PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-indigo-600 font-medium">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* --- HEADER & UPLOAD BUTTON --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-500 mt-1">Manage your documents and study materials.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            disabled={uploading}
            className={`flex items-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            {uploading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Processing AI...</span>
              </>
            ) : (
              <>
                <span>📄</span> Upload PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* --- ERROR MESSAGE --- */}
      {(uploadError || error) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          {uploadError || error}
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {resources.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload your first PDF lecture note or textbook chapter to get an AI-powered summary and start chatting with it.
          </p>
          <Button
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
          >
            Select a File
          </Button>
        </div>
      ) : (
        /* --- RESOURCE GRID --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <Card
              key={resource._id}
              className="group hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-indigo-200"
              // onClick={() => {
              //   // ◀️ Uses React Router navigation instead of full page reload
              //   navigate(`/dashboard/resources/chat/${resource.resource_uuid || resource._id}`);
              // }}
              onClick={() => {
    const idToUse = resource.resource_uuid || resource._id;
    console.log("Navigating to ID:", idToUse, " (UUID is correct if 36 chars)");
    navigate(`/dashboard/resources/chat/${idToUse}`);
}}
            >
              <div className="flex flex-col h-full space-y-4 p-2">
                
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-indigo-50 rounded-lg text-2xl">
                    📄
                  </div>
                  {resource.status === 'summarized' && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      Ready
                    </span>
                  )}
                </div>

                {/* Title & Date */}
                <div>
                  <h3 className="font-bold text-gray-900 truncate text-lg" title={resource.original_filename}>
                    {resource.original_filename || resource.filename}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Summary Preview */}
                <div className="flex-1">
                   {resource.summary ? (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {resource.summary}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Summary processing...</p>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <span>{resource.metadata?.page_count || '?'} Pages</span>
                  <span>{(resource.metadata?.file_size_kb || 0).toFixed(0)} KB</span>
                </div>

                {/* Hover Action Hint */}
                <div className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-right">
                  Open Study Chat →
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
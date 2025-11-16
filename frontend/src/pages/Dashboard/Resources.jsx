import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
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

      await axiosClient.post('/api/summarizer/upload-and-summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reload resources to show the new one
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
        <div className="text-lg">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadResources} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resources</h1>
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading ? 'Uploading...' : '📄 Upload PDF'}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {uploadError}
        </div>
      )}

      {resources.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
            <p className="text-gray-500 mb-6">
              Upload your first PDF to get AI-powered summarization and quiz generation.
            </p>
            <Button
              onClick={handleUploadClick}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <Card
              key={resource._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedResource(resource);
                setShowModal(true);
              }}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg truncate" title={resource.filename}>
                    {resource.filename}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>

                {resource.summary && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">AI Summary:</h4>
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {resource.summary.substring(0, 200)}...
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{resource.metadata?.page_count || 0} pages</span>
                  <span>{(resource.metadata?.file_size_kb || 0).toFixed(1)} KB</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  {resource.status === 'summarized' && (
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      ✓ Summarized
                    </span>
                  )}

                  {resource.linked_modules?.mock_test_id && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/dashboard/mock-tests?resource=${resource._id}`;
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Take Quiz
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resource Detail Modal */}
      {showModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedResource.filename}</h3>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedResource(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Date:</strong> {new Date(selectedResource.created_at).toLocaleDateString()}</p>
                  <p><strong>Pages:</strong> {selectedResource.metadata?.page_count || 0}</p>
                  <p><strong>Size:</strong> {(selectedResource.metadata?.file_size_kb || 0).toFixed(1)} KB</p>
                  {selectedResource.status === 'summarized' && (
                    <p><strong>Status:</strong> Summarized</p>
                  )}
                </div>
                {selectedResource.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Full AI Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{selectedResource.summary}</p>
                    </div>
                  </div>
                )}
                {selectedResource.tags && selectedResource.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedResource.linked_modules?.mock_test_id && (
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      window.location.href = `/dashboard/mock-tests?resource=${selectedResource._id}`;
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Take Quiz
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

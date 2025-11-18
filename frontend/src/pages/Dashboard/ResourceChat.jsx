import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chatbox from '../../components/ui/Chatbox';
import axiosClient from '../../api/axiosClient';

const ResourceChat = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/resources/');
      const foundResource = response.data.resources.find(r => r._id === resourceId || r.resource_uuid === resourceId);
      if (foundResource) {
        setResource(foundResource);
      } else {
        setError('Resource not found');
      }
    } catch (error) {
      console.error('Failed to load resource:', error);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading resource...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center text-red-600 mb-4">
          <p>{error || 'Resource not found'}</p>
        </div>
        <Button onClick={() => navigate('/dashboard/resources')} className="bg-blue-600 hover:bg-blue-700 text-white">
          Back to Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left side: Resource details */}
      <div className="w-1/2 p-6 border-r overflow-y-auto bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{resource.filename}</h1>
          <Button onClick={() => navigate('/dashboard/resources')} className="text-gray-500 hover:text-gray-700">
            ← Back
          </Button>
        </div>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Date:</strong> {new Date(resource.created_at).toLocaleDateString()}</p>
            <p><strong>Pages:</strong> {resource.metadata?.page_count || 0}</p>
            <p><strong>Size:</strong> {(resource.metadata?.file_size_kb || 0).toFixed(1)} KB</p>
            {resource.status === 'summarized' && (
              <p><strong>Status:</strong> Summarized</p>
            )}
          </div>
          {resource.summary && (
            <div>
              <h4 className="font-semibold mb-2">Full AI Summary</h4>
              <div className="bg-white p-4 rounded-lg prose prose-sm max-w-none shadow-sm">
                <p className="whitespace-pre-wrap">{resource.summary}</p>
              </div>
            </div>
          )}
          {resource.tags && resource.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {resource.linked_modules?.mock_test_id && (
            <Button
              onClick={() => navigate(`/dashboard/mock-tests?resource=${resource._id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Take Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Right side: Chatbox */}
      <div className="w-1/2 p-6 flex flex-col bg-white">
        <Chatbox
          resourceId={resource.resource_uuid || resource._id}
          onClose={() => navigate('/dashboard/resources')}
        />
      </div>
    </div>
  );
};

export default ResourceChat;

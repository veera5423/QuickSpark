import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getPublicResources, interactWithResource } from '../../api/resourcesAPI';

const PublicResources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [interacting, setInteracting] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadResources();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await getPublicResources(searchQuery);
      setResources(response.resources || []);
    } catch (error) {
      console.error('Failed to load public resources:', error);
      setError('Failed to load public resources');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (resourceId, actionType, reason = null) => {
    try {
      setInteracting(resourceId);
      await interactWithResource(resourceId, actionType, reason);

      // Update local state to reflect the change
      setResources(prevResources =>
        prevResources.map(resource => {
          if (resource.id === resourceId) {
            if (actionType === 'like') {
              return { ...resource, likes: resource.likes + 1 };
            } else if (actionType === 'dislike') {
              return { ...resource, dislikes: resource.dislikes + 1 };
            }
          }
          return resource;
        })
      );
    } catch (error) {
      console.error('Failed to interact with resource:', error);
      setError('Failed to process interaction');
    } finally {
      setInteracting(null);
    }
  };

  const handleReport = (resourceId) => {
    const reason = prompt('Please provide a reason for reporting this resource:');
    if (reason && reason.trim()) {
      handleInteraction(resourceId, 'report', reason.trim());
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-indigo-600 font-medium">Loading public library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Library</h1>
          <p className="text-gray-500 mt-1">Explore verified study resources shared by the community.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/dashboard/submit-resource')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            ➕ Submit Resource
          </Button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* --- ERROR MESSAGE --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {resources.length === 0 && !loading ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No resources found' : 'No public resources yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or browse all resources.'
              : 'Be the first to share educational resources with the community!'
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={() => navigate('/dashboard/submit-resource')}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            >
              Submit First Resource
            </Button>
          )}
        </div>
      ) : (
        /* --- RESOURCE GRID --- */
        console.log(resources),
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <Card
              key={resource.id}
              className="group hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-indigo-200"
              onClick={() => window.open(resource.review_source, '_blank')}
              
            >
              <div className="flex flex-col h-full space-y-4 p-4">

                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-indigo-50 rounded-lg text-2xl">
                    {resource.platform === 'PDF' ? '📄' : '🔗'}
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    Verified
                  </span>
                </div>

                {/* Title & Platform */}
                <div>
                  <h3 className="font-bold text-gray-900 truncate text-lg" title={resource.filename}>
                    {resource.filename}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {resource.platform} • {resource.likes} 👍 • {resource.dislikes} 👎
                  </p>
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                {/* Interaction Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(resource.id, 'like');
                      }}
                      disabled={interacting === resource.id}
                      className="text-xs px-2 py-1 bg-green-400 text-green-700 hover:bg-green-500 border border-green-200"
                    >
                      👍 Like
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(resource.id, 'dislike');
                      }}
                      disabled={interacting === resource.id}
                      className="text-xs px-2 py-1 bg-red-400 text-red-700 hover:bg-red-500 border border-red-200"
                    >
                      👎 Dislike
                    </Button>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReport(resource.id);
                    }}
                    disabled={interacting === resource.id}
                    className="text-xs px-2 py-1 bg-gray-400 text-gray-700 hover:bg-gray-500 border border-gray-200"
                  >
                    🚨 Report
                  </Button>
                </div>

                {/* Hover Action Hint */}
                <div className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-right">
                  Open 
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicResources;

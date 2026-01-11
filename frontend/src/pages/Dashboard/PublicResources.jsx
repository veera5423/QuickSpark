import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Clock, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PDFViewerModal from '../../components/ui/PDFViewerModal';
import { getPublicResources, interactWithResource } from '../../api/resourcesAPI';
import LikeButton from '../../components/ui/Likes';
import DislikeButton from '../../components/ui/Dislikes';

const PublicResources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pdf' | 'link'
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, filtered: 0 });
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for debouncing
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('publicResourcesSearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Enhanced debouncing with typing indicator
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery !== debouncedSearchQuery) {
      setIsTyping(true);
      
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
        setIsTyping(false);
      }, searchQuery.length > 3 ? 200 : 500); // Faster debounce for longer queries
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Load resources with request cancellation
  useEffect(() => {
    loadResources();
  }, [debouncedSearchQuery, filterType]);

  // Initial load
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsSearching(true);
      setError(null);

      const response = await getPublicResources(debouncedSearchQuery, filterType);
      const resourcesData = response.resources || [];
      
      setResources(resourcesData);
      setSearchStats({
        total: resourcesData.length,
        filtered: resourcesData.length
      });

      // Add to search history if it's a meaningful search
      if (debouncedSearchQuery.trim() && debouncedSearchQuery.length > 2) {
        const newHistory = [debouncedSearchQuery.trim(), ...searchHistory.filter(item => item !== debouncedSearchQuery.trim())].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('publicResourcesSearchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error('Failed to load public resources:', error);
      setError('Failed to load public resources');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, filterType, searchHistory]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  // Select from search history
  const selectFromHistory = (historyItem) => {
    setSearchQuery(historyItem);
    setShowSuggestions(false);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('publicResourcesSearchHistory');
  };

//  console.log(resources); 

  const [interacting, setInteracting] = useState(null);

  const updateResourceCounts = (resourceId, counts) => {
    if (!counts) return;
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, likes: counts.likes ?? r.likes, dislikes: counts.dislikes ?? r.dislikes } : r));
  };

  const handleInteraction = async (resourceId, actionType, reason = null) => {
    try {
      setInteracting(resourceId);
      const res = await interactWithResource(resourceId, actionType, reason);
      const counts = res?.counts;
      if (counts) updateResourceCounts(resourceId, counts);
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

  const handleResourceClick = (resource) => {
    const isPdf = (resource.platform && resource.platform.toLowerCase() === 'pdf') ||
                  (resource.type && resource.type.toLowerCase() === 'pdf');

    if (isPdf) {
      setSelectedPdf({
        url: resource.review_source,
        title: resource.filename
      });
      setPdfModalOpen(true);
    } else {
      // For links, open in new tab
      window.open(resource.review_source, '_blank');
    }
  };

  // Filter resources based on selected segment
  const filteredResources = resources.filter(r => {
    if (filterType === 'all') return true;
    if (filterType === 'pdf') return (r.platform && r.platform.toLowerCase() === 'pdf') || (r.type && r.type.toLowerCase() === 'pdf');
    if (filterType === 'link') return !((r.platform && r.platform.toLowerCase() === 'pdf') || (r.type && r.type.toLowerCase() === 'pdf'));
    return true;
  });

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
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Submit Resource
          </Button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && searchHistory.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Recent Searches</span>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => selectFromHistory(item)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Search Status */}
        {(isSearching || isTyping) && (
          <div className="mt-2 text-sm text-blue-600 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
            {isTyping ? 'Typing...' : 'Searching...'}
          </div>
        )}

        {/* Search Stats */}
        {searchStats.total > 0 && !isSearching && !isTyping && (
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {searchStats.total} resource{searchStats.total !== 1 ? 's' : ''} found
            </span>
            {debouncedSearchQuery && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Search: "{debouncedSearchQuery}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* --- SEGMENTED CONTROL: All / PDFs / Links --- */}
      <div className="mt-4">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 ">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${filterType === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            aria-pressed={filterType === 'all'}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('pdf')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${filterType === 'pdf' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            aria-pressed={filterType === 'pdf'}
          >
            PDFs
          </button>
          <button
            onClick={() => setFilterType('link')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${filterType === 'link' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            aria-pressed={filterType === 'link'}
          >
            Links
          </button>
        </div>
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
        // console.log(resources),
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
            // console.log(resource),
            
            <Card
              key={resource.id}
              className="group hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-indigo-200"
              onClick={() => handleResourceClick(resource)}
              
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
                  {/* <p className="text-xs text-gray-500 mt-1">
                    {resource.platform} • {resource.likes} 👍 • {resource.dislikes} 👎
                  </p> */}
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p className="text-sm text-black line-clamp-3 leading-relaxed">
                    {resource.description || 'No description provided.'}
                   
                  </p>
                </div>

                {/* Interaction Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <LikeButton resourceId={resource.id} initial={resource.likes} onCounts={(c) => updateResourceCounts(resource.id, c)} />
                    <DislikeButton resourceId={resource.id} initial={resource.dislikes} onCounts={(c) => updateResourceCounts(resource.id, c)} />
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
                  {((resource.platform && resource.platform.toLowerCase() === 'pdf') || (resource.type && resource.type.toLowerCase() === 'pdf')) ? 'View PDF' : 'Open Link'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfModalOpen}
        onClose={() => {
          setPdfModalOpen(false);
          setSelectedPdf(null);
        }}
        pdfUrl={selectedPdf?.url}
        title={selectedPdf?.title}
      />
    </div>
  );
};

export default PublicResources;

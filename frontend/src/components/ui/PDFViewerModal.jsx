import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import Button from './Button';

const PDFViewerModal = ({ isOpen, onClose, pdfUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setLoading(true);
      setError(null);
    }
  }, [isOpen, pdfUrl]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. The file may not be accessible or may have CORS restrictions.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] max-w-none max-h-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {title || 'PDF Viewer'}
          </h2>
          <div className="flex items-center gap-2">
            {/* <Button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Download PDF"
            >
              <Download size={20} />
            </Button> */}
            {/* <Button
              onClick={handleOpenExternal}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </Button> */}
            <Button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Close"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden p-2 bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-red-600 mb-4">
                <p className="text-xl font-medium">Error loading PDF</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                  }}
                  className="bg-gray-600 text-white hover:bg-gray-700 px-6 py-2"
                >
                  Retry
                </Button>
                <Button
                  onClick={handleOpenExternal}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2"
                >
                  Open Externally
                </Button>
              </div>
            </div>
          )}

          {!error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 rounded"
              onLoad={handleLoad}
              onError={handleError}
              title={title || 'PDF Document'}
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;
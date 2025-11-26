import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input'
import { submitLink, submitPdf } from '../../api/resourcesAPI';

const SubmitResource = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const data = await submitLink(url, description);
      setSuccess(data.message || 'Link submitted successfully for verification!');
      setUrl('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting link:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setUrl('');
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endswith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const data = await submitPdf(file, description);
      setSuccess(data.message || 'PDF submitted successfully for verification!');
      setFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting PDF:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/dashboard/public-resources')}
          className="mb-4 bg-gray-500 hover:bg-gray-600 text-white"
        >
          ← Back to Public Library
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Submit Resource</h1>
        <p className="text-gray-500 mt-1">Share study materials with the community for verification and approval.</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span>✅</span>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'link'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 Submit Link
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'pdf'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📄 Upload PDF
        </button>
      </div>

      {/* Link Submission Form */}
      {activeTab === 'link' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Submit External Link</h2>
          <form onSubmit={handleLinkSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Resource URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full"
              />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: YouTube videos, articles, blog posts, etc.
                </p>
              <div>
                <label htmlFor="link-desc" className="block text-sm font-medium text-gray-700 mt-3">Description (optional)</label>
                <textarea id="link-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-2 p-2 border rounded" placeholder="Add a short description about the link or its relevance" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Link for Verification'}
            </Button>
          </form>
        </Card>
      )}

      {/* PDF Upload Form */}
      {activeTab === 'pdf' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload PDF Document</h2>
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 10MB. Only PDF files are accepted.
              </p>
            </div>
            {file && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            <div>
              <label htmlFor="pdf-desc" className="block text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea id="pdf-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full mt-2 p-2 border rounded" placeholder="Add a short description about the PDF content" />
            </div>
            <Button
              type="submit"
              disabled={submitting || !file}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? 'Uploading...' : 'Upload PDF for Verification'}
            </Button>
          </form>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All submissions are reviewed by administrators before being published</li>
          <li>• Ensure content is educational and appropriate for study purposes</li>
          <li>• Links should be publicly accessible and not behind paywalls</li>
          <li>• PDFs should be clear, readable, and relevant to academic topics</li>
          <li>• You'll receive a notification once your submission is approved</li>
        </ul>
      </Card>
    </div>
  );
};

export default SubmitResource;

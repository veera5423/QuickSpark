import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import Button from '../ui/Button';

const RequestProModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const submitRequest = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await axiosClient.post('/api/users/request-pro', { message });
      setStatus({ type: 'success', text: 'Request sent. Admins have been notified.' });
      setMessage('');
      // Close immediately on success
      try {
        onClose();
      } catch (e) {
        console.error('Error closing modal:', e);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err?.response?.data?.message || 'Failed to send request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Request Pro Access</h3>
        <p className="text-sm text-gray-600 mb-4">Send a short note to admins explaining why you need Pro access.</p>
        <textarea
          className="w-full border rounded p-2 mb-3 min-h-[90px]"
          placeholder="Optional message to admins"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex items-center justify-end space-x-2">
          <button
            className="px-3 py-1 rounded bg-gray-100 text-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <Button onClick={submitRequest} disabled={loading}>
            {loading ? 'Sending...' : 'Request Pro'}
          </Button>
        </div>
        {status && (
          <div className={`mt-3 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestProModal;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { authAPI } from '../../api/authAPI';
import { Mail, Loader2, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword({ email });
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Note: The outer div styling is assumed to be handled by AuthLayout wrapper
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        
        {/* Error Display (Enhanced) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm text-center font-medium shadow-sm flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> {error}
          </div>
        )}
        
        {/* Success Message Display (Enhanced) */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium shadow-sm flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2" /> {message}
          </div>
        )}

        <div className="space-y-4">
          <Input
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your registered email"
            icon={Mail} 
          />
        </div>

        {/* Primary Submission Button (Enhanced) */}
        <Button 
          type="submit" 
          disabled={loading} 
          fullWidth 
          className="bg-indigo-600 hover:bg-indigo-700 text-lg py-2.5 font-bold shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending Link...
            </span>
          ) : 'Send reset link'}
        </Button>

        {/* Link back to login (Enhanced Typography) */}
        <div className="pt-2 text-center">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1"/> Back to sign in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;
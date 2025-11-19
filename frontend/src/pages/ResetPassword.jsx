import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authAPI } from '../api/authAPI';
import { Lock, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract token from query params or path (Robust approach)
  const token = searchParams.get('token') || window.location.pathname.split('/reset-password/')[1];

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link: Token is missing.');
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        await authAPI.verifyResetToken(token);
        setTokenValid(true);
      } catch {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, { password });
      setMessage(response.data.message || 'Password updated successfully. Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Token Verification/Error State ---
  if (!tokenValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl text-center border border-gray-200">
          {error ? (
            <>
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <Link to="/forgot-password">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Request New Link
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="mt-4 text-gray-600 font-medium">Verifying reset link...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Render Password Reset Form ---
  return (
    // Note: This component is assumed to be wrapped by AuthLayout for the centering and background.
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* AuthLayout's inner Card equivalent */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your reset link is valid. Enter a new secure password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm text-center font-medium shadow-sm flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium shadow-sm flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" /> {message}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="password"
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new secure password (min 6 chars)"
              icon={Lock}
              minLength={6}
            />
            <Input
              type="password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              icon={Lock}
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || !tokenValid} 
            fullWidth 
            className="bg-indigo-600 hover:bg-indigo-700 text-lg py-2.5 font-bold shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating Password...
              </span>
            ) : 'Update password'}
          </Button>
          
          <div className="text-center pt-2">
            <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
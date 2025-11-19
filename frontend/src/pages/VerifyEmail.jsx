import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authAPI } from '../api/authAPI';
import { Loader2, CheckCircle, XCircle, LogIn, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Start countdown timer after successful verification
    if (message && !error) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, error]);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('Invalid verification link: Token is missing.');
      setLoading(false);
    }
  }, [token, navigate]);

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700">Verifying your email address...</p>
        </div>
      </div>
    );
  }

  // --- Render Result State (Success or Error) ---
  const isSuccess = !error && message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* AuthLayout's inner Card equivalent */}
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-2xl border border-gray-200 text-center">
        
        {isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verification Successful!</h2>
            <p className="text-lg text-green-700 font-medium mb-6">{message}</p>
            
            <p className="text-sm text-gray-500 mb-4 flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2"/> Your account is now fully active.
            </p>

            <Button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-2.5 font-bold shadow-lg">
                <LogIn className="w-5 h-5 mr-2" /> Go to Login ({countdown})
            </Button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-lg text-red-700 font-medium mb-6">{error}</p>
            
            <p className="text-sm text-gray-600 mb-4">
                Please ensure you clicked the latest link sent to your email.
            </p>

            <Link to="/register" className="w-full block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-2.5 font-bold shadow-lg">
                    Re-register or Log In
                </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../ui/Button';
import { Lock, LogIn, UserPlus, Clock } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  // State to track countdown
  const [countdown, setCountdown] = React.useState(3);

  useEffect(() => {
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      clearInterval(countdownInterval);
      navigate('/login');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl border border-red-200">
        <div className="text-center">
          
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need to be <b>authenticated</b> to view the dashboard. Please sign in to continue your learning session.
          </p>
          
          <div className="space-y-4">
            
            <Link to="/login" className="block">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold shadow-lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In Now
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
                <UserPlus className="w-4 h-4 mr-1 inline-block" />
                Sign up here
              </Link>
            </p>

            {/* Redirection Countdown */}
            <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-sm text-red-500 flex items-center justify-center font-medium">
                    <Clock className="w-4 h-4 mr-2 animate-pulse" />
                    Redirecting to login in {countdown} seconds...
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
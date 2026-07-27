import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card'; // Card is assumed to be part of the layout wrapper
import { authAPI } from '../api/authAPI';
import { Lock, Mail, Loader2, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Google OAuth Initialization ---
  useEffect(() => {
    // Ensure the Google script is loaded and the environment variable is available
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      // Render the button directly into the div
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { 
          theme: "outline", // Use a filled theme for better visibility
          size: "large",
          width: "100%", // Ensure the button spans the full width
          text: "signin_with" ,
          type:"standard"
          
        }
      );
    }
  }, []);

  // --- Google Callback Handler (Unchanged Logic) ---
  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/google/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.access_token, { username: data.username });
        navigate('/dashboard');
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Email/Password Submission Handler 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      await login(response.data.access_token, { username: response.data.username });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Note: This component is assumed to be wrapped by AuthLayout for the centering and background.
    <>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Welcome back</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Sign in to continue
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Access your learning dashboard and pick up where you left off.
        </p>
      </div>

      {/* Backend Wake-up Notice */}
      <div className="mt-2 flex items-start gap-3 bg-cyan-50 border border-cyan-200/70 rounded-2xl px-4 py-2 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-cyan-600" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed text-cyan-800">
          <span className="font-semibold">Heads up!</span> The backend is hosted on Render's free tier — it may take{' '}
          <span className="font-semibold underline decoration-cyan-400/50">a few seconds</span> to wake up after inactivity.
          Feel free to{' '}
          <Link to="/" className="font-semibold text-cyan-700 hover:text-cyan-800 underline decoration-cyan-400/50">
            explore other features
          </Link>{' '}
          while you wait!
        </div>
      </div>

      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        
        {/* Error Display (Enhanced) */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center font-medium shadow-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@example.com"
            icon={Mail} 
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            icon={Lock} 
          />
        </div>

        {/* Primary Login Button (Enhanced) */}
        <Button 
          type="submit" 
          disabled={loading} 
          fullWidth 
          className="bg-slate-900 hover:bg-slate-800 text-lg py-2.5 font-bold shadow-lg shadow-slate-900/10 -mb-1"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing in...
            </span>
          ) : 'Sign in with Email'}
        </Button>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">
              OR
            </span>
          </div>
        </div>
        
        {/* Google OAuth Button */}
        <div id="googleBtn" className="mt-4" >
          {/* Google button will render here, styled to fit the full width */}
        </div>

        {/* Links (Enhanced Typography) */}
        <div className=" space-y-2 text-center">
          <Link to="/forgot-password" className="text-sm font-medium text-slate-700 hover:text-slate-950 block">
            Forgot your password?
          </Link>
          <p className="text-sm text-slate-600">
            Don't have an account? {' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Login;
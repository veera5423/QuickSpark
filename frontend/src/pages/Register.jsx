import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card'; // Card is assumed to be part of the layout wrapper
import { authAPI } from '../api/authAPI';
import { User, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Google OAuth Initialization ---
  useEffect(() => {
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      // Render the button, styled to match the login page enhancement
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtnRegister"),
        { 
          theme: "filled_blue", 
          size: "large",
          width: "100%",
          text: "signup_with" 
        }
      );
    }
  }, []);

  // --- Google Callback Handler (Unchanged Logic) ---
  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/google/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.access_token, { username: data.username });
        navigate('/dashboard');
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch {
      setError('Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Form Submission Handler (Unchanged Logic) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        username: formData.name,
        email: formData.email,
        password: formData.password
        ,
        gender: formData.gender || undefined
      });
      setMessage(response.data.message || 'Registration successful! Please check your email or spam to verify your account.');
      
      // Optional: Clear form data after successful registration
      setFormData({ name: '', email: '', password: '', confirmPassword: '', gender: '' });

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  return (
    // Note: This component is assumed to be wrapped by AuthLayout
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Start Your AI Learning Journey
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Create your free account in seconds.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        
        {/* Error Display (Enhanced) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm text-center font-medium shadow-sm">
            {error}
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
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={(e)=>{setFormData({...formData, name: e.target.value})}}
            required
            placeholder="Enter your full name"
            icon={User}
          />
          <Input
            type="email"
            name="email"
            label="Email address"
            value={formData.email}
            onChange={(e)=>{setFormData({...formData, email: e.target.value})}}
            required
            placeholder="your.email@example.com"
            icon={Mail}
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all bg-white"
            >
              <option value="">Select gender (optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              
            </select>
          </div>
          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={(e)=>{setFormData({...formData, password: e.target.value})}}
            required
            placeholder="Enter a secure password"
            icon={Lock}
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e)=>{setFormData({...formData, confirmPassword: e.target.value})}}
            required
            placeholder="Confirm your password"
            icon={Lock}
          />
        </div>

        {/* Primary Register Button (Enhanced) */}
        <Button 
          type="submit" 
          disabled={loading} 
          fullWidth 
          className="bg-indigo-600 hover:bg-indigo-700 text-lg py-2 font-bold shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating account...
            </span>
          ) : 'Create account'}
        </Button>

        {/* Separator */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              OR
            </span>
          </div>
        </div>
        
        {/* Google OAuth Button */}
        <div id="googleBtnRegister" className="mt-2">
          {/* Google button will render here, styled to fit the full width */}
        </div>

        {/* Link to Login (Enhanced Typography) */}
        <div className=" text-center">
          <p className="text-sm text-gray-600">
            Already have an account? {' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Register;
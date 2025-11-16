import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import  {useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authAPI } from '../api/authAPI';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtnRegister"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google/login`, {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      });
      setMessage(response.data.message || 'Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-center text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-600 text-center text-sm">
              {message}
            </div>
          )}
          <div className="space-y-4">
            <Input
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={(e) =>setFormData({...formData, name: e.target.value})}
              required
              placeholder="Enter your full name"
            />
            <Input
              type="email"
              name="email"
              label="Email address"
              value={formData.email}
              onChange={(e) =>setFormData({...formData, email: e.target.value})}
              required
              placeholder="Enter your email"
            />
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={(e) =>setFormData({...formData, password: e.target.value})}
              required
              placeholder="Enter your password"
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>setFormData({...formData, confirmPassword: e.target.value})}
              required
              placeholder="Confirm your password"
            />
          </div>

          <Button type="submit" disabled={loading} fullWidth className="mt-6">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="mt-4">
            <div id="googleBtnRegister"></div>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Register;

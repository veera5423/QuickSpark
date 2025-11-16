import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    resources: 0,
    quizzes: 0,
    attempts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);
  // console.log(user);
  

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [resourcesRes, quizzesRes, attemptsRes] = await Promise.all([
        axiosClient.get('/api/resources/'),
        axiosClient.get('/api/quiz/get-quizzes'),
        axiosClient.get('/api/quiz/get-attempts')
      ]);

      setStats({
        resources: resourcesRes.data.resources?.length || 0,
        quizzes: quizzesRes.data.quizzes?.length || 0,
        attempts: attemptsRes.data.attempts?.length || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user || 'User'}!
        </h1>
        <p className="text-lg text-gray-600">
          Ready to enhance your learning journey with AI-powered tools?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {loading ? '...' : stats.resources}
          </div>
          <div className="text-gray-600">Resources Uploaded</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {loading ? '...' : stats.quizzes}
          </div>
          <div className="text-gray-600">Quizzes Generated</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {loading ? '...' : stats.attempts}
          </div>
          <div className="text-gray-600">Quiz Attempts</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => window.location.href = '/dashboard/resources'}
            className="h-20 flex flex-col items-center justify-center text-center"
          >
            <span className="text-lg font-semibold">📚 Upload Resources</span>
            <span className="text-sm">Add PDFs for AI summarization</span>
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard/mock-tests'}
            className="h-20 flex flex-col items-center justify-center text-center"
          >
            <span className="text-lg font-semibold">🧠 Generate Quizzes</span>
            <span className="text-sm">Create AI-powered tests</span>
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard/mock-tests'}
            className="h-20 flex flex-col items-center justify-center text-center"
          >
            <span className="text-lg font-semibold">📊 View Progress</span>
            <span className="text-sm">Track your learning journey</span>
          </Button>
        </div>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Upload Learning Materials</h3>
              <p className="text-gray-600">Upload PDF documents to get AI-powered summaries and quiz generation.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-semibold">Generate Quizzes</h3>
              <p className="text-gray-600">Create customized quizzes with different difficulty levels and question counts.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-semibold">Track Your Progress</h3>
              <p className="text-gray-600">Take quizzes, view detailed results, and monitor your learning progress over time.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;

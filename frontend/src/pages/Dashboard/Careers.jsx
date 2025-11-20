import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

// --- Helper Functions (Unchanged Logic) ---

const analyzeCareerReadiness = (attempts) => {
  if (attempts.length === 0) return null;

  const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  const averageScore = totalScore / attempts.length;

  const recentAttempts = attempts.slice(0, 5);
  const recentAverage = recentAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / recentAttempts.length;

  const improvementBase = attempts.length > 5 ?
    attempts.slice(5, 10).reduce((sum, attempt) => sum + (attempt.score || 0), 0) / Math.min(5, attempts.length - 5) :
    recentAverage;
    
  const improvement = recentAverage - improvementBase;

  const consistency = attempts.length >= 3 ?
    Math.round(100 - (attempts.reduce((variance, attempt, index, arr) => {
      if (index === 0) return variance;
      return variance + Math.abs(attempt.score - arr[index - 1].score);
    }, 0) / (attempts.length - 1))) : 0;

  return {
    averageScore: Math.round(averageScore),
    recentAverage: Math.round(recentAverage),
    improvement: Math.round(improvement),
    consistency: consistency,
    totalAttempts: attempts.length
  };
};

const getCareerRecommendations = (analysis) => {
  if (!analysis) return [];

  const recommendations = [];
  const score = analysis.averageScore;

  // Primary Role Recommendation
  if (score >= 80) {
    recommendations.push({
      title: "Advanced Technical Roles",
      description: "Ready for roles like **Senior Developer, Technical Lead, or Solutions Architect**.",
      icon: "🚀",
      color: "green",
    });
  } else if (score >= 70) {
    recommendations.push({
      title: "Mid-Level Technical Positions",
      description: "Target roles like **Full-Stack Developer, DevOps Engineer, or System Analyst**.",
      icon: "💼",
      color: "blue"
    });
  } else if (score >= 60) {
    recommendations.push({
      title: "Junior Technical Roles",
      description: "Focus on entry-level positions like **Junior Developer or QA Engineer**.",
      icon: "🌱",
      color: "yellow"
    });
  } else {
    recommendations.push({
      title: "Skill Development Focus",
      description: "Continue **building foundational knowledge** before pursuing technical roles.",
      icon: "📚",
      color: "orange"
    });
  }

  // Secondary Performance Insights
  if (analysis.improvement > 10) {
    recommendations.push({
      title: "Rapid Skill Growth",
      description: "Your improvement rate suggests strong learning ability—great for dynamic roles.",
      icon: "📈",
      color: "green"
    });
  } else if (analysis.improvement < -5) {
    recommendations.push({
      title: "Reviewing Recent Attempts",
      description: "Check recent attempts for consistency. Revisit fundamental concepts.",
      icon: "⚠️",
      color: "orange"
    });
  }

  if (analysis.consistency > 85) {
    recommendations.push({
      title: "Consistent Performer",
      description: "Your steady performance indicates **reliability**—valuable for critical systems roles.",
      icon: "🎯",
      color: "blue"
    });
  }

  return recommendations;
};

// --- Component Start ---

const Careers = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/quiz/get-attempts');
      // Sort attempts by a relevant date/time if available, or just assume the server returns it sorted
      setAttempts(response.data.attempts?.sort((a, b) => new Date(b.date) - new Date(a.date)) || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
      setError('Failed to load career insights');
    } finally {
      setLoading(false);
    }
  };

  const analysis = analyzeCareerReadiness(attempts);
  const recommendations = getCareerRecommendations(analysis);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-blue-600">Analyzing career readiness...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-300 rounded-lg">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Button onClick={loadAttempts} className="mt-4 bg-red-500 hover:bg-red-700">
          Try Again
        </Button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementIcon = (improvement) => {
    if (improvement > 0) return '↑';
    if (improvement < 0) return '↓';
    return '—';
  };

  const MetricCard = ({ icon, title, value, unit, colorClass, trend }) => (
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-4xl font-extrabold ${colorClass} flex items-center`}>
        {trend && (
          <span className={`mr-2 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {getImprovementIcon(value)}
          </span>
        )}
        {Math.abs(value)}
        <span className="text-xl ml-1 font-medium">{unit}</span>
      </div>
      <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">{title}</div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-3">
        Career Insights 🎯
      </h1>

      {attempts.length === 0 ? (
        <Card>
          {/* Card content remains similar but with updated styling for more impact */}
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-7xl mb-6 animate-pulse">🌟</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">No Career Data Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Complete your first mock tests or quizzes to unlock personalized career insights and recommendations.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/mock-tests'} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              Start Building Your Profile
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Career Readiness Score - Enhanced Metrics */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Performance Snapshot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon="⭐"
                title="Overall Score"
                value={analysis.averageScore}
                unit="%"
                colorClass={getScoreColor(analysis.averageScore)}
              />

              <MetricCard
                icon="📊"
                title="Recent Average"
                value={analysis.recentAverage}
                unit="%"
                colorClass="text-blue-600"
              />

              <MetricCard
                icon="📈"
                title="Improvement Trend"
                value={analysis.improvement}
                unit="%"
                colorClass={analysis.improvement > 0 ? 'text-green-600' : 'text-red-600'}
                trend={analysis.improvement > 0 ? 'up' : analysis.improvement < 0 ? 'down' : 'flat'}
              />

              <MetricCard
                icon="🔗"
                title="Consistency"
                value={analysis.consistency}
                unit="%"
                colorClass="text-purple-600"
              />
            </div>
          </Card>

          {/* Career Recommendations - Enhanced Look */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Recommended Career Paths</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-5 bg-white rounded-xl shadow-lg border border-gray-200 flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold 
                    ${rec.color === 'green' ? 'bg-green-100 text-green-600' :
                      rec.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      rec.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-orange-100 text-orange-600'}
                  `}>
                    {rec.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">{rec.title}</h3>
                    <p className="text-sm mt-0.5 text-gray-600">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Development Plan - Roadmap Look */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Skill Development Roadmap</h2>
            <div className="relative space-y-8 pl-10">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {[
                { step: 1, title: "Continue Regular Practice", description: "Maintain consistent quiz attempts to build and reinforce knowledge.", color: "blue", icon: "🗓️" },
                { step: 2, title: "Challenge Yourself", description: "Gradually increase difficulty levels and tackle new topics as your scores improve.", color: "green", icon: "⛰️" },
                { step: 3, title: "Track Weak Areas", description: "Review incorrect answers and focus study time on improving specific weak topics.", color: "purple", icon: "🔍" },
                { step: 4, title: "Apply Knowledge", description: "Connect quiz topics to real-world applications and practical coding scenarios.", color: "orange", icon: "💡" },
              ].map(({ step, title, description, color, icon }) => (
                <div key={step} className="flex items-start">
                  {/* Timeline Bullet */}
                  <div className={`absolute left-0 w-9 h-9 ${color === 'blue' ? 'bg-blue-600' : color === 'green' ? 'bg-green-600' : color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}>
                    {icon}
                  </div>
                  <div className="ml-6 pt-1">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <p className="text-gray-600 mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Steps - Enhanced Buttons */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Your Next Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => window.location.href = '/dashboard/mock-tests'}
                className="h-20 flex flex-col items-center justify-center text-center bg-blue-500 hover:bg-blue-600 transition duration-150 transform hover:scale-[1.02]"
              >
                <span className="text-xl font-bold">📝 Take Another Quiz</span>
                <span className="text-sm opacity-90 mt-1">Challenge yourself and refine your skills</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard/skills'}
                className="h-20 flex flex-col items-center justify-center text-center bg-gray-400 text-gray-800 hover:bg-gray-700 transition duration-150 transform hover:scale-[1.02]"
              >
                <span className="text-xl font-bold">📊 View Detailed Progress</span>
                <span className="text-sm opacity-90 mt-1">Analyze your performance trends and weak areas</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Careers;
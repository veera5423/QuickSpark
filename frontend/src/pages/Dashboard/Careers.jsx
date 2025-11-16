import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

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
      setAttempts(response.data.attempts || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
      setError('Failed to load career insights');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCareerReadiness = () => {
    if (attempts.length === 0) return null;

    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = totalScore / attempts.length;

    const recentAttempts = attempts.slice(0, 5);
    const recentAverage = recentAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / recentAttempts.length;

    const improvement = recentAverage - (attempts.length > 5 ?
      attempts.slice(5, 10).reduce((sum, attempt) => sum + (attempt.score || 0), 0) / Math.min(5, attempts.length - 5) :
      recentAverage);

    const consistency = attempts.length >= 3 ?
      100 - (attempts.reduce((variance, attempt, index, arr) => {
        if (index === 0) return variance;
        return variance + Math.abs(attempt.score - arr[index - 1].score);
      }, 0) / (attempts.length - 1)) : 0;

    return {
      averageScore: Math.round(averageScore),
      recentAverage: Math.round(recentAverage),
      improvement: Math.round(improvement),
      consistency: Math.round(consistency),
      totalAttempts: attempts.length
    };
  };

  const getCareerRecommendations = (analysis) => {
    if (!analysis) return [];

    const recommendations = [];

    if (analysis.averageScore >= 80) {
      recommendations.push({
        title: "Advanced Technical Roles",
        description: "Consider roles like Senior Developer, Technical Lead, or Solutions Architect",
        icon: "🚀",
        color: "green"
      });
    } else if (analysis.averageScore >= 70) {
      recommendations.push({
        title: "Mid-Level Technical Positions",
        description: "Roles like Full-Stack Developer, DevOps Engineer, or System Analyst",
        icon: "💼",
        color: "blue"
      });
    } else if (analysis.averageScore >= 60) {
      recommendations.push({
        title: "Junior Technical Roles",
        description: "Entry-level positions like Junior Developer or QA Engineer",
        icon: "🌱",
        color: "yellow"
      });
    } else {
      recommendations.push({
        title: "Skill Development Focus",
        description: "Continue building foundational knowledge before pursuing technical roles",
        icon: "📚",
        color: "orange"
      });
    }

    if (analysis.improvement > 10) {
      recommendations.push({
        title: "Rapid Skill Growth",
        description: "Your improvement rate suggests strong learning ability - great for dynamic roles",
        icon: "📈",
        color: "green"
      });
    }

    if (analysis.consistency > 80) {
      recommendations.push({
        title: "Consistent Performer",
        description: "Your steady performance indicates reliability - valuable for critical systems roles",
        icon: "🎯",
        color: "blue"
      });
    }

    return recommendations;
  };

  const analysis = analyzeCareerReadiness();
  const recommendations = getCareerRecommendations(analysis);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Analyzing career readiness...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadAttempts} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Career Insights</h1>

      {attempts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No Career Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Complete some quizzes to get personalized career insights and recommendations.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/mock-tests'}>
              Start Building Your Profile
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Career Readiness Score */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Career Readiness Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  analysis.averageScore >= 70 ? 'text-green-600' :
                  analysis.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.averageScore}%
                </div>
                <div className="text-gray-600">Overall Score</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysis.recentAverage}%
                </div>
                <div className="text-gray-600">Recent Performance</div>
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  analysis.improvement > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.improvement > 0 ? '+' : ''}{analysis.improvement}%
                </div>
                <div className="text-gray-600">Improvement Trend</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analysis.consistency}%
                </div>
                <div className="text-gray-600">Consistency</div>
              </div>
            </div>
          </Card>

          {/* Career Recommendations */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Recommended Career Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 border-l-4 ${
                  rec.color === 'green' ? 'border-green-400 bg-green-50' :
                  rec.color === 'blue' ? 'border-blue-400 bg-blue-50' :
                  rec.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
                  'border-orange-400 bg-orange-50'
                } rounded-r-lg`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className={`text-sm mt-1 ${
                        rec.color === 'green' ? 'text-green-700' :
                        rec.color === 'blue' ? 'text-blue-700' :
                        rec.color === 'yellow' ? 'text-yellow-700' :
                        'text-orange-700'
                      }`}>
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Development Plan */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Skill Development Roadmap</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Continue Regular Practice</h3>
                  <p className="text-gray-600">Maintain consistent quiz attempts to build and reinforce knowledge.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Challenge Yourself</h3>
                  <p className="text-gray-600">Gradually increase difficulty levels as your scores improve.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Track Weak Areas</h3>
                  <p className="text-gray-600">Review incorrect answers and focus on improving weak topics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold">Apply Knowledge</h3>
                  <p className="text-gray-600">Connect quiz topics to real-world applications and practical scenarios.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.location.href = '/dashboard/mock-tests'}
                className="h-16 flex flex-col items-center justify-center text-center"
              >
                <span className="text-lg font-semibold">📝 Take Another Quiz</span>
                <span className="text-sm">Continue building your skills</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard/skills'}
                className="h-16 flex flex-col items-center justify-center text-center"
              >
                <span className="text-lg font-semibold">📊 View Detailed Progress</span>
                <span className="text-sm">Analyze your performance trends</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Careers;

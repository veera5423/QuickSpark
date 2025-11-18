import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { quizAPI } from '../../api/quizAPI';
import { careerAPI } from '../../api/careerAPI';

const Skills = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSkills, setCompletedSkills] = useState([]);
  const [showAllAttempts, setShowAllAttempts] = useState(false);

  useEffect(() => {
    loadAttempts();
    loadCompletedSkills();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAttempts();
      setAttempts(data.attempts || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
      setError('Failed to load skill progress');
    } finally {
      setLoading(false);
    }
  };
console.log(completedSkills);

  const loadCompletedSkills = async () => {
    try {
      const data = await quizAPI.getCompletedSkills();
      const skillIds = data.completed_skill_ids || [];

      // Fetch skill details for each completed skill
      const skillDetails = await Promise.all(
        skillIds.map(async (skillId) => {
          try {
            const skillData = await careerAPI.getSkillDetails(skillId);
            return skillData;
          } catch (error) {
            console.error(`Failed to fetch skill ${skillId}:`, error);
            return { _id: skillId, skill_name: 'Unknown Skill', category: 'Unknown' };
          }
        })
      );
// console.log(skillDetails)
      setCompletedSkills(skillDetails);
    } catch (error) {
      console.error('Failed to load completed skills:', error);
    }
  };

  const calculateSkillProgress = () => {
    if (attempts.length === 0) return null;

    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = totalScore / attempts.length;

    const difficultyStats = attempts.reduce((stats, attempt) => {
      const difficulty = attempt.difficulty || 'unknown';
      if (!stats[difficulty]) {
        stats[difficulty] = { total: 0, count: 0 };
      }
      stats[difficulty].total += attempt.score || 0;
      stats[difficulty].count += 1;
      return stats;
    }, {});

    return {
      averageScore: Math.round(averageScore),
      totalAttempts: attempts.length,
      difficultyStats
    };
  };

  const progress = calculateSkillProgress();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading skill progress...</div>
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
      <h1 className="text-3xl font-bold">Skills & Progress</h1>

      {attempts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Quiz Attempts Yet</h3>
            <p className="text-gray-600 mb-6">
              Start taking quizzes to track your learning progress and skill development.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/mock-tests'}>
              Take Your First Quiz
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Overall Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {progress.averageScore}%
              </div>
              <div className="text-gray-600">Average Score</div>
            </Card>

            <Card className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {progress.totalAttempts}
              </div>
              <div className="text-gray-600">Total Attempts</div>
            </Card>

            <Card className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Object.keys(progress.difficultyStats).length}
              </div>
              <div className="text-gray-600">Difficulty Levels</div>
            </Card>

            <Card className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {completedSkills.length}
              </div>
              <div className="text-gray-600">Completed Skills</div>
            </Card>
          </div>

          {/* Difficulty Breakdown */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Performance by Difficulty</h2>
            <div className="space-y-4">
              {Object.entries(progress.difficultyStats).map(([difficulty, stats]) => {
                const average = Math.round(stats.total / stats.count);
                return (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium capitalize">{difficulty}</span>
                        <span className="text-sm text-gray-600">
                          {average}% ({stats.count} attempts)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${average}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Completed Skills */}
          {completedSkills.length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold mb-4">Completed Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedSkills.map((skill) => (
                  <div key={skill._id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-2">✓</div>
                      <div>
                        <h4 className="font-medium text-green-800">{skill.skill_name}</h4>
                        <p className="text-sm text-green-600">{skill.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Attempts */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Recent Quiz Attempts</h2>
            <div className="space-y-3">
              {(showAllAttempts ? attempts : attempts.slice(0, 3)).map((attempt, index) => (
                <div key={attempt._id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      Quiz Attempt #{attempts.length - index}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(attempt.created_at).toLocaleDateString()} •
                      Difficulty: {attempt.difficulty || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      (attempt.score || 0) >= 70 ? 'text-green-600' :
                      (attempt.score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {attempt.score || 0}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {attempt.score >= 70 ? 'Excellent' :
                       attempt.score >= 50 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {attempts.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => setShowAllAttempts(!showAllAttempts)}
                  variant={showAllAttempts ? "outline" : "default"}
                  size="sm"
                >
                  {showAllAttempts ? 'Show Less' : 'View More'}
                </Button>
              </div>
            )}
          </Card>

          {/* Improvement Tips */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Improvement Tips</h2>
            <div className="space-y-3">
              {progress.averageScore < 50 && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                  <p className="text-red-700">
                    <strong>Focus on fundamentals:</strong> Consider reviewing basic concepts and taking easier quizzes to build confidence.
                  </p>
                </div>
              )}
              {progress.averageScore >= 50 && progress.averageScore < 70 && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-yellow-700">
                    <strong>Good progress:</strong> You're on the right track! Try medium difficulty quizzes to challenge yourself further.
                  </p>
                </div>
              )}
              {progress.averageScore >= 70 && (
                <div className="p-4 bg-green-50 border-l-4 border-green-400">
                  <p className="text-green-700">
                    <strong>Excellent work:</strong> You're performing well! Try hard difficulty quizzes to continue advancing your skills.
                  </p>
                </div>
              )}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-blue-700">
                  <strong>Consistent practice:</strong> Regular quiz attempts help reinforce learning. Aim for at least 2-3 quizzes per week.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Skills;

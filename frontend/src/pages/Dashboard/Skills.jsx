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

  // Helper to get color class based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  useEffect(() => {
    loadAttempts();
    loadCompletedSkills();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAttempts();
      // Sort attempts to ensure recent ones are at the top
      setAttempts(data.attempts?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
      setError('Failed to load skill progress');
    } finally {
      setLoading(false);
    }
  };

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
      const difficulty = attempt.difficulty ? attempt.difficulty.toLowerCase() : 'unknown';
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
        <div className="text-xl font-semibold text-blue-600">Loading skill progress...</div>
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

  const MetricCard = ({ icon, title, value, unit, colorClass }) => (
    <Card className="text-center p-5 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5">
      <div className="text-4xl mb-2">{icon}</div>
      <div className={`text-4xl font-extrabold ${colorClass} mb-1`}>
        {value}
        <span className="text-xl font-medium ml-1">{unit}</span>
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</div>
    </Card>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-3">
        Skills & Progress 🧠
      </h1>

      {attempts.length === 0 ? (
        <Card>
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-7xl mb-6">💡</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">No Learning Data Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start taking quizzes to track your learning journey, skill gaps, and development progress.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/mock-tests'} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              Take Your First Quiz
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Overall Progress - Enhanced Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
              icon="⭐"
              title="Average Score"
              value={progress.averageScore}
              unit="%"
              colorClass={getScoreColor(progress.averageScore).split(' ')[0]} // Use only text color
            />

            <MetricCard
              icon="📝"
              title="Total Attempts"
              value={progress.totalAttempts}
              unit=""
              colorClass="text-green-600"
            />

            <MetricCard
              icon="🪜"
              title="Difficulty Levels"
              value={Object.keys(progress.difficultyStats).length}
              unit=""
              colorClass="text-purple-600"
            />

            <MetricCard
              icon="✅"
              title="Completed Skills"
              value={completedSkills.length}
              unit=""
              colorClass="text-orange-600"
            />
          </div>

          {/* Difficulty Breakdown - Enhanced Progress Bars */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Performance by Difficulty</h2>
            <div className="space-y-6">
              {Object.entries(progress.difficultyStats).map(([difficulty, stats]) => {
                const average = Math.round(stats.total / stats.count);
                const barColor = difficulty === 'hard' ? 'bg-red-500' : difficulty === 'medium' ? 'bg-orange-500' : 'bg-green-500';

                return (
                  <div key={difficulty}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold capitalize text-lg text-gray-700">{difficulty}</span>
                      <span className={`text-lg font-bold ${getScoreColor(average).split(' ')[0]}`}>
                        {average}%
                        <span className="text-sm font-normal text-gray-500 ml-2">({stats.count} attempts)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${barColor} h-3 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${average}%` }}
                        role="progressbar"
                        aria-valuenow={average}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Completed Skills - Enhanced Card Layout */}
          {completedSkills.length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Completed Skills Certificates ({completedSkills.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedSkills.map((skill) => (
                  <div key={skill._id} className="p-4 bg-white border border-green-300 rounded-xl shadow-md flex items-center space-x-3">
                    <div className="text-2xl text-green-600">🏆</div>
                    <div>
                      <h4 className="font-bold text-green-800">{skill.skill_name}</h4>
                      <p className="text-sm text-green-600">Category: {skill.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Attempts - List View Improvement */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Recent Quiz Attempts</h2>
            <div className="space-y-3">
              {(showAllAttempts ? attempts : attempts.slice(0, 3)).map((attempt, index) => {
                const score = attempt.score || 0;
                const scoreClass = getScoreColor(score);
                const resultText = score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Review Needed';

                return (
                  <div key={attempt._id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${scoreClass.replace('text-', 'border-').replace('bg-', 'bg-')}`}>
                         {score}%
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Attempt #{attempts.length - index}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(attempt.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${scoreClass}`}>
                        {resultText}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                          Difficulty: <span className="capitalize">{attempt.difficulty || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {attempts.length > 3 && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setShowAllAttempts(!showAllAttempts)}
                  className={`bg-indigo-400 text-gray-700 hover:bg-indigo-700 border border-gray-300 cursor-pointer px-4 py-2 text-sm font-semibold transition-colors`}
                >
                  {showAllAttempts ? 'Show Less Attempts (3)' : `View All ${attempts.length} Attempts`}
                </Button>
              </div>
            )}
          </Card>

          {/* Improvement Tips - Cleaner Blocks */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-700">Actionable Tips & Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.averageScore < 50 && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-md shadow-sm">
                  <h4 className="font-bold text-red-800 flex items-center"><span className="text-xl mr-2">🚨</span> Fundamentals Focus</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Review **basic concepts** thoroughly. Try taking easier quizzes to build a solid foundation before advancing.
                  </p>
                </div>
              )}
              {progress.averageScore >= 50 && progress.averageScore < 70 && (
                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-md shadow-sm">
                  <h4 className="font-bold text-yellow-800 flex items-center"><span className="text-xl mr-2">💪</span> Challenge Yourself</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're making **good progress**. Start mixing in medium-to-hard quizzes to identify and fill knowledge gaps.
                  </p>
                </div>
              )}
              {progress.averageScore >= 70 && (
                <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded-r-md shadow-sm">
                  <h4 className="font-bold text-green-800 flex items-center"><span className="text-xl mr-2">🚀</span> Advanced Training</h4>
                  <p className="text-sm text-green-700 mt-1">
                    **Excellent work!** Focus on hard difficulty and specialized quizzes to master complex topics.
                  </p>
                </div>
              )}
              <div className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded-r-md shadow-sm">
                <h4 className="font-bold text-blue-800 flex items-center"><span className="text-xl mr-2">🗓️</span> Consistent Practice</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Aim for **regular engagement** (2-3 quizzes per week) to ensure long-term knowledge retention and skill development.
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
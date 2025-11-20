// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import { quizAPI } from '../../api/quizAPI';

// const Home = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     resources: 0,
//     quizzes: 0,
//     attempts: 0
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardStats();
//   }, []);
//   // console.log(user);
  

//   const loadDashboardStats = async () => {
//     try {
//       setLoading(true);
//       const [resourcesRes, quizzesRes, attemptsRes] = await Promise.all([
//         quizAPI.getResources(),
//         quizAPI.getQuizzes(),
//         quizAPI.getAttempts()
//       ]);


//       setStats({
//         resources: resourcesRes.resources?.length || 0,
//         quizzes: quizzesRes.quizzes?.length || 0,
//         attempts: attemptsRes.attempts?.length || 0
//       });
//     } catch (error) {
//       console.error('Failed to load dashboard stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-900 mb-2">
//           Welcome back, {user || 'User'}!
//         </h1>
//         <p className="text-lg text-gray-600">
//           Ready to enhance your learning journey with AI-powered tools?
//         </p>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="text-center">
//           <div className="text-3xl font-bold text-blue-600 mb-2">
//             {loading ? '...' : stats.resources}
//           </div>
//           <div className="text-gray-600">Resources Uploaded</div>
//         </Card>

//         <Card className="text-center">
//           <div className="text-3xl font-bold text-green-600 mb-2">
//             {loading ? '...' : stats.quizzes}
//           </div>
//           <div className="text-gray-600">Quizzes Generated</div>
//         </Card>

//         <Card className="text-center">
//           <div className="text-3xl font-bold text-purple-600 mb-2">
//             {loading ? '...' : stats.attempts}
//           </div>
//           <div className="text-gray-600">Quiz Attempts</div>
//         </Card>
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <Button
//             onClick={() => window.location.href = '/dashboard/ai-summarizer'}
//             className="h-20 flex flex-col items-center justify-center text-center"
//           >
//             <span className="text-lg font-semibold">📚 Upload Resources</span>
//             <span className="text-sm">Add PDFs for AI summarization</span>
//           </Button>

//           <Button
//             onClick={() => window.location.href = '/dashboard/mock-tests'}
//             className="h-20 flex flex-col items-center justify-center text-center"
//           >
//             <span className="text-lg font-semibold">🧠 Generate Quizzes</span>
//             <span className="text-sm">Create AI-powered tests</span>
//           </Button>

//           <Button
//             onClick={() => window.location.href = '/dashboard/skills'}
//             className="h-20 flex flex-col items-center justify-center text-center"
//           >
//             <span className="text-lg font-semibold">📊 View Progress</span>
//             <span className="text-sm">Track your learning journey</span>
//           </Button>
//         </div>
//       </Card>

//       {/* Getting Started Guide */}
//       <Card>
//         <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
//         <div className="space-y-4">
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 font-semibold">1</span>
//             </div>
//             <div>
//               <h3 className="font-semibold">Upload Learning Materials</h3>
//               <p className="text-gray-600">Upload PDF documents to get AI-powered summaries and quiz generation.</p>
//             </div>
//           </div>

//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//               <span className="text-green-600 font-semibold">2</span>
//             </div>
//             <div>
//               <h3 className="font-semibold">Generate Quizzes</h3>
//               <p className="text-gray-600">Create customized quizzes with different difficulty levels and question counts.</p>
//             </div>
//           </div>

//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//               <span className="text-purple-600 font-semibold">3</span>
//             </div>
//             <div>
//               <h3 className="font-semibold">Track Your Progress</h3>
//               <p className="text-gray-600">Take quizzes, view detailed results, and monitor your learning progress over time.</p>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default Home;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quizAPI } from '../../api/quizAPI';

const Home = () => {
  const { user ,getMe} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    resourcesCount: 0,
    quizzesTaken: 0,
    avgScore: 0,
    improvement: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    getMe();
  }, []);
  console.log(user);
  

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [resourcesRes, quizzesRes, attemptsRes] = await Promise.all([
        quizAPI.getResources(),
        quizAPI.getQuizzes(),
        quizAPI.getAttempts()
      ]);

      const attempts = attemptsRes.attempts || [];
      const resources = resourcesRes.resources || [];
      const quizzes = quizzesRes.quizzes || [];

      // --- 1. Calculate Average Score ---
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const avg = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

      // --- 2. Calculate Improvement Trend (The logic we discussed) ---
      // Sort attempts by date (newest first) just in case API didn't
      const sortedAttempts = [...attempts].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      let trend = 0;
      if (sortedAttempts.length > 5) {
        const recentBatch = sortedAttempts.slice(0, 5);
        const pastBatch = sortedAttempts.slice(5, 10);

        const recentAvg = recentBatch.reduce((sum, a) => sum + a.score, 0) / recentBatch.length;
        const pastAvg = pastBatch.reduce((sum, a) => sum + a.score, 0) / pastBatch.length;
        
        trend = Math.round(recentAvg - pastAvg);
      }

      setStats({
        resourcesCount: resources.length,
        quizzesTaken: attempts.length,
        avgScore: avg,
        improvement: trend
      });

      setRecentActivity(sortedAttempts.slice(0, 3)); // Top 3 recent

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-indigo-600">{user.username || 'Student'}</span>! 👋
          </h1>
          <p className="mt-1 text-gray-500">Here is what's happening with your learning journey today.</p>
        </div>
        <div className="mt-4 md:mt-0">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
             🚀 Ready to learn
           </span>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1 */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resources</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.resourcesCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <span className="text-2xl">✍️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Quizzes Taken</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.quizzesTaken}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Score</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.avgScore}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 4: Improvement Trend */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stats.improvement >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-2xl">{stats.improvement >= 0 ? '📈' : '📉'}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Performance</dt>
                  <dd className={`text-2xl font-semibold ${stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN ACTIONS --- */}
      <h2 className="text-lg font-medium text-gray-900">Start Learning</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Action 1: Career Explorer */}
        <div 
          onClick={() => navigate('/dashboard/careers')}
          className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg cursor-pointer transform transition hover:scale-105"
        >
          <h3 className="text-xl font-bold text-white mb-2">🚀 Career Explorer</h3>
          <p className="text-indigo-100 mb-4">Find your path. View roadmaps for Frontend, Backend, AI, and more.</p>
          <span className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm">
            Explore Roles →
          </span>
        </div>

        {/* Action 2: Resources */}
        <div 
          onClick={() => navigate('/dashboard/ai-summarizer')}
          className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition"
        >
          <div className="absolute top-6 right-6 text-3xl">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">My Resources</h3>
          <p className="text-gray-500 mb-4">Upload PDFs, get AI summaries, and chat with your documents.</p>
          <span className="text-indigo-600 font-medium group-hover:underline">Go to Library →</span>
        </div>

        {/* Action 3: Skill Tracking */}
        <div 
          onClick={() => navigate('/dashboard/skills')} // Or whatever your route is
          className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition"
        >
          <div className="absolute top-6 right-6 text-3xl">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Skill Tracker</h3>
          <p className="text-gray-500 mb-4">Validate your skills with AI quizzes and earn badges.</p>
          <span className="text-indigo-600 font-medium group-hover:underline">Check Progress →</span>
        </div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="bg-white shadow rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Quiz Activity</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No quizzes taken yet. <button onClick={() => navigate('/dashboard/careers')} className="text-indigo-600 hover:underline">Start a career path!</button>
            </li>
          ) : (
            recentActivity.map((attempt) => (
              <li key={attempt._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${attempt.score >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {attempt.score >= 80 ? '🏆' : '📝'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Skill Assessment
                        {/* If you populated skill name in backend, show it here. Otherwise generic name */}
                      </p>
                      <p className="text-sm text-gray-500">
                        Score: <span className={`font-bold ${attempt.score >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{Math.round(attempt.score)}%</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(attempt.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

    </div>
  );
};

export default Home;
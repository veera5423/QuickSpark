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
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Home = () => {
  const { user, getMe } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ resourcesCount: 0, quizzesTaken: 0, avgScore: 0, improvement: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    getMe();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, quizzesRes, attemptsRes] = await Promise.all([
        quizAPI.getResources(),
        quizAPI.getQuizzes(),
        quizAPI.getAttempts(),
      ]);

      const attempts = attemptsRes.attempts || [];
      const resources = resourcesRes.resources || [];
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const avg = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;
      const sortedAttempts = [...attempts].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

      let trend = 0;
      if (sortedAttempts.length > 5) {
        const recentBatch = sortedAttempts.slice(0, 5);
        const pastBatch = sortedAttempts.slice(5, 10);
        const recentAvg = recentBatch.reduce((sum, a) => sum + a.score, 0) / recentBatch.length;
        const pastAvg = pastBatch.reduce((sum, a) => sum + a.score, 0) / pastBatch.length;
        trend = Math.round(recentAvg - pastAvg);
      }

      setStats({ resourcesCount: resources.length, quizzesTaken: attempts.length, avgScore: avg, improvement: trend });
      setRecentActivity(sortedAttempts.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Dashboard overview</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back, <span className="text-teal-300">{user?.username || 'Student'}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300 leading-7">
              Here is what is happening with your learning flow today. The layout is calmer now, so the useful parts stand out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Ready to learn</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Study progress</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Fast access</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Resources', stats.resourcesCount],
              ['Quizzes', stats.quizzesTaken],
              ['Average score', `${stats.avgScore}%`],
              ['Trend', `${stats.improvement > 0 ? '+' : ''}${stats.improvement}%`],
            ].map(([label, value]) => (
              <Card key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-none">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-black">{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Start learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card hover className="group cursor-pointer rounded-3xl border border-slate-200 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]" onClick={() => navigate('/dashboard/careers')}>
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-teal-50 px-3 py-2 text-teal-700 font-semibold">Career</div>
              <span className="text-2xl">→</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">Career Explorer</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Find roles, roadmaps, and next steps without the neon-heavy treatment.</p>
          </Card>

          <Card hover className="group cursor-pointer rounded-3xl border border-slate-200 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]" onClick={() => navigate('/dashboard/ai-summarizer')}>
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-700 font-semibold">Library</div>
              <span className="text-2xl">→</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">My Resources</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Upload PDFs, summarize them, and chat with your documents in a cleaner view.</p>
          </Card>

          <Card hover className="group cursor-pointer rounded-3xl border border-slate-200 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]" onClick={() => navigate('/dashboard/skills')}>
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 font-semibold">Progress</div>
              <span className="text-2xl">→</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">Skill Tracker</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Validate your skills with tests and see your progress at a glance.</p>
          </Card>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
          <h3 className="text-lg font-bold text-slate-950">Recent quiz activity</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/mock-tests')}>Open tests</Button>
        </div>
        <ul className="divide-y divide-slate-200">
          {recentActivity.length === 0 ? (
            <li className="px-6 py-10 text-center text-slate-500">
              No quizzes taken yet. <button onClick={() => navigate('/dashboard/careers')} className="font-semibold text-slate-900 underline-offset-4 hover:underline">Start a career path</button>.
            </li>
          ) : (
            recentActivity.map((attempt) => (
              <li key={attempt._id} className="px-6 py-4 sm:px-8 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center min-w-0">
                    <div className={`flex-shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center ${attempt.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {attempt.score >= 80 ? '🏆' : '📝'}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Skill assessment</p>
                      <p className="text-sm text-slate-500">Score: <span className={`font-bold ${attempt.score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>{Math.round(attempt.score)}%</span></p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 whitespace-nowrap">
                    {new Date(attempt.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default Home;
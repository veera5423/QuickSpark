import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle, Sparkles } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import RequestProModal from './RequestProModal';

const Navbar = () => {
  const { logout, user, getMe} = useAuth(); // Assuming 'user' object is available
  useEffect(() => {
    getMe();
  }, []); 

  const handleLogout = () => {
    // Clear token and handle redirection
    logout();
    window.location.href = '/login';
  };

  // Determine username display
  const userName = user?.username || 'User';
  // console.log(user);
  

  const layout = useLayout();
  const isExpanded = layout?.isExpanded ?? true;
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    setIsDesktop(mq.matches);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, []);

  const leftPx = isDesktop ? (isExpanded ? 256 : 80) : 0;

  return (
    <nav
      className="fixed top-0 right-0 z-30 bg-white shadow-md border-b border-gray-100 transition-all duration-300"
      style={{ left: leftPx, width: isDesktop ? `calc(100% - ${leftPx}px)` : '100%' }}
    >
      <div className="flex justify-between items-center h-16 px-6">
        
        {/* --- Brand/Title Area (Hidden on wider screens, as sidebar handles it) --- */}
        <div className="flex items-center space-x-3">
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => layout?.setIsExpanded?.(true)}
            aria-label="Open menu"
          >
            {/* simple hamburger */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/dashboard" className="text-xl font-extrabold text-indigo-600 md:hidden">
            ⚡ QuickSpark AI
          </Link>
          {/* Mobile Resume Check (visible on small screens) */}
            { (user?.is_pro_member || user?.is_admin) ? (
            <Link
              to="/dashboard/resume-check"
              title="Resume Check (Pro)"
              className="md:hidden ml-2 inline-flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs">Resume</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowRequestModal(true)}
              className="md:hidden ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-sm"
              title="Request Pro Access"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Get Pro</span>
              <span className="ml-1 inline-flex items-center justify-center bg-white/20 text-xs px-2 py-0.5 rounded-full">★</span>
            </button>
          )}
        </div>
        
        {/* --- Navigation & User Info --- */}
        <div className="hidden md:flex md:items-center md:space-x-6">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            { (user?.is_pro_member || user?.is_admin) ? (
              <Link
                to="/dashboard/resume-check"
                title="Resume Check (Pro)"
                className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-md transform transition-transform duration-150 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Resume Check</span>
                <span className="ml-2 inline-flex items-center justify-center bg-white/20 text-xs px-2 py-0.5 rounded-full">Pro</span>
              </Link>
            ) : (
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                title="Request Pro Access"
              >
                <Sparkles className="w-4 h-4" />
                <span>Request Pro</span>
              </button>
            ) }
        </div>

        <div className="flex items-center space-x-6">
          
          {/* User Profile Info */}
          <div className="hidden sm:flex items-center space-x-2 p-2 rounded-full bg-gray-50 border border-gray-200">
            <UserCircle className="w-6 h-6 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">{userName}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg px-4 py-2 transition-colors duration-150 text-sm font-medium shadow-sm"
            title="Log out of the session"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      {/* RequestPro Modal (shared) */}
      <RequestProModal isOpen={!!showRequestModal} onClose={() => setShowRequestModal(false)} />
    </nav>
  );
};

export default Navbar;
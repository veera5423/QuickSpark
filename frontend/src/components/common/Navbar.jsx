import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

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

  const layout = useLayout();
  const isExpanded = layout?.isExpanded ?? true;

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
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
        </div>
        
        {/* --- Navigation & User Info --- */}
        <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
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
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import { useEffect } from 'react';

const Navbar = () => {
  const { logout, user, getMe} = useAuth(); // Assuming 'user' object is available
  useEffect(() => {
    getMe();
  }, [user]); 

  const handleLogout = () => {
    // Clear token and handle redirection
    logout();
    window.location.href = '/login';
  };

  // Determine username display
  const userName = user || 'User';

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-20 lg:left-64 z-40 bg-white shadow-md border-b border-gray-100 transition-all duration-300">
      <div className="flex justify-between items-center h-16 px-6">
        
        {/* --- Brand/Title Area (Hidden on wider screens, as sidebar handles it) --- */}
        <Link to="/dashboard" className="text-xl font-extrabold text-indigo-600 md:hidden">
          ⚡ QuickSpark AI
        </Link>
        
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
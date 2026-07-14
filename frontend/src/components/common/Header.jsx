import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';


const Header = () => {
  const {user,logout} = useAuth();
  const [isLogin, setIsLogin] = React.useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

 

  useEffect(() => {
    // Simulate fetching user data from an API or authentication service
    if (!user) {
      // If user is not authenticated, you can redirect to login or show a message
      setIsLogin(false);

      console.log('User is not authenticated');
    }
    else {
      setIsLogin(true);
      console.log('User is authenticated:', user);
    }
    
    
  }, [user]);
  
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold text-slate-900">
          <Zap className="w-6 h-6 text-amber-500" />
          <span>QuickSpark AI</span>
        </Link>
        
        {/* Navigation/Actions */}
        {isLogin ? (
          <nav className="space-x-4 flex items-center">
            {/* <span className="text-slate-600 font-medium">Welcome, {user.username}</span> */}
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Dashboard
            </Link>
            <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-xl px-4 py-2 transition-colors duration-150 text-sm font-medium shadow-sm"
            title="Log out of the session"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          </nav>
        ) : (   
        <nav className="space-x-4 flex items-center">
          <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors hidden sm:inline-block">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-slate-900 text-white font-semibold px-4 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            Get Started Free
          </Link>
        </nav>)}
      </div>
      {/* <div className="border-t border-slate-200"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <p className="text-sm text-slate-600 text-center">
          {user ? `Logged in as ${user.username}` : 'You are not logged in.'}
        </p>
      </div> */}
    </header>
  );
};

export default Header;  
    
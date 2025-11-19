import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold text-indigo-600">
          <Zap className="w-6 h-6 text-yellow-500" />
          <span>QuickSpark AI</span>
        </Link>
        
        {/* Navigation/Actions */}
        <nav className="space-x-4 flex items-center">
          <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors hidden sm:inline-block">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Get Started Free
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
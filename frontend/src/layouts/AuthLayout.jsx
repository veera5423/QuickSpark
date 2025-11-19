import React from 'react';
import { Zap } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    // Use a deep, dark background for a modern, focused look
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 sm:p-8">
      
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <span className="flex items-center justify-center space-x-2 text-3xl font-extrabold text-indigo-400">
          <Zap className="w-8 h-8 text-yellow-300" />
          <span>QuickSpark AI</span>
        </span>
        <p className="text-sm text-gray-400 mt-1">AI-Powered Learning Platform</p>
      </div>

      {/* Card Container for the Auth Form */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.01] border border-gray-200">
        {children}
      </div>
      
      {/* Footer text */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} QuickSpark AI. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
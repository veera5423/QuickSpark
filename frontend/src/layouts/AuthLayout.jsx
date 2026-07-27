import React from 'react';
import { Zap } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#ecfeff_38%,_#f8fafc_100%)] p-4 sm:p-8">
      
      {/* Logo/Brand */}
      <div className="mb-7 text-center">
        <span className="flex items-center justify-center space-x-2 text-3xl font-extrabold text-slate-900">
          <Zap className="w-8 h-8 text-amber-500" />
          <span>QuickSpark AI</span>
        </span>
        <p className="text-sm text-slate-500 mt-1">AI-powered learning platform</p>
      </div>

      {/* Card Container for the Auth Form */}
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_24px_70px_rgba(15,23,42,0.14)] transition-all duration-300 border border-white/70">
        {children}
      </div>
      
      {/* Footer text */}
      <div className="mt-8 text-sm text-slate-500 text-center">
        &copy; {new Date().getFullYear()} QuickSpark AI. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
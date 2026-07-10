import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10 pb-8 mb-8">
          
          {/* Brand/Mission */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3">QuickSpark AI</h3>
            <p className="text-sm">
              Revolutionizing learning with AI-powered tools for faster understanding and better retention.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-us" className="hover:text-amber-300 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-amber-300 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Contact</Link></li>
              <li><Link to="/pricing" className="hover:text-amber-300 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard/ai-summarizer" className="hover:text-amber-300 transition-colors">AI Summarizer</Link></li>
              <li><Link to="/dashboard/mock-tests" className="hover:text-amber-300 transition-colors">Mock Tests</Link></li>
              <li><Link to="/dashboard/skills" className="hover:text-amber-300 transition-colors">Skill Tracking</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-amber-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-amber-300 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} QuickSpark AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
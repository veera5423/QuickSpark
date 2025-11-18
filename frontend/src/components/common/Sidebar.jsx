import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 w-80 h-screen bg-gray-800 text-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold">Menu</h2>
        <ul className="mt-4 space-y-2">
          <li><Link to="/dashboard" className="block p-2 hover:bg-gray-700">Home</Link></li>
          <li><Link to="/dashboard/ai-summarizer" className="block p-2 hover:bg-gray-700">🤖 AI Summarizer</Link></li>
          <li><Link to="/dashboard/resources" className="block p-2 hover:bg-gray-700">Resources</Link></li>
          <li><Link to="/dashboard/mock-tests" className="block p-2 hover:bg-gray-700">Mock Tests</Link></li>
          <li><Link to="/dashboard/skills" className="block p-2 hover:bg-gray-700">Skills</Link></li>
          <li><Link to="/dashboard/careers" className="block p-2 hover:bg-gray-700">Careers</Link></li>
          <li><Link to="/dashboard/career-explorer" className="block p-2 hover:bg-gray-700">Career Explorer</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

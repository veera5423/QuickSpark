import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Navbar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear token from localStorage and redirect to login
    logout();
    window.location.href = '/login';
    
  }
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="#" className="text-xl font-bold">⚡ Quick Spark</Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="#" onClick={handleLogout} className="hover:underline">LogOut</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

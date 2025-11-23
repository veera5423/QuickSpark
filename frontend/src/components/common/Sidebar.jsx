import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Bot, Layers, TrendingUp, Briefcase, Zap, Menu, X, Library, Upload, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

// Define the navigation items and their icons
const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Resources', path: '/dashboard/resources', icon: FileText },
    { name: 'Public Library', path: '/dashboard/public-resources', icon: Library },
    { name: 'AI Summarizer', path: '/dashboard/ai-summarizer', icon: Bot },
    { name: 'Mock Tests', path: '/dashboard/mock-tests', icon: Zap },
    { name: 'Skill Progress', path: '/dashboard/skills', icon: Layers },
    { name: 'Career Insights', path: '/dashboard/careers', icon: TrendingUp },
    { name: 'Career Explorer', path: '/dashboard/career-explorer', icon: Briefcase },
];

const Sidebar = () => {
    const { pathname } = useLocation();
    const layout = useLayout();
    // If used inside a LayoutProvider, use shared state; otherwise fallback to local state
    const [localExpanded, setLocalExpanded] = useState(true);
    const isExpanded = layout?.isExpanded ?? localExpanded;
    const setIsExpanded = layout?.setIsExpanded ?? setLocalExpanded;
    const {user,getMe}=useAuth()
    useEffect(() => {
      if (!user) {
        getMe();
      }
    }, []);
    

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const UserName = user?.username || "UserName"
    const isAdmin = user?.is_admin; // Assuming user object has is_admin field
    const isPremium = user?.is_premium; // Assuming user object has is_premium field

    return (
        <>
            {/* Mobile Header/Toggle Button */}
            <div className="fixed top-0 left-0 z-50 w-full bg-gray-900 md:hidden p-3 shadow-lg flex justify-between items-center">
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-extrabold text-indigo-400">QuickSpark AI</span>
                <button onClick={toggleSidebar} className="text-white p-1 rounded-md hover:bg-gray-700">
                    {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Desktop/Tablet */}
            <div 
                className={`fixed top-0 z-50 h-screen bg-gray-900 text-white transition-all duration-300 shadow-2xl overflow-y-auto ${
                    isExpanded ? 'w-64' : 'w-20'
                } ${isExpanded ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-0`}
                style={{ paddingTop: '5rem' }} // Space for potential fixed top header
            >
                {/* Logo/Brand Area */}
                <div className={`p-5 mb-6 border-b border-gray-700 ${isExpanded ? 'block' : 'hidden'} flex`}>
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="text-2xl font-extrabold text-indigo-400 tracking-wider">QuickSpark AI</span>
                </div>
                
                {/* Desktop Toggle Button */}
                <button 
                    onClick={toggleSidebar}
                    className="absolute top-4 right-4 hidden md:block text-gray-400 p-2 rounded-full hover:bg-gray-700 transition duration-150"
                    title={isExpanded ? "Collapse Menu" : "Expand Menu"}
                >
                    {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <ul className="mt-2 space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const IconComponent = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-xl transition-colors duration-150 group ${
                                        isActive 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <IconComponent className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                                    <span 
                                        className={`font-semibold overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
                                            isExpanded ? 'opacity-100' : 'opacity-0 absolute left-20'
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                    
                    {/* Admin Panel - conditionally rendered */}
                    {isAdmin && (
                        <li>
                            <Link
                                to="/dashboard/admin"
                                className={`flex items-center p-3 rounded-xl transition-colors duration-150 group ${
                                    pathname === '/dashboard/admin'
                                        ? 'bg-red-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <Shield className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                                <span 
                                    className={`font-semibold overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
                                        isExpanded ? 'opacity-100' : 'opacity-0 absolute left-20'
                                    }`}
                                >
                                    Admin Panel
                                </span>
                            </Link>
                        </li>
                    )}
                </ul>
                
                {/* Placeholder for Profile/Footer info */}
                <div className={`absolute bottom-0 p-4 border-t border-gray-700 w-full ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-center text-sm text-gray-400">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full mr-3 flex items-center justify-center font-bold">U</div>
                        <div>
                            <p className="text-white font-semibold">{UserName}</p>
                            <p>{isAdmin ? 'Admin' : isPremium ? 'Premium' :'Genaral'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Overlay (Darkens background when sidebar is open) */}
            {isExpanded && (
                <div 
                    onClick={toggleSidebar} 
                    className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
                ></div>
            )}
        </>
    );
};

export default Sidebar;

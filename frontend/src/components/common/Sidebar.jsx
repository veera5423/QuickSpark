import React, { useState, useEffect, useMemo } from 'react';
import RequestProModal from './RequestProModal';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Bot, Layers, TrendingUp, Briefcase, Zap, Menu, X, Library, Mic, Shield, Sparkles, LogOut as LogOutIcon, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const Sidebar = () => {
    const { pathname } = useLocation();
    const layout = useLayout();
    const [localExpanded, setLocalExpanded] = useState(true);
    const isExpanded = layout?.isExpanded ?? localExpanded;
    const setIsExpanded = layout?.setIsExpanded ?? setLocalExpanded;
    const { user, getMe, logout } = useAuth();

    useEffect(() => {
        if (!user) getMe();
    }, []);

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const userName = user?.username || 'User';
    const isAdmin = user?.is_admin;
    const isPremium = user?.is_pro_member;

    const navItems = useMemo(() => {
        const baseItems = [
            { name: 'Dashboard', path: '/dashboard', icon: Home },
            { name: 'My Resources', path: '/dashboard/resources', icon: FileText },
            { name: 'Study Rooms', path: '/dashboard/rooms', icon: Users },
            { name: 'Public Library', path: '/dashboard/public-resources', icon: Library },
            { name: 'AI Summarizer', path: '/dashboard/ai-summarizer', icon: Bot },
        ];

        if (isPremium || isAdmin) {
            baseItems.push({ name: 'Resume Check', path: '/dashboard/resume-check', icon: Sparkles, isPro: true });
            baseItems.push({ name: 'Voice Interview', path: '/dashboard/voice-interview', icon: Mic, isPro: true });
        }

        baseItems.push(
            { name: 'Mock Tests', path: '/dashboard/mock-tests', icon: Zap },
            { name: 'Skill Progress', path: '/dashboard/skills', icon: Layers },
            { name: 'Career Insights', path: '/dashboard/careers', icon: TrendingUp },
            { name: 'Career Explorer', path: '/dashboard/career-explorer', icon: Briefcase }
        );

        if (!isPremium && !isAdmin) {
            baseItems.push({ name: 'Pro Features', path: '/dashboard/pro-features', icon: Sparkles });
        }

        return baseItems;
    }, [isPremium, isAdmin]);

    return (
        <>
            <div className="fixed top-0 left-0 z-50 w-full bg-slate-950 md:hidden p-3 shadow-lg flex justify-between items-center border-b border-white/10">
                <Zap className="w-6 h-6 text-amber-400" />
                <Link to="/" className="text-xl font-extrabold text-white cursor-pointer">QuickSpark AI</Link>
                <div className="flex items-center space-x-2">
                    {!isPremium && !isAdmin && (
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="mr-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold shadow-sm"
                            title="Request Pro Access"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs">Get Pro</span>
                            <span className="ml-1 inline-flex items-center justify-center bg-white/20 text-xs px-2 py-0.5 rounded-full">★</span>
                        </button>
                    )}

                    <button
                        onClick={() => { try { logout(); } catch {} window.location.href = '/login'; }}
                        className="text-white p-1 rounded-md hover:bg-white/10"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOutIcon className="w-5 h-5" />
                    </button>

                    <button onClick={toggleSidebar} className="text-white p-1 rounded-md hover:bg-white/10">
                        {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div
                className={`fixed top-0 z-50 h-screen bg-slate-950 text-white transition-all duration-300 shadow-2xl overflow-y-auto border-r border-white/10 ${
                    isExpanded ? 'w-64' : 'w-20'
                } ${isExpanded ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-0`}
                style={{ paddingTop: '3rem' }}
            >
                <div className={`p-4 mb-6 border-b border-white/10 ${isExpanded ? 'block' : 'hidden'} flex`}>
                    <Zap className="w-6 h-6 text-amber-400" />
                    <Link to="/" className="text-2xl font-extrabold text-white tracking-wider">QuickSpark AI</Link>
                </div>

                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 right-4 hidden md:block text-slate-300 p-2 rounded-full hover:bg-white/10 transition duration-150"
                    title={isExpanded ? 'Collapse Menu' : 'Expand Menu'}
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
                                    className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-150 group ${
                                        isActive ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                    } ${item.isPro ? 'bg-gradient-to-r from-slate-700 to-teal-600 sm:hidden' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <IconComponent className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                                        <span className={`font-semibold overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 absolute left-20'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    {item.isPro && isExpanded && (
                                        <span className="ml-2 inline-flex items-center justify-center bg-white/15 text-xs px-2 py-0.5 rounded-full font-bold">
                                            PRO
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}

                    {isAdmin && (
                        <li>
                            <Link
                                to="/dashboard/admin"
                                className={`flex items-center p-3 rounded-xl transition-colors duration-150 group ${
                                    pathname === '/dashboard/admin' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Shield className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                                <span className={`font-semibold overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 absolute left-20'}`}>
                                    Admin Panel
                                </span>
                            </Link>
                        </li>
                    )}
                </ul>

                <div className={`absolute bottom-0 p-4 border-t border-white/10 w-full ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-center text-sm text-slate-400">
                        <div className="w-8 h-8 bg-teal-500 rounded-full mr-3 flex items-center justify-center font-bold text-white">U</div>
                        <div>
                            <p className="text-white font-semibold">{userName}</p>
                            <p>{isAdmin ? 'Admin' : isPremium ? 'Premium' : 'General'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div onClick={toggleSidebar} className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"></div>
            )}

            <RequestProModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
        </>
    );
};

export default Sidebar;

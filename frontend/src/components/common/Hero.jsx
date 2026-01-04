import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Header from './Header'; // Assumed enhanced Header
import Footer from './Footer'; // Assumed enhanced Footer
import { Bot, Zap, Layers, FileText, Users, Map } from 'lucide-react';
import MessageBanner from './MessageBanner';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

const Hero = () => {
    const {getMe}=useAuth();
    useEffect(() => {
        getMe();
    }, []);
    // Helper component for uniform feature display
    const FeatureCard = ({ icon: Icon, title, description, color }) => (
        <Card className={`p-4 sm:p-6 text-center shadow-xl border-t-4 border-${color}-500 transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl`}>
            <div className={`text-3xl sm:text-4xl mb-3 sm:mb-4 mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-600`}>
                <Icon className="w-6 h-6 sm:w-8 sm:h-8"/>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{title}</h3>
            <p className="text-sm sm:text-base text-gray-600">{description}</p>
        </Card>
    );

    return (
        <div className="min-h-screen pt-16 bg-gray-50 font-sans">
            <Header />

                <MessageBanner/>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                
                {/* --- 1. Main Hero Section (Large, High-Impact Call to Action) --- */}
                <section className="text-center pt-8 pb-12 sm:pt-12 sm:pb-20 bg-white rounded-2xl sm:rounded-3xl shadow-2xl mb-12 sm:mb-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight">
                            Master Any Topic with <span className="text-indigo-600">AI-Powered Learning</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10">
                            Revolutionize your study habits with instant summaries, custom mock tests, skill tracking, resume analysis, community resources, and career guidance—all powered by advanced generative AI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                            <Button
                                onClick={() => window.location.href = '/register'}
                                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-base sm:text-lg font-bold shadow-xl transition-transform duration-150 transform hover:-translate-y-1"
                            >
                                Start Learning Free
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => window.location.href = '/login'}
                                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-indigo-600 border border-indigo-400 hover:bg-indigo-50 text-base sm:text-lg font-bold"
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </section>

                {/* --- 2. Features Overview (Grid) --- */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-10 text-center">Your Study Superpowers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <FeatureCard
                            icon={Bot}
                            title="AI Summarization"
                            description="Upload any document (PDF, TXT, etc.) and instantly get clear, concise summaries and key takeaways."
                            color="blue"
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Smart Mock Tests"
                            description="Generate customized quizzes on demand from your uploaded materials or specific skills, complete with difficulty control."
                            color="green"
                        />
                        <FeatureCard
                            icon={Layers}
                            title="Skill & Career Tracking"
                            description="Monitor your mastery, identify weak areas, and get personalized career path recommendations based on your performance."
                            color="purple"
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Resume Checker"
                            description="Upload your resume and get AI-powered analysis against job descriptions to improve your chances of landing interviews."
                            color="red"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Public Resources"
                            description="Access a community-driven library of learning materials, tutorials, and resources shared by other learners."
                            color="orange"
                        />
                        <FeatureCard
                            icon={Map}
                            title="Career Explorer"
                            description="Discover detailed career roadmaps for Frontend, Backend, AI, DevOps, and more with step-by-step learning paths."
                            color="teal"
                        />
                    </div>
                </section>

                {/* --- 3. How It Works (Timeline) --- */}
                <section className="bg-white p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-10 text-center">Your Simple Path to Mastery</h2>
                    
                    <div className="relative max-w-3xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200 hidden sm:block"></div>

                        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                            {[
                                { step: 1, title: "Upload Your Materials", description: "Securely upload your learning resources (notes, PDFs, articles) to your private library.", color: "indigo", icon: "📄" },
                                { step: 2, title: "AI Processes Content", description: "Our AI analyzes the structure and concepts, preparing it for summarization and quiz generation.", color: "teal", icon: "🤖" },
                                { step: 3, title: "Learn & Test", description: "Instantly chat with your document, take personalized tests, and review detailed explanations.", color: "orange", icon: "📝" },
                                { step: 4, title: "Track & Master", description: "View progress reports, identify mastery levels, and receive focused study tips.", color: "pink", icon: "📈" },
                                { step: 5, title: "Analyze Your Resume", description: "Get AI-powered feedback on your resume against specific job descriptions to boost your career prospects.", color: "red", icon: "📋" },
                                { step: 6, title: "Explore & Share", description: "Access community resources, discover career paths, and contribute to the learning community.", color: "green", icon: "🌐" },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start sm:relative pl-12 sm:pl-0">
                                    {/* Step Icon/Number */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg font-extrabold shadow-lg absolute left-0 top-0 sm:static sm:mr-6">
                                        <span className={`text-white bg-indigo-600 w-full h-full rounded-full flex items-center justify-center border-4 border-white`}>
                                            {item.step}
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl flex-1 border border-gray-200 shadow-sm">
                                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 flex items-center">
                                            <span className="mr-2 text-xl sm:text-2xl">{item.icon}</span>{item.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- 4. Final Call to Action --- */}
                <section className="text-center pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
                    <Card className="p-6 sm:p-8 lg:p-10 bg-indigo-400 text-gray-800 shadow-2xl">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4">Ready to Spark Your Potential?</h2>
                        <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Unlock a smarter way to study. Create your free account in seconds and start mastering your curriculum today.
                        </p>
                        <Button
                            onClick={() => window.location.href = '/register'}
                            className="px-8 sm:px-10 lg:px-12 py-3 sm:py-4 bg-indigo-600 text-white hover:bg-gray-100 text-lg sm:text-xl hover:text-indigo-700 font-bold shadow-2xl transition-transform duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                        >
                            Join QuickSpark AI
                        </Button>
                    </Card>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default Hero;
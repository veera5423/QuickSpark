import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Header from './Header'; // Assumed enhanced Header
import Footer from './Footer'; // Assumed enhanced Footer
import { Bot, Zap, Layers } from 'lucide-react';

const Hero = () => {
    // Helper component for uniform feature display
    const FeatureCard = ({ icon: Icon, title, description, color }) => (
        <Card className={`p-6 text-center shadow-xl border-t-4 border-${color}-500 transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl`}>
            <div className={`text-4xl mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-600`}>
                <Icon className="w-8 h-8"/>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </Card>
    );

    return (
        <div className="min-h-screen pt-16 bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* --- 1. Main Hero Section (Large, High-Impact Call to Action) --- */}
                <section className="text-center pt-12 pb-20 bg-white rounded-3xl shadow-2xl mb-16">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Master Any Topic with <span className="text-indigo-600">AI-Powered Learning</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            Revolutionize your study habits with instant summaries, custom mock tests, and actionable skill tracking—all powered by advanced generative AI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => window.location.href = '/register'}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl transition-transform duration-150 transform hover:-translate-y-1"
                            >
                                Start Learning Free
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => window.location.href = '/login'}
                                className="px-10 py-4 bg-white text-indigo-600 border border-indigo-400 hover:bg-indigo-50 text-lg font-bold"
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </section>

                {/* --- 2. Features Overview (Grid) --- */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Your Study Superpowers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    </div>
                </section>

                {/* --- 3. How It Works (Timeline) --- */}
                <section className="bg-white p-12 rounded-3xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Your Simple Path to Mastery</h2>
                    
                    <div className="relative max-w-3xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200 hidden sm:block"></div>

                        <div className="space-y-12">
                            {[
                                { step: 1, title: "Upload Your Materials", description: "Securely upload your learning resources (notes, PDFs, articles) to your private library.", color: "indigo", icon: "📄" },
                                { step: 2, title: "AI Processes Content", description: "Our AI analyzes the structure and concepts, preparing it for summarization and quiz generation.", color: "teal", icon: "🤖" },
                                { step: 3, title: "Learn & Test", description: "Instantly chat with your document, take personalized tests, and review detailed explanations.", color: "orange", icon: "📝" },
                                { step: 4, title: "Track & Master", description: "View progress reports, identify mastery levels, and receive focused study tips.", color: "pink", icon: "📈" },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start sm:relative pl-12 sm:pl-0">
                                    {/* Step Icon/Number */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg font-extrabold shadow-lg absolute left-0 top-0 sm:static sm:mr-6">
                                        <span className={`text-white bg-indigo-600 w-full h-full rounded-full flex items-center justify-center border-4 border-white`}>
                                            {item.step}
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-200 shadow-sm">
                                        <h3 className="font-bold text-xl text-gray-900 mb-1 flex items-center">
                                            <span className="mr-2 text-2xl">{item.icon}</span>{item.title}
                                        </h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- 4. Final Call to Action --- */}
                <section className="text-center pt-16 pb-12">
                    <Card className="p-10 bg-indigo-600 text-white shadow-2xl">
                        <h2 className="text-4xl font-extrabold mb-4">Ready to Spark Your Potential?</h2>
                        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                            Unlock a smarter way to study. Create your free account in seconds and start mastering your curriculum today.
                        </p>
                        <Button
                            onClick={() => window.location.href = '/register'}
                            className="px-12 py-4 bg-white text-indigo-700 hover:bg-gray-100 text-xl font-bold shadow-2xl transition-transform duration-150 transform hover:-translate-y-0.5"
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
import React, { useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Header from './Header';
import Footer from './Footer';
import { Bot, Zap, Layers, FileText, Users, Map, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import MessageBanner from './MessageBanner';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
    const { getMe } = useAuth();

    useEffect(() => {
        getMe();
    }, []);

    const features = [
        { icon: Bot, title: 'AI Summarization', description: 'Upload documents and get clear summaries instantly.', accent: 'bg-teal-50 text-teal-700' },
        { icon: Zap, title: 'Smart Mock Tests', description: 'Turn study material into focused tests with practical feedback.', accent: 'bg-amber-50 text-amber-700' },
        { icon: Layers, title: 'Skill Tracking', description: 'See where you are strong and where to improve without clutter.', accent: 'bg-slate-100 text-slate-700' },
        { icon: FileText, title: 'Resume Analyser', description: 'Review your resume against job descriptions with a sharper lens.', accent: 'bg-emerald-50 text-emerald-700' },
        { icon: Mic, title: 'Voice Interview', description: 'Practice responses out loud and review your interview rhythm.', accent: 'bg-cyan-50 text-cyan-700' },
        { icon: Users, title: 'Public Resources', description: 'Access a community library that feels organized, not noisy.', accent: 'bg-orange-50 text-orange-700' },
    ];

    const steps = [
        { step: '1', title: 'Upload your materials', description: 'Add notes, PDFs, or articles to your private workspace.' },
        { step: '2', title: 'Let the AI structure it', description: 'Summaries, quizzes, and recommendations are prepared automatically.' },
        { step: '3', title: 'Study and practice', description: 'Chat with documents, take tests, and refine your knowledge.' },
        { step: '4', title: 'Track progress over time', description: 'Keep the momentum visible with focused learning metrics.' },
    ];

    return (
        <div className="min-h-screen pt-16 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_20%,_#f8fafc_100%)] font-sans">
            <Header />
            <MessageBanner />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <section className="relative overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] mb-12 sm:mb-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.14),_transparent_28%)]" />
                    <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] p-6 sm:p-10 lg:p-14 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
                                <Sparkles className="h-4 w-4" /> Clean learning workspace
                            </span>
                            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.05]">
                                Study faster with a calmer product experience.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-8 text-slate-600">
                                QuickSpark brings summaries, quizzes, interviews, resume review, and community resources into one organized workspace that does not look like a generic AI demo.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Button onClick={() => window.location.href = '/register'} className="px-6 sm:px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-base sm:text-lg font-bold">
                                    Start learning free
                                </Button>
                                <Button variant="outline" onClick={() => window.location.href = '/login'} className="px-6 sm:px-8 py-3.5 text-base sm:text-lg font-bold">
                                    Sign in
                                </Button>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
                                {['No cluttered visuals', 'Fast study flow', 'Clear focus'].map((item) => (
                                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-teal-600" /> {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] bg-slate-950 p-5 sm:p-6 text-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-sm text-slate-400">Study dashboard</p>
                                    <h3 className="text-xl font-bold">Your workspace at a glance</h3>
                                </div>
                                <div className="rounded-2xl bg-teal-500/15 px-3 py-2 text-teal-300 text-sm font-semibold">Live</div>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Summaries', '12 ready'],
                                    ['Quizzes', '8 generated'],
                                    ['Resume checks', '4 reviewed'],
                                    ['Interview practice', '3 sessions'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl bg-white/5 p-4 border border-white/10">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                                        <p className="mt-2 text-xl font-bold text-white">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-10 text-center">Core product areas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {features.map((feature) => {
                            const IconComponent = feature.icon;
                            return (
                                <Card key={feature.title} className="p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${feature.accent}`}>
                                        <IconComponent className="h-4 w-4" /> Feature
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold text-slate-950">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="bg-white p-6 sm:p-8 lg:p-12 rounded-[2rem] border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.08)] mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-10 text-center">How it works</h2>
                    <div className="grid gap-4 max-w-4xl mx-auto">
                        {steps.map((item) => (
                            <div key={item.step} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-lg">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg sm:text-xl text-slate-950 mb-1">{item.title}</h3>
                                    <p className="text-sm sm:text-base text-slate-600 leading-7">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="text-center pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
                    <Card className="p-6 sm:p-8 lg:p-10 bg-slate-950 text-white shadow-2xl rounded-[2rem]">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4">Ready to switch to a cleaner study experience?</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Create your account and use the product without the usual purple-heavy AI look.
                        </p>
                        <Button onClick={() => window.location.href = '/register'} className="px-8 sm:px-10 lg:px-12 py-3 sm:py-4 bg-teal-500 text-slate-950 hover:bg-teal-400 text-lg sm:text-xl font-bold shadow-2xl transition-transform duration-150 transform hover:-translate-y-0.5 cursor-pointer">
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
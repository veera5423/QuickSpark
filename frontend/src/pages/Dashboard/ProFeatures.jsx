import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Mic, FileText, Sparkles, Zap, CheckCircle } from 'lucide-react';
import RequestProModal from '../../components/common/RequestProModal';
import { useState } from 'react';

const ProFeatures = () => {
  const [showProModal, setShowProModal] = useState(false);

  const proFeatures = [
    {
      icon: Mic,
      title: 'Voice Interview Practice',
      description: 'Practice real job interviews with AI-powered voice interaction. Get personalized questions based on your target role and receive instant feedback on your responses.',
      benefits: ['Real-time voice interaction', 'Customizable job parameters', 'Instant AI feedback', 'Progress tracking']
    },
    {
      icon: FileText,
      title: 'Advanced Resume Analysis',
      description: 'Upload your resume and get comprehensive AI analysis against specific job descriptions. Identify gaps, improve keywords, and boost your interview chances.',
      benefits: ['Job-specific analysis', 'Keyword optimization', 'ATS compatibility check', 'Detailed improvement suggestions']
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support from our team. Access beta features and provide direct feedback on new developments.',
      benefits: ['24/7 priority support', 'Beta feature access', 'Direct developer communication', 'Feature request priority']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Premium features</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Unlock your <span className="text-teal-600">Pro potential</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Take your learning to the next level with premium tools for interviews, resumes, and focused practice.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] p-6 sm:p-8 lg:p-10 items-center">
          <div>
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">Limited time access</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Move faster with a cleaner Pro toolkit.</h2>
            <p className="mt-4 text-slate-300 leading-7 max-w-2xl">
              Voice interviews, resume feedback, and priority support without the old gradient-heavy promo card style.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-white/5 px-3 py-1.5 border border-white/10">Interview practice</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 border border-white/10">Resume review</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 border border-white/10">Priority support</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 text-slate-950 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">Pro plan</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-black">$9.99</span>
              <span className="pb-1 text-slate-500">/month</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Join a better structured workspace for serious learners.</p>
            <Button onClick={() => setShowProModal(true)} className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg font-semibold">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-shadow bg-white">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="text-center p-8 rounded-[2rem] border border-slate-200 bg-slate-50">
        <Sparkles className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-950 mb-4">Ready to level up?</h3>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
          Join the Pro community and access the tools that accelerate your career growth.
        </p>
        <Button
          onClick={() => setShowProModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg font-semibold"
        >
          Get Started with Pro
        </Button>
      </Card>

      <RequestProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
};

export default ProFeatures;
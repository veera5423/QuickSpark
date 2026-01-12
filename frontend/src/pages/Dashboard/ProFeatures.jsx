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
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Unlock Your <span className="text-indigo-600">Pro Potential</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Take your learning to the next level with premium AI-powered features designed for serious students and job seekers.
        </p>
      </div>

      {/* Pricing Card */}
      <Card className="mb-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-2">Go Pro Today</h2>
          <p className="text-indigo-100 mb-6">Join thousands of successful learners</p>
          <div className="text-4xl font-bold mb-4"><strike>$9.99</strike><span className="text-lg font-normal">/month</span></div>
          <Button
            onClick={() => setShowProModal(true)}
            className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold" variant="secondary"
          >
            Upgrade to Pro
          </Button>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {proFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <Card className="text-center p-8 bg-gray-50">
        <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Level Up?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Don't let limitations hold you back. Join our Pro community and access the tools that will accelerate your career growth.
        </p>
        <Button
          onClick={() => setShowProModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-semibold"
        >
          Get Started with Pro
        </Button>
      </Card>

      <RequestProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
};

export default ProFeatures;
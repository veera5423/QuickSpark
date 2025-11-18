import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Header from './Header';
import Footer from './Footer';

const Hero = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to QuickSpark AI
            </h1>
            <p className="text-lg text-gray-600">
              Revolutionize your learning with AI-powered tools for summarization, quiz generation, and skill tracking.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">AI Summarization</h3>
              <p className="text-gray-600">Upload PDFs and get intelligent summaries powered by advanced AI.</p>
            </Card>

            <Card className="text-center">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">Smart Quizzes</h3>
              <p className="text-gray-600">Generate customized quizzes with different difficulty levels and track progress.</p>
            </Card>

            <Card className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor your learning journey with detailed analytics and skill assessments.</p>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="text-center">
            <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of learners who are enhancing their knowledge with AI-powered educational tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/register'}
                className="px-8 py-3"
              >
                Start Learning Free
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/login'}
                className="px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </Card>

          {/* How It Works */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Upload Your Materials</h3>
                  <p className="text-gray-600">Upload PDF documents or paste text content for AI processing.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">AI Processes Content</h3>
                  <p className="text-gray-600">Our AI analyzes and summarizes your content, generating relevant quizzes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Learn & Track Progress</h3>
                  <p className="text-gray-600">Take quizzes, view detailed feedback, and monitor your learning progress.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hero;

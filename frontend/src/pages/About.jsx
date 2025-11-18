import React from 'react';
import Card from '../components/ui/Card';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About QuickSpark AI</h1>
            <p className="text-xl text-gray-600">
              Empowering learners with cutting-edge AI technology for personalized education
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At QuickSpark AI, we believe that education should be accessible, personalized, and powered by the latest
              advancements in artificial intelligence. Our mission is to revolutionize the way people learn by providing
              intelligent tools that adapt to individual learning styles and pace.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We combine the power of AI with educational best practices to create a learning experience that's not just
              effective, but also engaging and enjoyable for everyone.
            </p>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Summarization</h3>
              <p className="text-gray-600">
                Transform lengthy documents into concise, meaningful summaries that capture the essential information.
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-3">Intelligent Quiz Generation</h3>
              <p className="text-gray-600">
                Create customized quizzes with varying difficulty levels that adapt to your learning progress.
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Progress Analytics</h3>
              <p className="text-gray-600">
                Track your learning journey with detailed analytics and insights to optimize your study habits.
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Skill Assessment</h3>
              <p className="text-gray-600">
                Assess and develop specific skills with targeted quizzes and personalized learning paths.
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Career Guidance</h3>
              <p className="text-gray-600">
                Explore career paths and get AI-powered recommendations based on your skills and interests.
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your learning data is protected with enterprise-grade security and privacy measures.
              </p>
            </Card>
          </div>

          {/* Technology Section */}
          <Card className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Powered by Advanced AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Natural Language Processing</h3>
                <p className="text-gray-700 mb-4">
                  Our AI understands context, meaning, and nuance in text, enabling accurate summarization and
                  intelligent question generation.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Context-aware text analysis</li>
                  <li>Multi-language support</li>
                  <li>Semantic understanding</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Machine Learning Algorithms</h3>
                <p className="text-gray-700 mb-4">
                  Adaptive algorithms learn from your interactions to provide increasingly personalized learning experiences.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Personalized difficulty adjustment</li>
                  <li>Progress prediction</li>
                  <li>Learning pattern recognition</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Team Section */}
          <Card>
            <h2 className="text-3xl font-bold mb-6 text-center">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              We envision a world where quality education is accessible to everyone, regardless of location, background,
              or schedule. By harnessing the power of AI, we're making personalized, effective learning a reality for
              millions of learners worldwide.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

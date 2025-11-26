import React from 'react';
import Card from '../ui/Card';
import Header from './Header';
import Footer from './Footer';

const AboutUs = () => {
  return (
    <div>
      <Header />
      <main className="pt-20 max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">About QuickSpark AI</h1>
          <p className="mt-2 text-gray-600">Making learning faster and more effective using lightweight AI tools.</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            QuickSpark AI helps learners extract value from study materials faster — by summarizing long PDFs, generating targeted quizzes,
            and providing contextual feedback. We blend modern AI with practical UX to keep learners focused on understanding and application.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-3">What We Build</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>AI Summarizer:</strong> Condenses long documents into concise, readable summaries.</li>
            <li><strong>Quiz Generator:</strong> Produces practice questions tailored to content and difficulty.</li>
            <li><strong>Resume & Skills Tools:</strong> Provide feedback and scoring to help learners improve.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-3">Team & Values</h2>
          <p className="text-gray-700 leading-relaxed">
            We focus on privacy, accessibility, and practical utility. Our lightweight UX combined with modern ML APIs keeps
            the experience fast and affordable for students and educators.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;

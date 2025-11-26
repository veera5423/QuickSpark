import React from 'react';
import Card from '../ui/Card';
import Header from './Header';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <div>
      <Header />
      <main className="pt-20 max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-600">How QuickSpark AI collects and uses information.</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
          <p className="text-gray-700">We collect only what's necessary to provide our services: account data, files you upload (PDFs), and usage metrics. We never sell personal data.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Process uploads to generate summaries and quizzes.</li>
            <li>Store metadata and non-sensitive usage stats for improving features.</li>
            <li>Send transactional emails (verification, notifications) when you opt in.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p className="text-gray-700">We use industry-standard encryption in transit and work to secure stored files. For any security concerns, contact our support.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-700">If you have questions about privacy or want your data removed, email quickspark.1help@gmail.com.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

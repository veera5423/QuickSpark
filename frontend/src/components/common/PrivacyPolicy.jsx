import React from 'react';
import Card from '../ui/Card';
import Header from './Header';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <div>
      <Header />
      <main className="pt-20 max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Legal</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Privacy Policy</h1>
          <p className="mt-2 text-slate-600">How QuickSpark AI collects and uses information.</p>
        </div>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
          <p className="text-slate-700">We collect only what's necessary to provide our services: account data, files you upload (PDFs), and usage metrics. We never sell personal data.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Process uploads to generate summaries and quizzes.</li>
            <li>Store metadata and non-sensitive usage stats for improving features.</li>
            <li>Send transactional emails (verification, notifications) when you opt in.</li>
          </ul>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p className="text-slate-700">We use industry-standard encryption in transit and work to secure stored files. For any security concerns, contact our support.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-slate-700">If you have questions about privacy or want your data removed, email quickspark.1help@gmail.com.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

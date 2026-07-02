import React from 'react';
import Card from '../ui/Card';
import Header from './Header';
import Footer from './Footer';

const Terms = () => {
  return (
    <div>
      <Header />
      <main className="pt-20 max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Legal</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Terms of Service</h1>
          <p className="mt-2 text-slate-600">Please read these terms carefully before using QuickSpark AI.</p>
        </div>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
          <p className="text-slate-700">By accessing or using QuickSpark AI, you agree to be bound by these Terms of Service.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">User Accounts</h2>
          <p className="text-slate-700">You are responsible for maintaining the security of your account and for all activities that occur under it.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Content and Usage</h2>
          <p className="text-slate-700">You retain ownership of the content you upload. You grant QuickSpark a license to process and store uploads for providing the Service.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Limitations and Disclaimers</h2>
          <p className="text-slate-700">AI-generated results may be imperfect. QuickSpark provides tools for convenience and does not guarantee accuracy. Verify critical information independently.</p>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-slate-700">If you have questions about these Terms, contact quickspark.1help@gmail.com.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

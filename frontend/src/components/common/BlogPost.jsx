import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../ui/Card';

const POSTS = {
  'how-to-use-ai-to-summarize-pdfs': {
    title: 'How to Use AI to Summarize PDFs Effectively',
    date: '2025-11-01',
    author: 'QuickSpark Team',
    content: `AI summarization can save hours of reading time when used correctly. This article covers practical tips to get better summaries from documents such as research papers, lecture notes, and manuals.

Prepare your document: remove irrelevant front/back matter and run OCR on scans.

Prompting: provide a purpose and request a clear output structure (bullets, TL;DR, action items).

Verify: always review generated summaries and iterate with focused prompts for unclear sections.`,
  },
  'designing-effective-quizzes-with-ai': {
    title: 'Designing Effective Quizzes with AI',
    date: '2025-10-10',
    author: 'Learning Science',
    content: `Good quizzes test application, not just recall. Use AI to draft scenarios and explanations, then validate them manually before assigning to learners.`,
  },
  'career-paths-in-data-science-2025': {
    title: 'Career Paths in Data Science (2025 Edition)',
    date: '2025-09-05',
    author: 'Careers Team',
    content: `The data science landscape continues to diversify. Focus on specialization, practical projects, and continuous learning to stand out.`,
  },
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-950">Post not found</h2>
        <p className="mt-3 text-slate-600">The article you're looking for doesn't exist. <Link to="/blog" className="text-teal-700">Back to blog</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-950">{post.title}</h1>
        <div className="text-sm text-slate-500 mb-4">{post.date} • {post.author}</div>
        <div className="prose max-w-none text-slate-800">
          {post.content.split('\n\n').map((block, i) => (
            <p key={i}>{block}</p>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/blog" className="text-teal-700 hover:underline">← Back to blog</Link>
        </div>
      </Card>
    </div>
  );
};

export default BlogPost;

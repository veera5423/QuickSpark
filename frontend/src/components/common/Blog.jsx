import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';

const posts = [
  {
    slug: 'how-to-use-ai-to-summarize-pdfs',
    title: 'How to Use AI to Summarize PDFs Effectively',
    date: '2025-11-01',
    author: 'QuickSpark Team',
    excerpt:
      'Learn best practices for preparing PDFs, choosing the right prompts, and reviewing model summaries so you get accurate and actionable results from QuickSpark AI.',
  },
  {
    slug: 'designing-effective-quizzes-with-ai',
    title: 'Designing Effective Quizzes with AI',
    date: '2025-10-10',
    author: 'Learning Science',
    excerpt:
      'A practical guide on using AI to generate meaningful practice questions that improve retention and measure real understanding.',
  },
  {
    slug: 'career-paths-in-data-science-2025',
    title: 'Career Paths in Data Science (2025 Edition)',
    date: '2025-09-05',
    author: 'Careers Team',
    excerpt:
      'An up-to-date look at roles, required skills, and learning resources for data science jobs this year.',
  },
];

const Blog = () => {
  const navigate = useNavigate();

  const handleCardClick = (slug) => (e) => {
    // ignore clicks from inner anchors
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    navigate(`/blog/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">QuickSpark Blog</h1>
        <p className="text-gray-600 mt-2">Insights, tutorials, and product updates to help you learn smarter.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <div key={post.slug} className="block" role="button" tabIndex={0}
               onClick={handleCardClick(post.slug)} onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') handleCardClick(post.slug)(e);
               }}>
            <Card className="p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              <div className="text-sm text-gray-500 mb-3">{post.date} • {post.author}</div>
              <p className="text-gray-700 mb-4">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="text-indigo-600 font-medium hover:underline">Read more →</Link>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;

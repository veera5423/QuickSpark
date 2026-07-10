import React, { useState, useRef } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../../api/resumeAPI';

const ResumeChecker = () => {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [limitExceeded, setLimitExceeded] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a PDF resume.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (jobDesc && jobDesc.trim()) formData.append('job_description', jobDesc.trim());

            const data = await resumeAPI.getResumeScore(file, jobDesc);

            // console.log(data.result);

             
            setResult(data.result);
            setFile(null);
        } catch (err) {
            // console.error(err.status);
            if (err.status === 429) {
                setLimitExceeded(true);
            }
            else {
                setError(err.response?.data?.message || 'Failed to evaluate resume');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Resume analysis</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Resume Score & Feedback</h1>
                <p className="text-slate-600 mt-2">Upload your resume as a PDF. Add a job description for role-specific feedback.</p>
            </div>

            <Card className="max-w-3xl mx-auto p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-2xl">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Resume (PDF)</label>
                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white hover:file:bg-slate-800 cursor-pointer" />
                        {file && <p className="text-sm text-slate-500 mt-1">Selected: {file.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Job Description (optional)</label>
                        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={5} className="w-full mt-2 p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Paste job description or role summary here" />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-slate-900 text-white cursor-pointer hover:bg-slate-800 hover:shadow-lg">
                            {loading ? 'Analyzing...' : 'Get Score & Feedback'}
                        </Button>
                    </div>
                </form>
                {/* Usage Limit Exceeded Popup */}
                {limitExceeded && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-[2rem] shadow-lg max-w-md border border-slate-200">
                            <h3 className="text-lg font-bold mb-4 text-rose-600">Usage Limit Exceeded</h3>
                            <p className="mb-4 text-slate-700">You have reached your quiz generation limit. Upgrade to premium for more quizzes. To get upgrade access, add five public resources.</p>
                            <button
                                onClick={() => setLimitExceeded(false)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-semibold"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Display the Results */}
                {result && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-slate-950">Result</h3>
                        <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <p><strong>Score:</strong> {result.score ?? 'N/A'}</p>
                            {result.strengths && (
                                <div className="mt-2">
                                    <strong>Strengths</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            {result.improvements && (
                                <div className="mt-2">
                                    <strong>Improvements</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {result.feedback && (
                                <div className="mt-2">
                                    <strong>Feedback</strong>
                                    <p className="mt-1 whitespace-pre-wrap">{result.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ResumeChecker;

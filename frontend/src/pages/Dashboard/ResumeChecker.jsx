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
        <div className="space-y-6 p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Resume Score & Feedback</h1>
                <p className="text-gray-600 mt-2">Upload your resume (PDF). Optionally provide a job description to get relevance-based feedback.</p>
            </div>

            <Card className="max-w-3xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="mt-2 bg-gray-200 cursor-pointer p-0.5 pl-1.5" />
                        {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Description (optional)</label>
                        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={5} className="w-full mt-2 p-2 border rounded" placeholder="Paste job description or role summary here" />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? 'Analyzing...' : 'Get Score & Feedback'}
                        </Button>
                    </div>
                </form>
                {/* Usage Limit Exceeded Popup */}
                {limitExceeded && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                            <h3 className="text-lg font-bold mb-4 text-red-600">Usage Limit Exceeded</h3>
                            <p className="mb-4 text-gray-700">You have reached your quiz generation limit. Upgrade to premium for more quizzes.To Get Upgrade add five Public Resources </p>
                            <button
                                onClick={() => setLimitExceeded(false)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Display the Results */}
                {result && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold">Result</h3>
                        <div className="mt-3 p-4 bg-gray-50 rounded">
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

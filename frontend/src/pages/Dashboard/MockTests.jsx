import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QuizModal from '../../components/QuizModal';
import { quizAPI } from '../../api/quizAPI';

const MockTests = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    
    // Quiz Taking State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalQuizData, setModalQuizData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState([]);
    const [error, setError] = useState(null);
    const [limitExceeded, setLimitExceeded] = useState(false);
    const requestInProgressRef = useRef(false);

    // Quiz Mode State
    const [quizMode, setQuizMode] = useState('resource'); // 'resource' or 'text'
    const [textInput, setTextInput] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resourcesRes, attemptsRes] = await Promise.all([
                quizAPI.getResources(),
                quizAPI.getAttempts()
            ]);
            // Sort attempts by date descending for history card
            const sortedAttempts = attemptsRes.attempts?.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)) || [];
            const filteredResources = resourcesRes.resources?.filter(r => r.is_public !== true) || [];
// console.log(filteredResources);

            setResources(filteredResources);
            setAttempts(sortedAttempts);
            setError(null);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            setError('Failed to load resources or history.');
        }
    };

    const generateQuiz = async () => {
        // Prevent duplicate requests using ref (works even with StrictMode)
        if (requestInProgressRef.current || loading) {
            console.log('Quiz generation already in progress, ignoring duplicate request');
            return;
        }
        
        console.log('Starting quiz generation...', { quizMode, selectedResource, textInputLength: textInput.trim().length });
        requestInProgressRef.current = true;
        
        setError(null);
        if (quizMode === 'resource' && !selectedResource) {
            setError("Please select a resource.");
            requestInProgressRef.current = false;
            return;
        }
        if (quizMode === 'text' && textInput.trim().length < 50) {
            setError("Please enter at least 50 characters for a meaningful quiz.");
            requestInProgressRef.current = false;
            return;
        }
        
        setLoading(true);
        try 
        {
            let response;
            
            if (quizMode === 'resource') {
                console.log('Generating quiz from resource:', selectedResource);
                response = await quizAPI.generateQuiz(selectedResource, difficulty, numQuestions);
            } else {
                console.log('Generating quiz from text, length:', textInput.trim().length);
                response = await quizAPI.generateQuizFromText(textInput.trim(), difficulty, numQuestions);
            }
            
            console.log('Quiz generated successfully, opening modal');
            setModalQuizData(response);
            setIsModalOpen(true);
            
        } 
        catch (error) {
            console.error('Failed to generate quiz:', error.response?.data || error);

            setError(error.response?.data?.message || 'Failed to generate quiz due to an API error.');
            if (error.response?.status === 429) {
                setLimitExceeded(true);
            }
            
         } finally {
            setLoading(false);
            requestInProgressRef.current = false;
        }
    };

    const handleQuizSubmitSuccess = () => {
        setIsModalOpen(false); 
        setModalQuizData(null); 
        loadData();
    };

    const resetQuiz = () => {
        setIsModalOpen(false);
        setModalQuizData(null);
        setError(null);
    };

    const DifficultyBadge = ({ difficulty }) => {
        let color = '';
        switch (difficulty.toLowerCase()) {
            case 'easy':
                color = 'bg-green-100 text-green-700 border-green-300';
                break;
            case 'medium':
                color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                break;
            case 'hard':
                color = 'bg-red-100 text-red-700 border-red-300';
                break;
            default:
                color = 'bg-gray-100 text-gray-700 border-gray-300';
        }
        return (
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${color} capitalize`}>
                {difficulty}
            </span>
        );
    };


    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Practice tests</p>
                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950">AI Mock Test Generator</h1>
                <p className="mt-2 text-slate-600">Build a focused test from a document or custom text, then review your attempts in one place.</p>
            </div>

            {/* Quiz Generation Card */}
            <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-2xl border border-slate-200 rounded-[2rem]">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-950">Custom Test Builder</h2>

                {/* Mode Selection */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setQuizMode('resource')}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                            quizMode === 'resource'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        📚 From Uploaded Document
                    </button>
                    <button
                        onClick={() => setQuizMode('text')}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                            quizMode === 'text'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        💡 From Custom Text/Skill
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 shadow-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Usage Limit Exceeded Popup */}
                {limitExceeded && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-lg max-w-sm sm:max-w-md w-full mx-4 border border-slate-200">
                            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-red-600">Usage Limit Exceeded</h3>
                            <p className="mb-4 text-sm sm:text-base text-slate-700">You have reached your quiz generation limit. Upgrade to premium for more quizzes. To get upgrade access, add five public resources.</p>
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => setLimitExceeded(false)}
                                    size="sm"
                                >
                                    OK
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Fields and Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
                    
                    {/* Dynamic Content Source */}
                    {quizMode === 'resource' ? (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Select Resource</label>
                            <select
                                value={selectedResource}
                                onChange={(e) => setSelectedResource(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all bg-white"
                            >
                                <option value="" disabled>Choose a document...</option>
                                {resources.map(resource => (
                                    <option key={resource._id} value={resource._id}>
                                        {resource.original_filename || resource.filename}
                                    </option>
                                ))}
                                {resources.length === 0 && <option disabled>No documents uploaded.</option>}
                            </select>
                        </div>
                    ) : (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-700">Enter Content/Skill Name</label>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="E.g., 'The core concepts of React hooks and context API...' (min 50 chars)"
                                className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:ring-teal-500 focus:border-teal-500 h-12 resize-none shadow-sm transition-all"
                                rows="1"
                            />
                            <p className="text-xs text-slate-500 mt-1">Characters: {textInput.length}/50 minimum</p>
                        </div>
                    )}
                    
                    {/* Difficulty Dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Difficulty Level</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all bg-white"
                        >
                            <option value="easy">Easy (Fundamentals)</option>
                            <option value="medium">Medium (Application)</option>
                            <option value="hard">Hard (Advanced/Scenario)</option>
                        </select>
                    </div>
                    
                    {/* Number of Questions Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700"># of Questions (1-20)</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all"
                        />
                    </div>
                    
                    {/* Generate Button */}
                    <div className="md:col-span-4 flex justify-end">
                        <Button
                            onClick={(e) => {
                                console.log('Button clicked', { loading, quizMode, selectedResource });
                                e.preventDefault();
                                generateQuiz();
                            }}
                            disabled={loading || (quizMode === 'resource' && !selectedResource) || (quizMode === 'text' && textInput.trim().length < 50)}
                            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white py-3 px-8 text-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                                    Generating Quiz...
                                </span>
                            ) : (
                                'Start Assessment'
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
            {/* Quiz Modal Container */}
            {isModalOpen && modalQuizData && (
                <QuizModal 
                    isOpen={isModalOpen}
                    onClose={resetQuiz}
                    quizData={modalQuizData}
                    onSubmitSuccess={handleQuizSubmitSuccess}
                    submitQuizApi={quizAPI.submitQuiz} 
                    mode="all"
                />
            )}

            {/* Attempt History Card */}
            <Card className="p-8 bg-white shadow-xl rounded-[2rem] border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-950 border-b border-slate-200 pb-3">Quiz History & Results ({attempts.length})</h2>
                {attempts.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl">
                        <p className="text-lg text-slate-600">No practice attempts recorded yet. Start a quiz above! ⬆️</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map((attempt, index) => {
                            const score = attempt.score || 0;
                            const isPassing = score >= 70; // Changed passing threshold to 70% for standard practice
                            const quizSource = resources.find(r => r._id === attempt.resource_id);
                            
                            // Determine the title for the history item
                            const title = attempt.text_content?.substring(0, 40) + '...' || 'General Topic Practice';
                            // console.log("title:",title);
                            // console.log("attempt",attempt);
                            
                            
                            
                            return (
                                <div key={attempt._id} className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-white hover:shadow-md transition-shadow duration-150">
                                    {/* Quiz Info */}
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <span className="text-2xl font-extrabold text-teal-700 w-8 text-center">{attempts.length - index}</span>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-950 truncate">{title}</p>
                                            <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                                                <DifficultyBadge difficulty={attempt.difficulty || 'unknown'} />
                                                <span>•</span>
                                                <span>{new Date(attempt.submitted_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Score and Action */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className={`font-extrabold text-2xl ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                                {score.toFixed(0)}%
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {attempt.correct_count}/{attempt.total_questions}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => navigate(`/dashboard/quiz-details/${attempt._id}`)}
                                            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold border border-slate-900 cursor-pointer transition-colors"
                                        >
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
            
            
        </div>
    );
};

export default MockTests;
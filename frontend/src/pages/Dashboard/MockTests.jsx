import React, { useState, useEffect } from 'react';
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
        setError(null);
        if (quizMode === 'resource' && !selectedResource) {
            setError("Please select a resource.");
            return;
        }
        if (quizMode === 'text' && textInput.trim().length < 50) {
            setError("Please enter at least 50 characters for a meaningful quiz.");
            return;
        }
        
        setLoading(true);
        try {
            let response;
            
            if (quizMode === 'resource') {
                response = await quizAPI.generateQuiz(selectedResource, difficulty, numQuestions);
            } else {
                response = await quizAPI.generateQuizFromText(textInput.trim(), difficulty, numQuestions);
            }
            
            

            setModalQuizData(response);
            setIsModalOpen(true);
            
        } catch (error) {
            console.error('Failed to generate quiz:', error.response?.data || error);

            setError(error.response?.data?.message || 'Failed to generate quiz due to an API error.');
            if (error.response?.status === 429) {
                setLimitExceeded(true);
            }
            
        } finally {
            setLoading(false);
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
        <div className="space-y-10 p-4 max-w-6xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-4">
                🧠 AI Mock Test Generator
            </h1>

            {/* Quiz Generation Card */}
            <Card className="p-8 bg-white shadow-2xl border border-indigo-200">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">Custom Test Builder</h2>
                
                {/* Mode Selection */}
                <div className="mb-6 flex gap-4 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setQuizMode('resource')}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                            quizMode === 'resource' 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📚 From Uploaded Document
                    </button>
                    <button
                        onClick={() => setQuizMode('text')}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                            quizMode === 'text' 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        💡 From Custom Text/Skill
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
                        ⚠️ **Error:** {error}
                    </div>
                )}

                {/* Usage Limit Exceeded Popup */}
                {limitExceeded && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                            <h3 className="text-lg font-bold mb-4 text-red-600">Usage Limit Exceeded</h3>
                            <p className="mb-4 text-gray-700">You have reached your quiz generation limit. Upgrade to premium for more quizzes.</p>
                            <button
                                onClick={() => setLimitExceeded(false)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Fields and Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    
                    {/* Dynamic Content Source */}
                    {quizMode === 'resource' ? (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-700">Select Resource</label>
                            <select
                                value={selectedResource}
                                onChange={(e) => setSelectedResource(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all bg-white"
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
                            <label className="block text-sm font-medium mb-1 text-gray-700">Enter Content/Skill Name</label>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="E.g., 'The core concepts of React hooks and context API...' (min 50 chars)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-12 resize-none shadow-sm transition-all"
                                rows="1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Characters: {textInput.length}/50 minimum</p>
                        </div>
                    )}
                    
                    {/* Difficulty Dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Difficulty Level</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all bg-white"
                        >
                            <option value="easy">Easy (Fundamentals)</option>
                            <option value="medium">Medium (Application)</option>
                            <option value="hard">Hard (Advanced/Scenario)</option>
                        </select>
                    </div>
                    
                    {/* Number of Questions Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700"># of Questions (1-20)</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                        />
                    </div>
                    
                    {/* Generate Button */}
                    <div className="md:col-span-4 flex justify-end">
                        <Button
                            onClick={generateQuiz}
                            disabled={loading || (quizMode === 'resource' && !selectedResource) || (quizMode === 'text' && textInput.trim().length < 50)}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 text-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
            <Card className="p-8 bg-white shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Quiz History & Results ({attempts.length})</h2>
                {attempts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-lg text-gray-600">No practice attempts recorded yet. Start a quiz above! ⬆️</p>
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
                                <div key={attempt._id} className="flex justify-between items-center p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow duration-150">
                                    {/* Quiz Info */}
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <span className="text-2xl font-extrabold text-indigo-500 w-8 text-center">{attempts.length - index}</span>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{title}</p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
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
                                            <p className="text-sm text-gray-500">
                                                {attempt.correct_count}/{attempt.total_questions}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => navigate(`/dashboard/quiz-details/${attempt._id}`)}
                                            className="bg-indigo-400 text-indigo-700 hover:bg-indigo-900 px-4 py-2 text-sm font-semibold border border-indigo-500 cursor-pointer transition-colors"
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
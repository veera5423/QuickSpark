import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { quizAPI } from '../../api/quizAPI';
import { CheckCircle, XCircle, ChevronLeft, Calendar, TrendingUp, Zap } from 'lucide-react';

// Helper component for Summary Stats
const StatBox = ({ icon: Icon, value, label, colorClass }) => (
  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
    <Icon className={`w-8 h-8 ${colorClass} mb-2`} />
    <div className={`text-2xl md:text-3xl font-extrabold ${colorClass} mb-1`}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const QuizDetails = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttemptDetails();
  }, [attemptId]);

  const loadAttemptDetails = async () => {
    try {
      setLoading(true);
      // Simulate API delay for better visual feedback
      // await new Promise(resolve => setTimeout(resolve, 1000)); 
      const data = await quizAPI.getAttemptDetails(attemptId);
      setAttempt(data.attempt);
    } catch (error) {
      console.error('Failed to load attempt details:', error);
      setError('Failed to load quiz details. Please check the network.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Attempt Review 📖</h1>
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <div className="text-xl text-gray-500 animate-pulse">Loading quiz details...</div>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Attempt Review ⚠️</h1>
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard/mock-tests')} className="bg-red-600 hover:bg-red-700">
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  // Calculate correct and incorrect counts
  const correctCount = attempt.questions.filter(q => q.is_correct).length;
  const incorrectCount = attempt.questions.length - correctCount;
  const totalQuestions = attempt.questions.length;

  // Calculate score percentage more robustly
  const scorePercentage = (correctCount / totalQuestions) * 100;
  const scoreColor = scorePercentage >= 80 ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600';


  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 md:mb-0">Quiz Attempt Review</h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/dashboard/mock-tests')}
          className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Mock Tests</span>
        </Button>
      </div>

      {/* Quiz Summary Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Summary</h2>
        <Card className="p-6 shadow-xl border-t-4 border-blue-500">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Score */}
            <StatBox
              icon={TrendingUp}
              value={`${scorePercentage.toFixed(1)}%`}
              label="Score"
              colorClass={scoreColor}
            />

            {/* Difficulty */}
            <StatBox
              icon={Zap}
              value={attempt.difficulty.charAt(0).toUpperCase() + attempt.difficulty.slice(1)}
              label="Difficulty"
              colorClass="text-purple-600"
            />
            
            {/* Date */}
            <StatBox
              icon={Calendar}
              value={new Date(attempt.submitted_at).toLocaleDateString()}
              label="Date"
              colorClass="text-indigo-600"
            />

            {/* Correct Count */}
            <StatBox
              icon={CheckCircle}
              value={correctCount}
              label="Correct"
              colorClass="text-green-600"
            />

            {/* Incorrect Count */}
            <StatBox
              icon={XCircle}
              value={incorrectCount}
              label="Incorrect"
              colorClass="text-red-600"
            />
            
          </div>
        </Card>
      </section>

      {/* Questions Review Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Question Breakdown ({totalQuestions} Total)</h2>
        <div className="space-y-6">
          {attempt.questions.map((question, index) => {
            const isQuestionCorrect = question.is_correct;

            return (
              <Card key={index} className={`p-6 border-l-4 ${isQuestionCorrect ? 'border-green-500 shadow-md' : 'border-red-500 shadow-md'}`}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      Question {index + 1}
                    </h3>
                    <div className={`flex items-center text-sm font-semibold p-1.5 rounded-full ${isQuestionCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isQuestionCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 font-medium leading-relaxed">
                    {question.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-5">
                  {question.options.map((option, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                    const isUserAnswer = question.user_answer === letter;
                    const isCorrectAnswer = question.correct_answer === letter;

                    let optionClasses = 'p-3 rounded-lg border-2 cursor-default transition duration-150 flex items-start';
                    let textClasses = 'text-gray-800';
                    let icon = null;

                    if (isCorrectAnswer) {
                      optionClasses += ' bg-green-50 border-green-400';
                      textClasses = 'text-green-800 font-semibold';
                      icon = <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />;
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      optionClasses += ' bg-red-50 border-red-400';
                      textClasses = 'text-red-800 font-semibold italic';
                      icon = <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />;
                    } else {
                      optionClasses += ' bg-white border-gray-200 hover:bg-gray-50';
                      icon = <span className="w-5 h-5 text-gray-400 mr-2 mt-0.5"></span>; // Spacer
                    }

                    return (
                      <div key={optIndex} className={optionClasses}>
                        {icon}
                        <div>
                          <span className="font-bold mr-2 text-md text-gray-600">{letter}.</span>
                          <span className={textClasses}>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4 shadow-inner">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Explanation:
                    </h4>
                    <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer Button */}
      <div className="pt-6 border-t border-gray-200 flex justify-end">
        <Button onClick={() => navigate('/dashboard/mock-tests')} className="flex items-center space-x-2">
          <ChevronLeft className="w-5 h-5" />
          <span>Finish Review and Go Back</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizDetails;
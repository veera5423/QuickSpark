import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { quizAPI } from '../api/quizAPI';
import { Loader2, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const QuizModal = ({
  isOpen,
  onClose,
  skill,
  quizData: externalQuizData,
  answers: externalAnswers,
  setAnswers: externalSetAnswers,
  onSubmitSuccess, // Renamed from externalOnSubmit for clarity
  submitQuizApi, // Passed in from MockTests for dependency injection
  loading: externalLoading,
  mode = 'step' // 'step' for skill quiz, 'all' for mock tests
}) => {
  const [state, setState] = useState('LOADING'); // LOADING, QUIZ, RESULT
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [result, setResult] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);

  // Use external state if provided (for 'all' mode), otherwise use internal state
  const effectiveAnswers = externalAnswers || answers;
  const effectiveSetAnswers = externalSetAnswers || setAnswers;
  const effectiveLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...effectiveAnswers];
    newAnswers[index] = answer;
    effectiveSetAnswers(newAnswers);
  };

  // --- Quiz Generation/Setup Effect ---
  useEffect(() => {
    if (mode === 'all' && externalQuizData) {
      setQuizData(externalQuizData);
      setState('QUIZ');
    } else if (isOpen && skill && mode === 'step') {
      setState('LOADING');
      setQuizData(null);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedOption('');
      setResult(null);

      // Generate quiz for single skill (step mode)
      quizAPI.generateQuizFromText(skill.skill_name, 'medium', 5, skill._id)
        .then(response => {
          setQuizData(response);
          setState('QUIZ');
        })
        .catch(error => {
          console.error('Error generating quiz:', error);
          // Fallback on error
          onClose();
        });
    }
  }, [isOpen, skill, mode, externalQuizData]);

  // --- Step Mode Navigation and Submission ---
  const handleNext = () => {
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption('');

    const isLast = currentQuestionIndex === quizData.questions.length - 1;

    if (!isLast) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Final submission for step mode
      setInternalLoading(true);
      submitQuizApi(quizData.quiz_id, newAnswers) // Use the API prop
        .then(response => {
          setResult(response);
          setState('RESULT');
          if (onSubmitSuccess) onSubmitSuccess(response); // Signal parent about submission
        })
        .catch(error => {
          console.error('Error submitting quiz:', error);
          // Handle error
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  };

  // --- All Mode Submission ---
  const handleSubmit = () => {
    setInternalLoading(true);

    // Ensure all questions have an answer
    if (effectiveAnswers.length !== quizData.questions.length || effectiveAnswers.includes('')) {
      alert("Please answer all questions before submitting.");
      setInternalLoading(false);
      return;
    }
    
    // Use the submit function passed from parent (MockTests)
    submitQuizApi(quizData.quiz_id, effectiveAnswers) 
      .then(response => {
        // Since the parent (MockTests) usually handles navigation/refresh,
        // we just call the success callback
        if (onSubmitSuccess) onSubmitSuccess(response); 
      })
      .catch(error => {
        console.error('Error submitting quiz:', error);
      })
      .finally(() => {
        setInternalLoading(false);
      });
  };

  const isLastQuestion = currentQuestionIndex === quizData?.questions.length - 1;
  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const allAnswered = quizData?.questions.length > 0 && effectiveAnswers.length === quizData.questions.length && !effectiveAnswers.includes('');
  
  const renderQuizContent = () => {
    if (!quizData) return null;

    const quizTitle = mode === 'step' 
      ? `Skill Assessment: ${skill.skill_name}` 
      : `Mock Test: ${quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1)} Level`;

    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 border-b pb-2">
          {quizTitle}
        </h2>

        {/* Progress Tracker (Step Mode Only) */}
        {mode === 'step' && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-indigo-600 mb-2">
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto ${mode === 'all' ? 'pr-4' : ''}`}>
          {/* Question Rendering (Dynamic based on mode) */}
          {mode === 'step' && currentQuestion ? (
            <div>
              <p className="text-lg font-medium mb-4 text-gray-800">{currentQuestion.question}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = selectedOption === letter;
                  return (
                    <div 
                      key={index}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-150 shadow-sm ${
                        isSelected 
                          ? 'bg-indigo-100 border-indigo-600 ring-4 ring-indigo-200' 
                          : 'bg-white border-gray-200 hover:border-indigo-400'
                      }`}
                      onClick={() => setSelectedOption(letter)}
                    >
                      <span className={`font-bold mr-3 ${isSelected ? 'text-indigo-800' : 'text-gray-600'}`}>{letter}.</span>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* All Mode: Render all questions */}
              {quizData.questions.map((question, index) => {
                const userAnswer = effectiveAnswers[index];
                const isAnswered = !!userAnswer;

                return (
                  <div key={index} className={`border p-4 rounded-xl ${isAnswered ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-semibold mb-3 text-gray-800">{index + 1}. {question.question}</h3>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isSelected = userAnswer === letter;
                        return (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                              isSelected ? 'bg-indigo-200 font-medium text-indigo-900' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => handleAnswerChange(index, letter)}
                          >
                            <span className="font-bold mr-2">{letter}.</span>
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-4 justify-between">
          <Button variant="secondary" onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </Button>

          {mode === 'step' ? (
            <Button
              onClick={handleNext}
              disabled={!selectedOption || effectiveLoading}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <span className="flex items-center">
                {effectiveLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  isLastQuestion && <CheckCircle className="w-5 h-5 mr-2" />
                )}
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-2" />}
              </span>
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={effectiveLoading || !allAnswered}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <span className="flex items-center">
                {effectiveLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Submit Full Test
              </span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderResultContent = () => {
    if (!result) return null;
    const passed = result.score >= 70; // Assuming 70% is passing
    const icon = passed ? <CheckCircle className="w-12 h-12 text-green-600 mb-4" /> : <XCircle className="w-12 h-12 text-red-600 mb-4" />;
    const colorClass = passed ? 'bg-green-500' : 'bg-red-500';

    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
        {icon}
        <h2 className="text-3xl font-extrabold mb-4 text-gray-800">{passed ? 'Assessment Passed!' : 'Assessment Failed'}</h2>
        <p className="text-xl font-medium text-gray-600 mb-4">Final Score:</p>
        <div className={`inline-block text-5xl font-extrabold text-white px-6 py-3 rounded-xl ${colorClass} shadow-lg`}>
          {result.score}%
        </div>
        <div className="text-sm mt-2 text-gray-500">
            {result.correct_count}/{result.total_questions} Correct
        </div>
        <Button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-3 mt-8 hover:bg-indigo-700 text-lg"
        >
          Close Review
        </Button>
      </div>
    );
  };


  const renderContent = () => {
    if (state === 'LOADING' && mode === 'step') {
      return (
        <div className="text-center p-12 bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Generating personalized assessment...</p>
        </div>
      );
    }
    
    if (state === 'RESULT' && mode === 'step') {
      return renderResultContent();
    }
    
    if (state === 'QUIZ' && quizData) {
      // Step mode uses a narrow modal, All mode uses a wider container
      const contentClass = mode === 'step' ? "bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl" : "bg-white rounded-xl p-6 w-full h-full shadow-2xl flex flex-col";
      return <div className={contentClass}>{renderQuizContent()}</div>;
    }

    return null; // Should not happen
  };

  const renderOverlay = mode === 'step' && isOpen;

  if (renderOverlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        {renderContent()}
      </div>
    );
  }

  // Render directly for 'all' mode, as it's typically used inside a larger container
  return renderContent();
};

export default QuizModal;
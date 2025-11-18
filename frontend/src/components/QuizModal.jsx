import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { quizAPI } from '../api/quizAPI';

const QuizModal = ({
  isOpen,
  onClose,
  skill,
  quizData: externalQuizData,
  answers: externalAnswers,
  setAnswers: externalSetAnswers,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
  mode = 'step'
}) => {
  const [state, setState] = useState('LOADING'); // LOADING, QUIZ, RESULT
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [result, setResult] = useState(null);

  // Use external state if provided (for 'all' mode), otherwise use internal state
  const effectiveAnswers = externalAnswers || answers;
  const effectiveSetAnswers = externalSetAnswers || setAnswers;
  const effectiveLoading = externalLoading !== undefined ? externalLoading : false;

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...effectiveAnswers];
    newAnswers[index] = answer;
    effectiveSetAnswers(newAnswers);
  };

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

      quizAPI.generateQuizFromText(skill.skill_name, 'medium', 5, skill._id)
        .then(response => {
          setQuizData(response);
          setState('QUIZ');
        })
        .catch(error => {
          console.error('Error generating quiz:', error);
          // Handle error, maybe set state to error or close modal
        });
    }
  }, [isOpen, skill, mode, externalQuizData]);

  const handleNext = () => {
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption('');

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      quizAPI.submitQuiz(quizData.quiz_id, newAnswers)
        .then(response => {
          setResult(response);
          setState('RESULT');
        })
        .catch(error => {
          console.error('Error submitting quiz:', error);
          // Handle error
        });
    }
  };

  const handleSubmit = () => {
    if (externalOnSubmit) {
      externalOnSubmit(effectiveAnswers);
    } else {
      // Fallback for step mode submission
      quizAPI.submitQuiz(quizData.quiz_id, effectiveAnswers)
        .then(response => {
          setResult(response);
          setState('RESULT');
        })
        .catch(error => {
          console.error('Error submitting quiz:', error);
        });
    }
  };

  const isLastQuestion = currentQuestionIndex === quizData?.questions.length - 1;

  const renderOverlay = mode === 'step' && isOpen;

  if (mode === 'step' && !isOpen) return null;

  const content = (
    <div className={renderOverlay ? "bg-white rounded-lg p-6 w-full max-w-md mx-4" : "bg-white rounded-lg p-6"}>
      {state === 'LOADING' && mode === 'step' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating quiz...</p>
        </div>
      )}

      {state === 'QUIZ' && quizData && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {mode === 'step' ? `Skill Quiz: ${skill.skill_name}` : `Quiz: ${quizData.difficulty} Level`}
          </h2>
          {mode === 'step' ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </p>
              <p className="text-lg mb-4">{quizData.questions[currentQuestionIndex].question}</p>
              <div className="space-y-2">
                {quizData.questions[currentQuestionIndex].options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="option"
                        value={letter}
                        checked={selectedOption === letter}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{letter}. {option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium mb-2">{index + 1}. {question.question}</h3>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                      return (
                        <label key={optIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={letter}
                            checked={effectiveAnswers[index] === letter}
                            onChange={() => handleAnswerChange(index, letter)}
                            className="mr-2"
                          />
                          <span>{letter}. {option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex gap-4">
            {mode === 'step' ? (
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLastQuestion ? 'Submit' : 'Next'}
              </button>
            ) : (
              <>
                <Button onClick={handleSubmit} disabled={effectiveLoading || effectiveAnswers.includes('')}>
                  {effectiveLoading ? 'Submitting...' : 'Submit Quiz'}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {state === 'RESULT' && result && mode === 'step' && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Quiz Result</h2>
          <p className="text-2xl font-semibold mb-2">Score: {result.score}%</p>
          <div className={`inline-block px-4 py-2 rounded-full text-white ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}>
            {result.passed ? 'Passed' : 'Failed'}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  if (renderOverlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default QuizModal;

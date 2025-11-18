import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { quizAPI } from '../../api/quizAPI';

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
      const data = await quizAPI.getAttemptDetails(attemptId);
      setAttempt(data.attempt);
    } catch (error) {
      console.error('Failed to load attempt details:', error);
      setError('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz Details</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading quiz details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz Details</h1>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => navigate('/dashboard/mock-tests')} className="mt-4">
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz Details</h1>
        <Button variant="secondary" onClick={() => navigate('/dashboard/mock-tests')}>
          ← Back to Mock Tests
        </Button>
      </div>

        {/* Quiz Summary */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {attempt.score.toFixed(1)}%
              </div>
              <div className="text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2 capitalize">
                {attempt.difficulty}
              </div>
              <div className="text-gray-600">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {new Date(attempt.submitted_at).toLocaleDateString()}
              </div>
              <div className="text-gray-600">Date</div>
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {attempt.questions.map((question, index) => (
            <Card key={index}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Question {index + 1}: {question.question}
                </h3>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                    const isUserAnswer = question.user_answer === letter;
                    const isCorrectAnswer = question.correct_answer === letter;
                    const isCorrect = question.is_correct;

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded border ${
                          isCorrectAnswer
                            ? 'bg-green-50 border-green-200'
                            : isUserAnswer && !isCorrect
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`font-medium mr-2 ${
                            isCorrectAnswer
                              ? 'text-green-600'
                              : isUserAnswer && !isCorrect
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {letter}.
                          </span>
                          <span className={
                            isCorrectAnswer
                              ? 'text-green-800 font-medium'
                              : isUserAnswer && !isCorrect
                              ? 'text-red-800 font-medium'
                              : 'text-gray-800'
                          }>
                            {option}
                          </span>
                          {isCorrectAnswer && (
                            <span className="ml-2 text-green-600">✓ Correct Answer</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="ml-2 text-red-600">✗ Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Explanation:</h4>
                    <p className="text-blue-700">{question.explanation}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

    </div>
  );
};

export default QuizDetails;

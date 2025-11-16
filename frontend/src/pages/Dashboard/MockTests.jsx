import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { quizAPI } from '../../api/quizAPI';

const MockTests = () => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [quizMode, setQuizMode] = useState('resource'); // 'resource' or 'text'
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    loadResources();
    loadAttempts();
  }, []);

  const loadResources = async () => {
    try {
      const data = await quizAPI.getResources();
      console.log('Loaded resources:', data.resources);
      setResources(data.resources || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadAttempts = async () => {
    try {
      const data = await quizAPI.getAttempts();
      setAttempts(data.attempts || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
    }
  };

  const generateQuiz = async () => {
    if (quizMode === 'resource' && !selectedResource) return;
    if (quizMode === 'text' && !textInput.trim()) return;
    setLoading(true);
    try {
      let data;
      if (quizMode === 'resource') {
        data = await quizAPI.generateQuiz(selectedResource, difficulty, numQuestions);
      } else {
        data = await quizAPI.generateQuizFromText(textInput.trim(), difficulty, numQuestions);
      }
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(''));
      setShowResults(false);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const data = await quizAPI.submitQuiz(quiz.quiz_id, answers);
      setResults(data);
      setShowResults(true);
      loadAttempts(); // Refresh attempts
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers([]);
    setShowResults(false);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mock Tests</h1>

      {/* Quiz Generation */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Generate New Quiz</h2>

        {/* Mode Selection */}
        <div className="mb-4">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="resource"
                checked={quizMode === 'resource'}
                onChange={(e) => setQuizMode(e.target.value)}
                className="mr-2"
              />
              From Resource
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={quizMode === 'text'}
                onChange={(e) => setQuizMode(e.target.value)}
                className="mr-2"
              />
              From Text
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {quizMode === 'resource' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Resource</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a resource...</option>
                {resources.map(resource => (
                  <option key={resource._id} value={resource._id}>
                    {resource.filename}
                  </option>
                ))}
              </select>
            </div>
          )}
          {quizMode === 'text' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Enter Text</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste or type the text content for quiz generation..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Button
          onClick={generateQuiz}
          disabled={(quizMode === 'resource' && !selectedResource) || (quizMode === 'text' && !textInput.trim()) || loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </Card>

      {/* Quiz Taking */}
      {quiz && !showResults && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Quiz: {quiz.difficulty} Level</h2>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
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
                          checked={answers[index] === letter}
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
          <div className="mt-6 flex gap-4">
            <Button onClick={submitQuiz} disabled={loading || answers.includes('')}>
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </Button>
            <Button variant="secondary" onClick={resetQuiz}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {showResults && results && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
          <div className="mb-4">
            <p className="text-lg">Score: <span className="font-bold">{results.score.toFixed(1)}%</span></p>
            <p>Correct Answers: {results.correct_count} / {results.total_questions}</p>
          </div>
          <div className="space-y-4">
            {results.feedback.map((item, index) => (
              <div key={index} className={`p-4 rounded ${item.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <h4 className="font-medium">{index + 1}. {quiz.questions[index].question}</h4>
                <p>Your answer: <span className="font-medium">{item.user_answer || 'Not answered'}</span></p>
                <p>Correct answer: <span className="font-medium">{item.correct_answer}</span></p>
                <p className="text-sm text-gray-600 mt-2">{item.explanation}</p>
              </div>
            ))}
          </div>
          <Button onClick={resetQuiz} className="mt-4">
            Take Another Quiz
          </Button>
        </Card>
      )}

      {/* Attempt History */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Quiz History</h2>
        {attempts.length === 0 ? (
          <p className="text-gray-500">No quiz attempts yet.</p>
        ) : (
          <div className="space-y-2">
            {attempts.map(attempt => (
              <div key={attempt._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">Score: {attempt.score.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">
                    {attempt.correct_count}/{attempt.total_questions} correct • {new Date(attempt.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MockTests;

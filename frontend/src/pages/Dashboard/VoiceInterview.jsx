import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RequestProModal from '../../components/common/RequestProModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Mic, Play, Pause, RotateCcw, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { voiceInterviewAPI } from '../../api/voiceInterviewAPI';

const VoiceInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProModal, setShowProModal] = useState(false);

  // Interview setup
  const [jobTitle, setJobTitle] = useState('');
  const [field, setField] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState(null);

  // Loading and error states
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Speech states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check pro status - TEMPORARILY ENABLED FOR TESTING
    const proStatus = user?.is_pro_member; // Temporarily allow access

    if (!proStatus) {
      setShowProModal(true);
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const synth = synthRef.current;
      if (synth) {
        synth.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user?.is_pro_member]);

  // Prevent page refresh/navigation during active interview
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInterviewActive) {
        e.preventDefault();
        e.returnValue = 'You have an active interview in progress. Are you sure you want to leave? Your progress will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInterviewActive]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSpeechResult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      setTranscript(prev => prev + finalTranscript);
    }
  };

  const speak = (text, onEndCallback = () => {}) => {
    if (synthRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEndCallback();
      };
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const startInterview = async () => {
    setIsGeneratingQuestions(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await voiceInterviewAPI.generateQuestions({
        job_title: jobTitle,
        field: field,
        job_description: jobDescription,
        time_minutes: timeMinutes
      });
      
      setQuestions(response.questions);
      setTimeLeft(timeMinutes * 60);
      setIsInterviewActive(true);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setOverallFeedback(null);
      setTranscript('');
      setSuccessMessage('Questions generated successfully! Starting interview...');

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Speak first question after a short delay
      setTimeout(() => {
        speak(response.questions[0], () => startListening());
        setSuccessMessage(null);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start interview:', error);
      setError('Failed to generate interview questions. Please check your connection and try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setError(null);
    
    // Stop listening
    stopListening();
    
    // Save answer
    setAnswers(prev => [...prev, {
      question: questions[currentQuestionIndex],
      answer: transcript
    }]);

    setSuccessMessage('Answer recorded successfully!');
    
    // Move to next question
    setTimeout(() => {
      nextQuestion();
      setSuccessMessage(null);
    }, 1000);
  };

  const nextQuestion = () => {
    setError(null);
    setSuccessMessage(null);
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTranscript('');
      // Speak next question and start listening after
      setTimeout(() => {
        speak(questions[nextIndex], () => startListening());
      }, 500);
    } else {
      endInterview();
    }
  };

  const endInterview = async () => {
    setIsInterviewActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();
    synthRef.current.cancel();

    // Evaluate all answers
    setIsEvaluatingAnswer(true);
    try {
      const response = await voiceInterviewAPI.evaluateAllAnswers({
        answers: answers
      });
      setOverallFeedback(response);
      setSuccessMessage('Interview completed! Review your feedback below.');
    } catch (error) {
      console.error('Failed to evaluate interview:', error);
      setError('Failed to evaluate your interview. Please try again.');
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  const resetInterview = () => {
    endInterview();
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setOverallFeedback(null);
    setTranscript('');
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showProModal) {
    return <RequestProModal onClose={() => navigate('/dashboard')} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Voice Interview</h1>
        <p className="text-gray-600">Practice interviews with voice interaction</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {!isInterviewActive ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Customize Your Interview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
            <Input
              label="Field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g., Technology"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe the job requirements and responsibilities..."
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Duration
            </label>
            <select
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 minutes</option>
              <option value={7}>7 minutes</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>
          <Button 
            onClick={startInterview} 
            disabled={!jobTitle || !field || !jobDescription || isGeneratingQuestions}
            className="flex items-center justify-center"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              'Start Voice Interview'
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="flex items-center space-x-4">
                {isSpeaking && (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                )}
                {isListening && (
                  <div className="flex items-center text-red-600">
                    <Mic className="w-4 h-4 mr-1 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
                <div className="text-lg font-mono text-red-600">
                  Time: {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            <p className="text-lg mb-6">{questions[currentQuestionIndex]}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Progress: {currentQuestionIndex + 1} of {questions.length} questions
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={submitAnswer} disabled={!transcript || isEvaluatingAnswer}>
                  {isEvaluatingAnswer ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Your answer will appear here as you speak... or type manually"
              />
            </div>
          </Card>

          <div className="flex justify-center">
            <Button onClick={resetInterview} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Interview
            </Button>
          </div>
        </div>
      )}

      {answers.length > 0 && !isInterviewActive && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Interview Summary</h2>
          {overallFeedback && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Overall Feedback</h3>
              <p className="font-medium">Overall Score: {overallFeedback.overall_score}/10</p>
              <p><strong>Strengths:</strong> {overallFeedback.strengths}</p>
              <p><strong>Weaknesses:</strong> {overallFeedback.weaknesses}</p>
              <p><strong>Improvements:</strong> {overallFeedback.improvements}</p>
            </div>
          )}
          <div className="space-y-4">
            {answers.map((item, index) => (
              <div key={index} className="border-b pb-4">
                <p className="font-medium">Q{index + 1}: {item.question}</p>
                <p className="text-gray-600 mt-1">Your answer: {item.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={resetInterview}>Start New Interview</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VoiceInterview;
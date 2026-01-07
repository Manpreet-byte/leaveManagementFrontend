import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [markedForReview, setMarkedForReview] = useState({});
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  
  // Analytics tracking
  const tabSwitchCount = useRef(0);
  const copyPasteAttempts = useRef(0);
  const fullscreenExits = useRef(0);
  const questionStartTime = useRef(Date.now());
  const timePerQuestion = useRef({});
  const hasSubmitted = useRef(false);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get(`/api/tests/${id}`, config);
        
        if (!data || !data.questions || data.questions.length === 0) {
          setError('This test has no questions assigned.');
          setLoading(false);
          return;
        }
        
        setTest(data);
        // Use config time limit or default to 5 min per question
        const totalTime = data.config?.totalTimeLimit || data.questions.length * 5 * 60;
        setTimeLeft(totalTime);
        setLoading(false);
      } catch (err) {
        console.error('Error loading test:', err);
        setError(err.response?.data?.message || 'Failed to load the test.');
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Handle test submission
  const handleSubmit = useCallback(async (forceSubmit = false, reason = '') => {
    if (hasSubmitted.current || submitting) return;
    
    hasSubmitted.current = true;
    setSubmitting(true);
    
    // Record time for current question
    const currentQ = test?.questions?.[currentQuestionIndex];
    if (currentQ) {
      const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
      timePerQuestion.current[currentQ._id] = (timePerQuestion.current[currentQ._id] || 0) + timeSpent;
    }
    
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`/api/tests/${id}/submit`, { 
        answers: formattedAnswers,
        tabSwitchCount: tabSwitchCount.current,
        copyPasteAttempts: copyPasteAttempts.current,
        fullscreenExits: fullscreenExits.current,
        timePerQuestion: Object.entries(timePerQuestion.current).map(([qId, time]) => ({
          questionId: qId,
          timeSpent: time,
        })),
        terminationReason: reason,
      }, config);
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      alert(`Test submitted! Score: ${data.score}/${data.totalQuestions} - ${data.isPassed ? 'PASSED ✓' : 'FAILED ✗'}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to submit the test.');
      hasSubmitted.current = false;
      setSubmitting(false);
    }
  }, [answers, id, navigate, submitting, test, currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 && !hasSubmitted.current) {
      alert('Time is up! Auto-submitting your test...');
      handleSubmit(true, 'Time expired');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // Track time per question
  useEffect(() => {
    if (test && test.questions && test.questions[currentQuestionIndex]) {
      const prevQuestion = test.questions[currentQuestionIndex - 1];
      if (prevQuestion) {
        const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
        timePerQuestion.current[prevQuestion._id] = (timePerQuestion.current[prevQuestion._id] || 0) + timeSpent;
      }
      questionStartTime.current = Date.now();
    }
  }, [currentQuestionIndex, test]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmitted.current) {
        tabSwitchCount.current += 1;
        const maxSwitches = test?.config?.maxTabSwitches || 3;
        if (tabSwitchCount.current >= maxSwitches) {
          alert(`You have switched tabs ${tabSwitchCount.current} times! Test will be auto-submitted.`);
          handleSubmit(true, 'Exceeded tab switches');
        } else {
          alert(`Warning: Tab switch detected (${tabSwitchCount.current}/${maxSwitches})! Switching tabs ${maxSwitches} times will auto-submit your test.`);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleSubmit, test]);

  // Copy-paste prevention
  useEffect(() => {
    if (!test?.config?.preventCopyPaste) return;
    
    const handleCopy = (e) => {
      e.preventDefault();
      copyPasteAttempts.current += 1;
      alert('Copying is not allowed during the test!');
    };
    
    const handlePaste = (e) => {
      // Allow paste only in coding textarea
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        copyPasteAttempts.current += 1;
        alert('Pasting is not allowed during the test!');
      }
    };
    
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [test]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !hasSubmitted.current && isFullscreen) {
        fullscreenExits.current += 1;
        if (fullscreenExits.current >= 3) {
          alert('You have exited fullscreen too many times! Test will be auto-submitted.');
          handleSubmit(true, 'Exceeded fullscreen exits');
        } else {
          alert(`Warning: Please stay in fullscreen mode! (Exit ${fullscreenExits.current}/3)`);
          setShowFullscreenPrompt(true);
        }
      }
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleSubmit, isFullscreen]);

  // Enter fullscreen
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowFullscreenPrompt(false);
    } catch (err) {
      console.error('Fullscreen error:', err);
      setShowFullscreenPrompt(false); // Allow test anyway
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // Toggle mark for review
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Run code (for coding questions)
  const runCode = async () => {
    const currentQuestion = test.questions[currentQuestionIndex];
    const code = answers[currentQuestion._id];
    
    if (!code) {
      setCodeOutput('Please write some code first.');
      return;
    }
    
    setRunningCode(true);
    setCodeOutput('Running...');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      
      const { data } = await axios.post('/api/tests/run-code', {
        code,
        language: currentQuestion.programmingLanguage || 'python',
        testCases: currentQuestion.testCases?.filter(tc => !tc.isHidden) || [],
        sampleInput: currentQuestion.sampleInput,
        sampleOutput: currentQuestion.sampleOutput,
      }, config);
      
      setCodeOutput(data.output || 'No output');
    } catch (err) {
      setCodeOutput(err.response?.data?.message || 'Error running code');
    } finally {
      setRunningCode(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No test found
  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-yellow-500 text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Questions</h2>
          <p className="text-gray-600 mb-6">This test has no questions assigned yet.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen prompt
  if (showFullscreenPrompt && test?.config?.requireFullscreen !== false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">🖥️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Requirements</h2>
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span>Test must be taken in fullscreen mode</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Tab switching is monitored (max {test?.config?.maxTabSwitches || 3} switches)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Copy-paste is disabled</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Time limit: {formatTime(timeLeft)}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>{test.questions.length} questions</span>
            </p>
          </div>
          <button
            onClick={enterFullscreen}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
          >
            Enter Fullscreen & Start Test
          </button>
          <button
            onClick={() => setShowFullscreenPrompt(false)}
            className="mt-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            Continue without fullscreen
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800">Leave Assessment Test</h1>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                {answeredCount}/{test.questions.length} answered
              </span>
              {reviewCount > 0 && (
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  {reviewCount} marked for review
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 
                timeLeft < 300 ? 'bg-orange-100 text-orange-600' : 
                'bg-green-100 text-green-600'
              }`}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setShowQuestionNav(!showQuestionNav)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                title="Question Navigator"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Question Navigator Sidebar */}
        {showQuestionNav && (
          <div className="w-64 bg-white rounded-xl shadow-lg p-4 h-fit sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                    idx === currentQuestionIndex 
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                      : markedForReview[q._id]
                        ? 'bg-yellow-400 text-white'
                        : answers[q._id] 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Question Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Question Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {test.questions.length}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentQuestion.questionType === 'MCQ' ? 'bg-blue-100 text-blue-800' : 
                    currentQuestion.questionType === 'Coding' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentQuestion.questionType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  {currentQuestion.points && (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {currentQuestion.points} pts
                    </span>
                  )}
                </div>
                {currentQuestion.category && (
                  <span className="text-sm text-gray-500">Category: {currentQuestion.category}</span>
                )}
              </div>
              <button
                onClick={() => toggleMarkForReview(currentQuestion._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  markedForReview[currentQuestion._id] 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={markedForReview[currentQuestion._id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {markedForReview[currentQuestion._id] ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Text */}
            <div className="text-lg text-gray-800 mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </div>

            {/* MCQ Options */}
            {(currentQuestion.questionType === 'MCQ' || currentQuestion.questionType === 'TrueFalse') && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label 
                    key={index} 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      answers[currentQuestion._id] === option 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="w-5 h-5 text-indigo-600 mr-4"
                    />
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Fill in Blank */}
            {currentQuestion.questionType === 'FillInBlank' && (
              <div>
                <input
                  type="text"
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                />
              </div>
            )}

            {/* Coding Question */}
            {currentQuestion.questionType === 'Coding' && (
              <div className="space-y-4">
                {/* Sample I/O */}
                {(currentQuestion.sampleInput || currentQuestion.sampleOutput) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.sampleInput && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Sample Input:</h4>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                          {currentQuestion.sampleInput}
                        </pre>
                      </div>
                    )}
                    {currentQuestion.sampleOutput && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Expected Output:</h4>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                          {currentQuestion.sampleOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Code Editor */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Your Code ({currentQuestion.programmingLanguage || 'Python'}):
                    </h4>
                    <button
                      onClick={runCode}
                      disabled={runningCode}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {runningCode ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Run Code
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows="14"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-mono text-sm bg-gray-900 text-green-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder={currentQuestion.starterCode || `# Write your ${currentQuestion.programmingLanguage || 'Python'} code here\n\ndef solution(input):\n    # Your code here\n    pass`}
                    value={answers[currentQuestion._id] || currentQuestion.starterCode || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    spellCheck="false"
                  ></textarea>
                </div>

                {/* Code Output */}
                {codeOutput && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Output:</h4>
                    <pre className={`p-3 rounded text-sm overflow-x-auto ${
                      codeOutput.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-gray-800 text-green-400'
                    }`}>
                      {codeOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={() => toggleMarkForReview(currentQuestion._id)}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-semibold transition-colors ${
                markedForReview[currentQuestion._id]
                  ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              <svg className="w-5 h-5" fill={markedForReview[currentQuestion._id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {markedForReview[currentQuestion._id] ? 'Unmark' : 'Mark for Review'}
            </button>

            {currentQuestionIndex === test.questions.length - 1 ? (
              <button 
                onClick={() => {
                  if (answeredCount < test.questions.length) {
                    if (window.confirm(`You have ${test.questions.length - answeredCount} unanswered questions. Are you sure you want to submit?`)) {
                      handleSubmit();
                    }
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl disabled:opacity-50 transition-all shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Test
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

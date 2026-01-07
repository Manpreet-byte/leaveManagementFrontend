import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ManageQuestions = () => {
  const [questionType, setQuestionType] = useState('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '', isHidden: false }]);
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('General');
  const [points, setPoints] = useState(1);
  const [timeLimit, setTimeLimit] = useState(300);
  const [explanation, setExplanation] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('python');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // AI Generation States
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiCategory, setAiCategory] = useState('General');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiType, setAiType] = useState('MCQ');
  const [aiCount, setAiCount] = useState(5);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  
  // Stats state
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'ai', 'list'

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, []);

  const fetchQuestions = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/questions', config);
      setQuestions(data);
    } catch (err) {
      setError('Failed to fetch questions.');
    }
  };

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/questions/stats', config);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  // AI Question Generation
  const handleGenerateAI = async () => {
    setAiGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedQuestions([]);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post('/api/questions/generate', {
        category: aiCategory,
        difficulty: aiDifficulty,
        questionType: aiType,
        count: aiCount,
        topic: aiTopic || undefined,
        saveToDatabase: false, // Preview first
      }, config);

      setGeneratedQuestions(data.questions);
      setSuccess(`Generated ${data.questions.length} questions! Review and save below.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Save generated questions
  const handleSaveGenerated = async () => {
    if (generatedQuestions.length === 0) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };

      const { data } = await axios.post('/api/questions/bulk', {
        questions: generatedQuestions,
      }, config);

      setSuccess(data.message);
      setGeneratedQuestions([]);
      fetchQuestions();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save questions.');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = field === 'isHidden' ? value : value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', isHidden: false }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };
      await axios.delete(`/api/questions/${questionId}`, config);
      setSuccess('Question deleted successfully!');
      fetchQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const questionData = {
      questionType,
      questionText,
      difficulty,
      category,
      points,
      timeLimit,
      explanation,
      ...(questionType === 'MCQ' && { options, correctAnswer }),
      ...(questionType === 'TrueFalse' && { 
        options: ['True', 'False'], 
        correctAnswer 
      }),
      ...(questionType === 'FillInBlank' && { correctAnswer }),
      ...(questionType === 'Coding' && { 
        testCases,
        sampleInput,
        sampleOutput,
        starterCode,
        programmingLanguage,
      }),
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };
      await axios.post('/api/questions', questionData, config);
      setSuccess('Question created successfully!');
      fetchQuestions(); // Refresh the list
      // Reset form fields
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setTestCases([{ input: '', output: '', isHidden: false }]);
      setExplanation('');
      setSampleInput('');
      setSampleOutput('');
      setStarterCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question.');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter !== 'all' && q.questionType !== filter) return false;
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const mcqCount = questions.filter(q => q.questionType === 'MCQ').length;
  const codingCount = questions.filter(q => q.questionType === 'Coding').length;
  const aiGeneratedCount = questions.filter(q => q.isAIGenerated).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Manage and generate questions for student tests</p>
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mcqCount}</p>
              <p className="text-sm text-gray-500">MCQ Questions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{codingCount}</p>
              <p className="text-sm text-gray-500">Coding Questions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{aiGeneratedCount}</p>
              <p className="text-sm text-gray-500">AI Generated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Question
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ai'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Generator
              </span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Question List ({filteredQuestions.length})
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* AI Generator Tab */}
          {activeTab === 'ai' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Question Generator</h3>
                <p className="text-gray-600">Generate questions automatically using AI. Configure the parameters below and click generate.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="React">React</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="DSA">Data Structures & Algorithms</option>
                    <option value="Database">Database</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select 
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select 
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TrueFalse">True/False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <input 
                    type="number"
                    value={aiCount}
                    onChange={(e) => setAiCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="10"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Topic (Optional)</label>
                  <input 
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., React Hooks, Binary Trees, etc."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={aiGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Questions
                  </>
                )}
              </button>

              {/* Generated Questions Preview */}
              {generatedQuestions.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Generated Questions Preview</h4>
                    <button
                      onClick={handleSaveGenerated}
                      className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save All to Database
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.questionText}</p>
                            {q.options && (
                              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                {q.options.map((opt, optIdx) => (
                                  <li key={optIdx} className={opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                    {opt} {opt === q.correctAnswer && '✓'}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {q.explanation && (
                              <p className="mt-2 text-sm text-gray-500 italic">💡 {q.explanation}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {q.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Question Tab */}
          {activeTab === 'create' && (
            <form onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Question Type</label>
                  <select 
                    value={questionType} 
                    onChange={(e) => setQuestionType(e.target.value)} 
                    className="mt-1 block w-full border rounded-lg p-2"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="Coding">Coding Challenge</option>
                    <option value="TrueFalse">True/False</option>
                    <option value="FillInBlank">Fill in the Blank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="mt-1 block w-full border rounded-lg p-2"
                  >
                    <option value="General">General</option>
                    <option value="React">React</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="DSA">DSA</option>
                    <option value="Database">Database</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Difficulty</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)} 
                    className="mt-1 block w-full border rounded-lg p-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Points</label>
                  <input 
                    type="number" 
                    value={points} 
                    onChange={(e) => setPoints(parseInt(e.target.value) || 1)} 
                    min="1"
                    max="10"
                    className="mt-1 block w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Time (sec)</label>
                  <input 
                    type="number" 
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 300)} 
                    min="60"
                    step="30"
                    className="mt-1 block w-full border rounded-lg p-2"
                  />
                </div>
              </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Question Text</label>
              <textarea 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)} 
                required 
                className="mt-1 block w-full border rounded-lg p-2" 
                rows="3"
                placeholder="Enter your question here..."
              ></textarea>
            </div>

            {questionType === 'MCQ' && (
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Options</label>
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={(e) => handleOptionChange(index, e.target.value)} 
                      required 
                      className="flex-1 border rounded-lg p-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">Correct Answer (must match an option exactly)</label>
                  <input 
                    type="text" 
                    value={correctAnswer} 
                    onChange={(e) => setCorrectAnswer(e.target.value)} 
                    required 
                    className="mt-1 block w-full border rounded-lg p-2"
                    placeholder="Enter the correct answer"
                  />
                </div>
              </div>
            )}

            {questionType === 'Coding' && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Programming Language</label>
                    <select 
                      value={programmingLanguage} 
                      onChange={(e) => setProgrammingLanguage(e.target.value)} 
                      className="mt-1 block w-full border rounded-lg p-2"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Sample Input</label>
                    <textarea 
                      value={sampleInput} 
                      onChange={(e) => setSampleInput(e.target.value)} 
                      className="mt-1 block w-full border rounded-lg p-2 font-mono text-sm" 
                      rows="2"
                      placeholder="5"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Sample Output</label>
                    <textarea 
                      value={sampleOutput} 
                      onChange={(e) => setSampleOutput(e.target.value)} 
                      className="mt-1 block w-full border rounded-lg p-2 font-mono text-sm" 
                      rows="2"
                      placeholder="120"
                    ></textarea>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Starter Code (optional)</label>
                  <textarea 
                    value={starterCode} 
                    onChange={(e) => setStarterCode(e.target.value)} 
                    className="mt-1 block w-full border rounded-lg p-2 font-mono text-sm bg-gray-900 text-green-400" 
                    rows="4"
                    placeholder="def solution(n):&#10;    # Write your code here&#10;    pass"
                  ></textarea>
                </div>
                <label className="block text-gray-700 font-medium mb-2">Test Cases</label>
                {testCases.map((tc, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Test Case {index + 1}</h4>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                            className="rounded"
                          />
                          Hidden
                        </label>
                        {testCases.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeTestCase(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <label className="block text-gray-600 text-sm">Input (e.g., 5 or [1,2,3])</label>
                    <textarea 
                      value={tc.input} 
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} 
                      className="mt-1 block w-full border rounded-lg p-2 font-mono text-sm" 
                      rows="2"
                      placeholder="5"
                    ></textarea>
                    <label className="block text-gray-600 text-sm mt-2">Expected Output</label>
                    <textarea 
                      value={tc.output} 
                      onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} 
                      className="mt-1 block w-full border rounded-lg p-2 font-mono text-sm" 
                      rows="2"
                      placeholder="120"
                    ></textarea>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addTestCase} 
                  className="mb-4 text-sm text-indigo-600 hover:underline font-medium"
                >
                  + Add Another Test Case
                </button>
              </div>
            )}

            {questionType === 'TrueFalse' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Correct Answer</label>
                <select 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)} 
                  required
                  className="mt-1 block w-full border rounded-lg p-2"
                >
                  <option value="">Select correct answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}

            {questionType === 'FillInBlank' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Correct Answer</label>
                <input 
                  type="text" 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)} 
                  required 
                  className="mt-1 block w-full border rounded-lg p-2"
                  placeholder="Enter the correct answer"
                />
              </div>
            )}

            {/* Explanation (optional) */}
            <div className="mb-4">
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-indigo-600 hover:underline"
              >
                {showAdvanced ? '- Hide' : '+ Show'} Advanced Options
              </button>
            </div>
            
            {showAdvanced && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Explanation (shown after test)</label>
                <textarea 
                  value={explanation} 
                  onChange={(e) => setExplanation(e.target.value)} 
                  className="mt-1 block w-full border rounded-lg p-2" 
                  rows="2"
                  placeholder="Explain the correct answer..."
                ></textarea>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all mt-4"
            >
              Create Question
            </button>
            </form>
          )}

          {/* Question List Tab */}
          {activeTab === 'list' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="MCQ">MCQ</option>
                  <option value="Coding">Coding</option>
                  <option value="TrueFalse">True/False</option>
                  <option value="FillInBlank">Fill in Blank</option>
                </select>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="React">React</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="DSA">DSA</option>
                  <option value="General">General</option>
                  <option value="Database">Database</option>
                  <option value="System Design">System Design</option>
                </select>
                <select 
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Showing {filteredQuestions.length} of {questions.length} questions
              </p>
              <div className="space-y-3">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(q => (
                    <div key={q._id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{q.questionText}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              q.questionType === 'MCQ' ? 'bg-blue-100 text-blue-700' : 
                              q.questionType === 'Coding' ? 'bg-purple-100 text-purple-700' :
                              q.questionType === 'TrueFalse' ? 'bg-cyan-100 text-cyan-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {q.questionType}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {q.difficulty}
                            </span>
                            {q.category && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {q.category}
                              </span>
                            )}
                            {q.isAIGenerated && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI
                              </span>
                            )}
                            {q.points > 1 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                {q.points} pts
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {q.questionType === 'MCQ' && q.options && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <ul className="space-y-1">
                            {q.options.map((opt, i) => (
                              <li key={i} className={`flex items-center gap-2 ${opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${opt === q.correctAnswer ? 'bg-green-100' : 'bg-gray-200'}`}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                                {opt === q.correctAnswer && (
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {q.questionType === 'TrueFalse' && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Correct Answer: {q.correctAnswer}
                        </div>
                      )}
                      {q.questionType === 'Coding' && q.testCases && (
                        <div className="mt-3 text-sm text-gray-600">
                          {q.testCases.length} test case(s) • {q.programmingLanguage || 'python'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No questions found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;

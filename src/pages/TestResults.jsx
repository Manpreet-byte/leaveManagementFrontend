import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

const TestResults = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/api/tests/my-submissions');
        setSubmissions(data);
        setLoading(false);
      } catch (err) {
        console.error('Test results error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load test results.');
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) return <div className="text-center p-8">Loading your test results...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">My Test Results</h1>
      <p className="text-gray-600 mb-4">View the results of all tests you have taken.</p>
      
      {submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't taken any tests yet.</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    Leave: {submission.leaveRequest?.subject || 'N/A'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    submission.isPassed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {submission.score}/{submission.totalQuestions}
                  </div>
                  <div className={`text-sm font-semibold mt-1 px-3 py-1 rounded ${
                    submission.isPassed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submission.isPassed ? 'PASSED' : 'FAILED'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Percentage:</span>
                    <span className="ml-2 font-semibold">
                      {((submission.score / submission.totalQuestions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tab Switches:</span>
                    <span className={`ml-2 font-semibold ${
                      submission.tabSwitchCount > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {submission.tabSwitchCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Leave Status:</span>
                    <span className={`ml-2 font-semibold ${
                      submission.leaveRequest?.status === 'Approved' ? 'text-green-600' :
                      submission.leaveRequest?.status === 'Rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {submission.leaveRequest?.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default TestResults;

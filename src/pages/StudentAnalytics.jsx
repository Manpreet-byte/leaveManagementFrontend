import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';

const StudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/api/analytics/student');
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        console.error('Analytics error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load your analytics.');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Performance Dashboard</h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-blue-100 text-sm">Total Leave Requests</p>
          <p className="text-4xl font-bold">{analytics.leaves.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-green-100 text-sm">Approval Rate</p>
          <p className="text-4xl font-bold">{analytics.leaves.approvalRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-purple-100 text-sm">Tests Passed</p>
          <p className="text-4xl font-bold">{analytics.tests.passed}/{analytics.tests.total}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
          <p className="text-orange-100 text-sm">Average Score</p>
          <p className="text-4xl font-bold">{analytics.tests.averageScore}%</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">📋 Leave Request Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>Pending / In Progress</span>
              </div>
              <span className="font-bold text-lg">{analytics.leaves.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Approved</span>
              </div>
              <span className="font-bold text-lg text-green-600">{analytics.leaves.approved}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>Rejected</span>
              </div>
              <span className="font-bold text-lg text-red-600">{analytics.leaves.rejected}</span>
            </div>
          </div>
        </div>

        {/* Test Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">📝 Test Performance</h2>
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-indigo-600"
                  strokeWidth="10"
                  strokeDasharray={`${parseFloat(analytics.tests.passRate) * 3.51} 351`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }}
                />
              </svg>
              <span className="absolute text-2xl font-bold">{analytics.tests.passRate}%</span>
            </div>
            <p className="text-gray-600 mt-2">Pass Rate</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analytics.tests.total}</p>
              <p className="text-xs text-gray-600">Total Tests</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{analytics.tests.passed}</p>
              <p className="text-xs text-gray-600">Passed</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{analytics.tests.failed}</p>
              <p className="text-xs text-gray-600">Failed</p>
            </div>
          </div>
          {analytics.tests.totalTabSwitches > 0 && (
            <p className="text-sm text-orange-600 mt-4 text-center">
              ⚠️ Tab switches detected: {analytics.tests.totalTabSwitches}
            </p>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {analytics.recentSubmissions && analytics.recentSubmissions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">📊 Recent Test Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Subject</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Result</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentSubmissions.map((sub, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{sub.subject}</td>
                    <td className="py-3 px-4 text-center">{sub.score}/{sub.totalQuestions}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        parseFloat(sub.percentage) >= 60 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.passed ? (
                        <span className="text-green-600 font-semibold">✓ Passed</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ Failed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(sub.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Trend */}
      {analytics.performanceTrend && analytics.performanceTrend.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">📈 Performance Over Time</h2>
          <div className="flex items-end gap-2 h-48">
            {analytics.performanceTrend.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-500 ${
                    item.passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${parseFloat(item.score) * 1.5}px` }}
                  title={`${item.score}% - ${new Date(item.date).toLocaleDateString()}`}
                ></div>
                <p className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span className="text-sm text-gray-600">Passed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span className="text-sm text-gray-600">Failed</span>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">💡 Tips to Improve</h2>
        <ul className="space-y-2">
          {parseFloat(analytics.tests.averageScore) < 60 && (
            <li>• Your average score is below 60%. Review the subject material before taking tests.</li>
          )}
          {analytics.tests.totalTabSwitches > 0 && (
            <li>• Avoid switching tabs during tests as it's flagged as potential cheating.</li>
          )}
          {analytics.leaves.rejected > 0 && (
            <li>• Some of your leave requests were rejected. Ensure your reasons are valid.</li>
          )}
          {analytics.tests.total === 0 && (
            <li>• You haven't taken any tests yet. Submit a leave request to get started!</li>
          )}
          {parseFloat(analytics.tests.averageScore) >= 80 && (
            <li>• Great job! Your performance is excellent. Keep up the good work! 🎉</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StudentAnalytics;

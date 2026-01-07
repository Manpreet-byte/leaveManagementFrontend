import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get('/api/analytics/dashboard', config);
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics. Admin access required.');
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
        <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leave Requests" 
          value={analytics.leaves.total} 
          icon="📋"
          color="bg-blue-500"
        />
        <StatCard 
          title="Approval Rate" 
          value={`${analytics.leaves.approvalRate}%`} 
          icon="✅"
          color="bg-green-500"
        />
        <StatCard 
          title="Test Pass Rate" 
          value={`${analytics.tests.passRate}%`} 
          icon="📝"
          color="bg-purple-500"
        />
        <StatCard 
          title="Average Score" 
          value={`${analytics.tests.averageScore}%`} 
          icon="📊"
          color="bg-orange-500"
        />
      </div>

      {/* Leave Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Leave Request Status</h2>
          <div className="space-y-4">
            <StatusBar label="Pending" value={analytics.leaves.pending} total={analytics.leaves.total} color="bg-yellow-500" />
            <StatusBar label="Test Assigned" value={analytics.leaves.testAssigned} total={analytics.leaves.total} color="bg-blue-500" />
            <StatusBar label="Test Completed" value={analytics.leaves.testCompleted} total={analytics.leaves.total} color="bg-purple-500" />
            <StatusBar label="Approved" value={analytics.leaves.approved} total={analytics.leaves.total} color="bg-green-500" />
            <StatusBar label="Rejected" value={analytics.leaves.rejected} total={analytics.leaves.total} color="bg-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Test Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{analytics.tests.passed}</p>
              <p className="text-sm text-gray-600">Tests Passed</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{analytics.tests.failed}</p>
              <p className="text-sm text-gray-600">Tests Failed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{analytics.tests.totalSubmissions}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{analytics.tests.totalTabSwitches}</p>
              <p className="text-sm text-gray-600">Tab Switches (Cheating Attempts)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users and Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Users</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Students</span>
              <span className="font-bold text-lg">{analytics.users.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Admins</span>
              <span className="font-bold text-lg">{analytics.users.totalAdmins}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Users</span>
              <span className="font-bold text-xl text-indigo-600">{analytics.users.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Question Bank</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">MCQ Questions</span>
              <span className="font-bold text-lg text-blue-600">{analytics.questions.mcq}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Coding Questions</span>
              <span className="font-bold text-lg text-purple-600">{analytics.questions.coding}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Questions</span>
              <span className="font-bold text-xl text-indigo-600">{analytics.questions.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Activity (7 days)</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Leave Requests</span>
              <span className="font-bold text-lg">{analytics.recentActivity.leaves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Test Submissions</span>
              <span className="font-bold text-lg">{analytics.recentActivity.submissions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      {analytics.topStudents && analytics.topStudents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">🏆 Top Performing Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-center">Avg Score</th>
                  <th className="py-3 px-4 text-center">Tests Taken</th>
                  <th className="py-3 px-4 text-center">Tests Passed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topStudents.map((student, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded ${
                        parseFloat(student.avgScore) >= 80 ? 'bg-green-100 text-green-800' :
                        parseFloat(student.avgScore) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{student.totalTests}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-medium">{student.passedTests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trends */}
      {analytics.trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Leave Requests Trend (30 days)</h2>
            {analytics.trends.leaves.length > 0 ? (
              <div className="space-y-2">
                {analytics.trends.leaves.slice(-10).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">{item._id}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-indigo-500 h-4 rounded-full" 
                        style={{ width: `${Math.min(item.count * 10, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Test Performance Trend (30 days)</h2>
            {analytics.trends.tests.length > 0 ? (
              <div className="space-y-2">
                {analytics.trends.tests.slice(-10).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">{item._id}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${item.avgScore >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${item.avgScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12">{item.avgScore.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className={`${color} h-2`}></div>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  </div>
);

// Status Bar Component
const StatusBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

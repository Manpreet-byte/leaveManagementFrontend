import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    testCompleted: 0,
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
      fetchLeaveRequests();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchLeaveRequests = async () => {
    try {
      const { data } = await api.get('/api/leave');
      setLeaveRequests(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'pending' || r.status === 'Pending').length,
        approved: data.filter(r => r.status === 'approved' || r.status === 'Approved').length,
        rejected: data.filter(r => r.status === 'rejected' || r.status === 'Rejected').length,
        testCompleted: data.filter(r => r.status === 'Test Completed').length,
        testAssigned: data.filter(r => r.status === 'Test Assigned').length,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-indigo-200">
              {user.role === 'admin' 
                ? 'Manage leave requests and monitor system activity' 
                : 'Track your leave requests and take assessments'}
            </p>
          </div>
          <span className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium capitalize backdrop-blur-sm flex items-center gap-2">
            {user.role === 'admin' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
            {user.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending + (stats.testAssigned || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{user.role === 'admin' ? 'Rejected' : 'Awaiting Review'}</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{user.role === 'admin' ? stats.rejected : stats.testCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              {user.role === 'admin' ? (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {user.role === 'student' ? (
            <>
              <Link to="/leave-request">
                <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium py-3 px-5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Leave Request
                </button>
              </Link>
              <Link to="/calendar">
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-3 px-5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Calendar
                </button>
              </Link>
              <Link to="/test-results">
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  My Test Results
                </button>
              </Link>
              <Link to="/my-analytics">
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-3 px-5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  My Analytics
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/manage-questions">
                <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium py-3 px-5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Manage Questions
                </button>
              </Link>
              <Link to="/reports">
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-3 px-5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Reports
                </button>
              </Link>
              <Link to="/users">
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-3 px-5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Users
                </button>
              </Link>
              <Link to="/settings">
                <button className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium py-3 px-5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.role === 'student' ? 'Your Leave Requests' : 'Recent Leave Requests'}
            </h2>
            <Link to="/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View Calendar →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading requests...</p>
          </div>
        ) : (
          <LeaveRequestList requests={leaveRequests} isAdmin={user.role === 'admin'} />
        )}
      </div>
    </div>
  );
};

// Helper to get status badge style
const getStatusBadge = (status) => {
  const statusLower = status?.toLowerCase();
  const styles = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'test assigned': 'bg-blue-100 text-blue-800',
    'test completed': 'bg-purple-100 text-purple-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  return styles[statusLower] || 'bg-gray-100 text-gray-800';
};

const LeaveRequestList = ({ requests, isAdmin = false }) => {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No leave requests found</p>
        {!isAdmin && (
          <Link to="/leave-request" className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
            Create your first request
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.slice(0, 10).map((req) => (
            <tr key={req._id} className="hover:bg-gray-50">
              {isAdmin && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {req.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{req.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{req.user?.email || ''}</div>
                    </div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4">
                <div className="text-gray-900 max-w-xs truncate">{req.reason}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {req.leaveDates && Array.isArray(req.leaveDates) && req.leaveDates.length > 0
                  ? req.leaveDates.slice(0, 2).map(d => new Date(d).toLocaleDateString()).join(', ') + (req.leaveDates.length > 2 ? ` +${req.leaveDates.length - 2}` : '')
                  : 'N/A'
                }
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                  {req.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {!isAdmin && req.status === 'Test Assigned' && req.test && (
                  <Link to={`/test/${req.test}`}>
                    <button className="bg-blue-600 text-white font-medium py-1.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Take Test
                    </button>
                  </Link>
                )}
                {!isAdmin && req.status === 'Test Completed' && (
                  <span className="inline-flex items-center gap-1.5 text-purple-600 font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Under Review
                  </span>
                )}
                {!isAdmin && (req.status === 'approved' || req.status === 'Approved') && (
                  <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                )}
                {!isAdmin && (req.status === 'rejected' || req.status === 'Rejected') && (
                  <span className="inline-flex items-center gap-1.5 text-red-600 font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rejected
                  </span>
                )}
                {isAdmin && (
                  <Link to={`/leave/${req._id}`}>
                    <button className="bg-indigo-600 text-white font-medium py-1.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      Review
                    </button>
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {requests.length > 10 && (
        <div className="p-4 text-center border-t border-gray-100">
          <Link to="/calendar" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View all {requests.length} requests →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

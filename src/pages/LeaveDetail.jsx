import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isAdmin = userInfo?.role === 'admin';

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get(`/api/leave/${id}`, config);
        setLeaveRequest(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load leave request details.');
        setLoading(false);
      }
    };
    fetchLeaveRequest();
  }, [id, userInfo?.token]);

  const handleStatusUpdate = async (status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      await axios.put(`/api/leave/${id}/status`, { status }, config);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Helper to format leave dates
  const formatLeaveDates = (dates) => {
    if (!dates) return 'N/A';
    if (typeof dates === 'string') return dates;
    if (dates.from && dates.to) {
      return `${new Date(dates.from).toLocaleDateString()} - ${new Date(dates.to).toLocaleDateString()}`;
    }
    return JSON.stringify(dates);
  };

  // Helper to get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Test Assigned': 'bg-blue-100 text-blue-800',
      'Test Completed': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center p-8">Loading details...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!leaveRequest) return null;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leave Request Details</h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Student Info</h2>
          <p><strong>Name:</strong> {leaveRequest.student?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {leaveRequest.student?.email || 'N/A'}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Request Info</h2>
          <p><strong>Subject:</strong> {leaveRequest.subject}</p>
          <p><strong>Reason:</strong> {leaveRequest.reason}</p>
          <p><strong>Dates:</strong> {formatLeaveDates(leaveRequest.leaveDates)}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusBadge(leaveRequest.status)}`}>
              {leaveRequest.status}
            </span>
          </p>
        </div>
      </div>

      {leaveRequest.test && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Test Status</p>
              <p className="font-semibold">{leaveRequest.test.status}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Score</p>
              <p className="font-semibold text-xl">
                {leaveRequest.test.score !== undefined ? leaveRequest.test.score : 'N/A'} 
                {leaveRequest.test.questions && ` / ${leaveRequest.test.questions.length}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Passed</p>
              <p className={`font-semibold ${leaveRequest.test.score >= Math.ceil((leaveRequest.test.questions?.length || 0) * 0.6) ? 'text-green-600' : 'text-red-600'}`}>
                {leaveRequest.test.score >= Math.ceil((leaveRequest.test.questions?.length || 0) * 0.6) ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdmin && leaveRequest.status === 'Test Completed' && (
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            onClick={() => handleStatusUpdate('Approved')}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition-colors"
          >
            Approve Leave
          </button>
          <button
            onClick={() => handleStatusUpdate('Rejected')}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 transition-colors"
          >
            Reject Leave
          </button>
        </div>
      )}

      {isAdmin && leaveRequest.status !== 'Test Completed' && leaveRequest.status !== 'Approved' && leaveRequest.status !== 'Rejected' && (
        <div className="text-center py-4 text-gray-500 italic">
          Awaiting student to complete the test before approval/rejection.
        </div>
      )}
    </div>
  );
};

export default LeaveDetail;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    reason: '',
    fromDate: '',
    toDate: '',
    subject: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { reason, fromDate, toDate, subject } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    // Validate dates
    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be after To date');
      setSubmitting(false);
      return;
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      };
      const leaveDates = { from: fromDate, to: toDate };
      await axios.post('/api/leave', { reason, leaveDates, subject }, config);
      setSuccess('Leave request submitted successfully! A test will be assigned shortly.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate leave duration
  const getLeaveDuration = () => {
    if (!fromDate || !toDate) return null;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} day(s)` : null;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Submit Leave Request</h2>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>Note:</strong> After submitting a leave request, you will be assigned a test to complete. 
          Your leave will be reviewed by an admin after you pass the test.
        </p>
      </div>
      
      {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4 p-3 bg-green-50 rounded">{success}</p>}
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Subject/Course</label>
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={onChange}
            required
            placeholder="e.g., Mathematics, Computer Science"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Reason for Leave</label>
          <textarea
            name="reason"
            value={reason}
            onChange={onChange}
            required
            placeholder="Please explain why you need leave..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="4"
          ></textarea>
        </div>
        
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={fromDate}
              onChange={onChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={toDate}
              onChange={onChange}
              required
              min={fromDate || new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {getLeaveDuration() && (
          <p className="text-sm text-gray-600 mb-4">
            Leave duration: <strong>{getLeaveDuration()}</strong>
          </p>
        )}
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  );
};

export default LeaveRequest;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LeaveCalendar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setUser(userInfo);
    fetchLeaveRequests(userInfo.token);
  }, [navigate]);

  const fetchLeaveRequests = async (token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/leave', config);
      setLeaveRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
      case 'test assigned':
      case 'test completed':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusBgColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-green-100 border-green-300';
      case 'rejected':
        return 'bg-red-100 border-red-300';
      case 'pending':
      case 'test assigned':
      case 'test completed':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  const getLeavesForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    
    return leaveRequests.filter(leave => {
      if (!leave.leaveDates) return false;
      
      // Handle leaveDates as object with from/to
      if (leave.leaveDates.from && leave.leaveDates.to) {
        const fromDate = new Date(leave.leaveDates.from);
        const toDate = new Date(leave.leaveDates.to);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return date >= fromDate && date <= toDate;
      }
      
      // Handle leaveDates as array (legacy support)
      if (Array.isArray(leave.leaveDates) && leave.leaveDates.length > 0) {
        return leave.leaveDates.some(leaveDate => {
          const d = new Date(leaveDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === date.getTime();
        });
      }
      
      return false;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📅 Leave Calendar</h1>
        <p className="text-indigo-200">
          Visualize all {user?.role === 'admin' ? '' : 'your '}leave requests on the calendar
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for starting day */}
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/50"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayLeaves = getLeavesForDate(day);
            
            return (
              <div
                key={day}
                className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${
                  isToday(day) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) 
                    ? 'w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white' 
                    : 'text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayLeaves.slice(0, 2).map(leave => (
                    <button
                      key={leave._id}
                      onClick={() => setSelectedLeave(leave)}
                      className={`w-full text-left text-xs p-1 rounded truncate ${getStatusBgColor(leave.status)} border hover:opacity-80 transition-opacity`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(leave.status)} mr-1`}></span>
                      {user?.role === 'admin' ? leave.user?.name : leave.reason}
                    </button>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayLeaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Rejected</span>
          </div>
        </div>
      </div>

      {/* Leave Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending Requests</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(l => l.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-500">Approved Requests</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {leaveRequests.filter(l => l.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-500">Rejected Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLeave(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Leave Request Details</h3>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {user?.role === 'admin' && (
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium">{selectedLeave.user?.name || 'Unknown'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedLeave.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedLeave.status === 'approved' ? 'bg-green-100 text-green-700' :
                  selectedLeave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedLeave.status)}`}></span>
                  {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Leave Dates</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedLeave.leaveDates?.map((date, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
              {selectedLeave.testScore !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Test Score</p>
                  <p className="font-medium">{selectedLeave.testScore}%</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/leave/${selectedLeave._id}`)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => setSelectedLeave(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;

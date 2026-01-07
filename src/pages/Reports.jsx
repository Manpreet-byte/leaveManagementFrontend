import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Helper function to format leave dates (handles both array and object formats)
const formatLeaveDates = (leaveDates, separator = ', ') => {
  if (!leaveDates) return 'N/A';
  if (Array.isArray(leaveDates)) {
    return leaveDates.map(d => new Date(d).toLocaleDateString()).join(separator);
  }
  if (leaveDates.from && leaveDates.to) {
    return `${new Date(leaveDates.from).toLocaleDateString()} - ${new Date(leaveDates.to).toLocaleDateString()}`;
  }
  return 'N/A';
};

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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
      
      // Calculate stats - handle various status values
      setStats({
        total: data.length,
        pending: data.filter(l => 
          l.status === 'pending' || 
          l.status === 'Pending' ||
          l.status === 'Test Assigned' || 
          l.status === 'Test Completed'
        ).length,
        approved: data.filter(l => 
          l.status === 'approved' || 
          l.status === 'Approved'
        ).length,
        rejected: data.filter(l => 
          l.status === 'rejected' || 
          l.status === 'Rejected'
        ).length,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      setLoading(false);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    // Status filter
    if (filters.status !== 'all') {
      const status = request.status?.toLowerCase();
      if (filters.status === 'pending') {
        if (status !== 'pending' && status !== 'test assigned' && status !== 'test completed') {
          return false;
        }
      } else if (filters.status === 'approved') {
        if (status !== 'approved') return false;
      } else if (filters.status === 'rejected') {
        if (status !== 'rejected') return false;
      }
    }

    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const requestDate = new Date(request.createdAt);
      if (requestDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      const requestDate = new Date(request.createdAt);
      if (requestDate > toDate) return false;
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesReason = request.reason?.toLowerCase().includes(term);
      const matchesSubject = request.subject?.toLowerCase().includes(term);
      const matchesStudent = request.student?.name?.toLowerCase().includes(term);
      const matchesEmail = request.student?.email?.toLowerCase().includes(term);
      if (!matchesReason && !matchesSubject && !matchesStudent && !matchesEmail) return false;
    }

    return true;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Student Name', 'Email', 'Subject', 'Reason', 'Leave Dates', 'Status', 'Test Score', 'Created At'];
    
    const csvData = filteredRequests.map(request => [
      request._id,
      request.student?.name || 'N/A',
      request.student?.email || 'N/A',
      `"${request.subject?.replace(/"/g, '""') || ''}"`,
      `"${request.reason?.replace(/"/g, '""') || ''}"`,
      formatLeaveDates(request.leaveDates, '; '),
      request.status,
      request.testScore ?? 'N/A',
      new Date(request.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonData = filteredRequests.map(request => ({
      id: request._id,
      student: {
        name: request.student?.name,
        email: request.student?.email,
      },
      subject: request.subject,
      reason: request.reason,
      leaveDates: request.leaveDates,
      status: request.status,
      testScore: request.testScore,
      createdAt: request.createdAt,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leave Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
          .stats { display: flex; gap: 20px; margin-bottom: 20px; }
          .stat-box { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-box h3 { margin: 0; font-size: 24px; }
          .stat-box p { margin: 5px 0 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4F46E5; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status-approved { color: green; font-weight: bold; }
          .status-rejected { color: red; font-weight: bold; }
          .status-pending { color: orange; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📋 Leave Management Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Generated by: ${user?.name} (${user?.role})</p>
        
        <div class="stats">
          <div class="stat-box"><h3>${stats.total}</h3><p>Total Requests</p></div>
          <div class="stat-box"><h3>${stats.pending}</h3><p>Pending</p></div>
          <div class="stat-box"><h3>${stats.approved}</h3><p>Approved</p></div>
          <div class="stat-box"><h3>${stats.rejected}</h3><p>Rejected</p></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Reason</th>
              <th>Leave Dates</th>
              <th>Status</th>
              <th>Test Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRequests.map((req, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${req.student?.name || 'N/A'}<br><small>${req.student?.email || ''}</small></td>
                <td>${req.subject || req.reason || 'N/A'}</td>
                <td>${formatLeaveDates(req.leaveDates)}</td>
                <td class="status-${req.status}">${req.status}</td>
                <td>${req.testScore ?? 'N/A'}</td>
                <td>${new Date(req.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Leave Management System - Test-Based Student Leave Verification</p>
          <p>Total Records: ${filteredRequests.length}</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'test completed': return 'bg-blue-100 text-blue-800';
      case 'test assigned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="text-3xl font-bold">Leave Reports & Analytics</h1>
        </div>
        <p className="text-indigo-200">
          Generate, filter, and export leave request reports
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filters & Export
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, reason..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-gray-600">
            Showing <strong>{filteredRequests.length}</strong> of <strong>{leaveRequests.length}</strong> requests
          </span>
          {(filters.status !== 'all' || filters.dateFrom || filters.dateTo || filters.searchTerm) && (
            <button
              onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '', searchTerm: '' })}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No leave requests match your filters
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{request.student?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{request.student?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {request.subject || request.reason || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatLeaveDates(request.leaveDates)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.testScore !== undefined ? `${request.testScore}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

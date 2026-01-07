import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get('/api/audit-logs', config);
        setLogs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load audit logs. Admin access required.');
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center p-8">Loading audit logs...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Audit Trail</h1>
      <p className="text-gray-600 mb-4">History of all admin actions on leave requests.</p>
      
      {logs.length === 0 ? (
        <p className="text-gray-500">No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left">Date & Time</th>
                <th className="py-3 px-4 border-b text-left">Admin</th>
                <th className="py-3 px-4 border-b text-left">Action</th>
                <th className="py-3 px-4 border-b text-left">Leave Request</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {log.admin?.name || 'Unknown'} ({log.admin?.email || 'N/A'})
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      log.action === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {log.leaveRequest?.subject || 'N/A'} - {log.leaveRequest?.status || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load notifications.');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      await axios.put(`/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      await axios.delete(`/api/notifications/${id}`, config);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'leave_update': return '📋';
      case 'test_assigned': return '📝';
      case 'test_result': return '📊';
      default: return 'ℹ️';
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'test_assigned': return 'border-l-blue-500 bg-blue-50';
      case 'test_result': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">{unreadCount} unread notification(s)</p>
          )}
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-indigo-600 hover:underline text-sm"
            >
              Mark all as read
            </button>
          )}
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">🔔</p>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border-l-4 p-4 rounded-r-lg transition-all ${getTypeStyle(notification.type)} ${
                !notification.isRead ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <div>
                    <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        className="text-indigo-600 text-sm hover:underline mt-2 inline-block"
                        onClick={() => markAsRead(notification._id)}
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-gray-400 hover:text-indigo-600 text-sm"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

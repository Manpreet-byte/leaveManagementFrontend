import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isAuthenticated = !!userInfo;
  const isAdmin = userInfo?.role === 'admin';
  const isStudent = userInfo?.role === 'student';

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/notifications/unread-count', config);
      setUnreadCount(data.count);
    } catch (e) {
      // Ignore errors
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
    } catch (e) {
      // Ignore logout API errors
    }
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">LeaveSys</span>
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Desktop menu */}
        <div className="hidden sm:flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard') || isActive('/')}>
                Dashboard
              </NavLink>
              
              {isStudent && (
                <>
                  <NavLink to="/leave-request" active={isActive('/leave-request')}>
                    New Leave
                  </NavLink>
                  <NavLink to="/calendar" active={isActive('/calendar')}>
                    Calendar
                  </NavLink>
                  <NavLink to="/test-results" active={isActive('/test-results')}>
                    Results
                  </NavLink>
                  <NavLink to="/my-analytics" active={isActive('/my-analytics')}>
                    Analytics
                  </NavLink>
                </>
              )}
              
              {isAdmin && (
                <>
                  <NavLink to="/manage-questions" active={isActive('/manage-questions')}>
                    Questions
                  </NavLink>
                  <NavLink to="/calendar" active={isActive('/calendar')}>
                    Calendar
                  </NavLink>
                  <NavLink to="/reports" active={isActive('/reports')}>
                    Reports
                  </NavLink>
                  <NavLink to="/users" active={isActive('/users')}>
                    Users
                  </NavLink>
                  <NavLink to="/settings" active={isActive('/settings')}>
                    Settings
                  </NavLink>
                </>
              )}
              
              {/* Notifications */}
              <Link 
                to="/notifications" 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Profile Link */}
              <Link 
                to="/profile" 
                className={`p-2 rounded-lg transition-colors ${isActive('/profile') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              
              <span className="text-gray-600 text-sm px-2 font-medium">
                {userInfo?.name}
              </span>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" active={isActive('/login')}>
                Login
              </NavLink>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Register
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="w-full sm:hidden mt-3 flex flex-col space-y-1 bg-gray-50 border border-gray-200 rounded-xl p-2 shadow-lg">
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </MobileNavLink>
                
                {isStudent && (
                  <>
                    <MobileNavLink to="/leave-request" onClick={() => setMenuOpen(false)}>
                      New Leave Request
                    </MobileNavLink>
                    <MobileNavLink to="/calendar" onClick={() => setMenuOpen(false)}>
                      Leave Calendar
                    </MobileNavLink>
                    <MobileNavLink to="/test-results" onClick={() => setMenuOpen(false)}>
                      My Test Results
                    </MobileNavLink>
                    <MobileNavLink to="/my-analytics" onClick={() => setMenuOpen(false)}>
                      My Analytics
                    </MobileNavLink>
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <MobileNavLink to="/manage-questions" onClick={() => setMenuOpen(false)}>
                      Manage Questions
                    </MobileNavLink>
                    <MobileNavLink to="/calendar" onClick={() => setMenuOpen(false)}>
                      Leave Calendar
                    </MobileNavLink>
                    <MobileNavLink to="/reports" onClick={() => setMenuOpen(false)}>
                      Reports & Export
                    </MobileNavLink>
                    <MobileNavLink to="/users" onClick={() => setMenuOpen(false)}>
                      User Management
                    </MobileNavLink>
                    <MobileNavLink to="/settings" onClick={() => setMenuOpen(false)}>
                      Settings
                    </MobileNavLink>
                    <MobileNavLink to="/audit-logs" onClick={() => setMenuOpen(false)}>
                      Audit Log
                    </MobileNavLink>
                  </>
                )}
                
                <MobileNavLink to="/notifications" onClick={() => setMenuOpen(false)}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </MobileNavLink>
                
                <MobileNavLink to="/profile" onClick={() => setMenuOpen(false)}>
                  My Profile
                </MobileNavLink>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="text-gray-600 text-sm px-3 py-2 font-medium">
                  {userInfo?.name} ({userInfo?.role})
                </div>
                
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg text-left transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </MobileNavLink>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

// Desktop nav link component
const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
      active 
        ? 'bg-indigo-100 text-indigo-600' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </Link>
);

// Mobile nav link component
const MobileNavLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    className="block py-2 px-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors font-medium"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header;

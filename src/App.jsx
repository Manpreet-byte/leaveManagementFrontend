import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest';
import ManageQuestions from './pages/ManageQuestions';
import TestPage from './pages/TestPage';
import LeaveDetail from './pages/LeaveDetail';
import AuditLogs from './pages/AuditLogs';
import TestResults from './pages/TestResults';
import AdminAnalytics from './pages/AdminAnalytics';
import StudentAnalytics from './pages/StudentAnalytics';
import Notifications from './pages/Notifications';
import Home from './pages/Home';
import Profile from './pages/Profile';
import LeaveCalendar from './pages/LeaveCalendar';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import OAuthCallback from './pages/OAuthCallback';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Home route - shows Home for guests, Dashboard for logged in users
const HomeRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  return (
    <Routes>
      {/* Home page without Layout for guests */}
      <Route path="/" element={<HomeRoute />} />
      
      {/* All other routes with Layout */}
      <Route element={<Layout />}>
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="oauth-callback" element={<OAuthCallback />} />
        <Route path="leave-request" element={
          <ProtectedRoute allowedRoles={['student']}>
            <LeaveRequest />
          </ProtectedRoute>
        } />
        <Route path="manage-questions" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageQuestions />
          </ProtectedRoute>
        } />
        <Route path="audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="admin-analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="test-results" element={
          <ProtectedRoute allowedRoles={['student']}>
            <TestResults />
          </ProtectedRoute>
        } />
        <Route path="my-analytics" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAnalytics />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="test/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <TestPage />
          </ProtectedRoute>
        } />
        <Route path="leave/:id" element={
          <ProtectedRoute>
            <LeaveDetail />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="calendar" element={
          <ProtectedRoute>
            <LeaveCalendar />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;

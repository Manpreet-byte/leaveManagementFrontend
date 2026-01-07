import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = searchParams.get('user');
    
    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('userInfo', JSON.stringify(user));
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to parse user data:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      setError('No authentication data received. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

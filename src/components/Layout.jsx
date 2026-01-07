import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center text-sm sm:text-base w-full">
        <p>&copy; 2025 Advanced Test-Based Student Leave Management System</p>
      </footer>
    </div>
  );
};

export default Layout;

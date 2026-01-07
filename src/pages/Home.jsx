import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950"></div>
        <div 
          className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ 
            left: mousePosition.x / 10, 
            top: mousePosition.y / 10,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-purple-500/20 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ 
            right: mousePosition.x / 15, 
            bottom: mousePosition.y / 15,
          }}
        ></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>

      {/* Navbar */}
      <nav className={`relative z-50 py-6 px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              LeaveSys
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-6 py-2.5 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-indigo-300">Smart Leave Management System</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Test-Based
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  Leave Approval
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
                Revolutionize your institution's leave management with our AI-powered testing system. 
                Ensure academic accountability while maintaining transparency and fairness.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Start Free Trial
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/login" 
                  className="group px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </Link>
              </div>
              
              {/* Stats Row */}
              <div className="flex gap-8">
                <div className="group">
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">500+</p>
                  <p className="text-gray-500 text-sm">Active Students</p>
                </div>
                <div className="group">
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">98%</p>
                  <p className="text-gray-500 text-sm">Approval Rate</p>
                </div>
                <div className="group">
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">24/7</p>
                  <p className="text-gray-500 text-sm">Available</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - 3D Card */}
            <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transform hover:rotate-1 transition-transform duration-500">
                  {/* Dashboard Preview */}
                  <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-200">Leave Dashboard</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Live</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">📝</div>
                          <div>
                            <p className="text-sm font-medium">Test Completed</p>
                            <p className="text-xs text-gray-500">Score: 85%</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-sm">✓ Passed</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">📅</div>
                          <div>
                            <p className="text-sm font-medium">Leave Request</p>
                            <p className="text-xs text-gray-500">Jan 15 - Jan 18</p>
                          </div>
                        </div>
                        <span className="text-yellow-400 text-sm">⏳ Pending</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">🔔</div>
                          <div>
                            <p className="text-sm font-medium">New Notification</p>
                            <p className="text-xs text-gray-500">Admin approved!</p>
                          </div>
                        </div>
                        <span className="text-indigo-400 text-sm">New</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Preview */}
                  <div className="flex items-end justify-between h-24 px-4">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div 
                        key={i}
                        className="w-6 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-pink-400"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30 transform rotate-3 animate-bounce">
                  <span className="text-sm font-bold">✨ AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to streamline leave management while maintaining academic standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon="🎯"
              title="Test-Based Approval"
              description="Automated testing ensures students demonstrate knowledge before leave approval"
              gradient="from-indigo-500 to-blue-500"
              delay={0}
            />
            <FeatureCard 
              icon="🛡️"
              title="Anti-Cheating System"
              description="Advanced proctoring with tab detection, fullscreen mode, and time limits"
              gradient="from-purple-500 to-pink-500"
              delay={100}
            />
            <FeatureCard 
              icon="📊"
              title="Real-time Analytics"
              description="Comprehensive dashboards with insights for students and administrators"
              gradient="from-pink-500 to-orange-500"
              delay={200}
            />
            <FeatureCard 
              icon="⚡"
              title="Instant Notifications"
              description="Real-time updates on test results, approvals, and status changes"
              gradient="from-orange-500 to-yellow-500"
              delay={300}
            />
            <FeatureCard 
              icon="💻"
              title="Code Execution"
              description="Sandboxed environment for coding questions with automated evaluation"
              gradient="from-green-500 to-emerald-500"
              delay={400}
            />
            <FeatureCard 
              icon="📋"
              title="Complete Audit Trail"
              description="Full transparency with detailed logs of all actions and decisions"
              gradient="from-cyan-500 to-blue-500"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">
              Simple four-step process from request to approval
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform -translate-y-1/2 rounded-full"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StepCard 
                number="01" 
                title="Submit Request" 
                description="Student fills out leave request with dates and reason"
                icon="📤"
              />
              <StepCard 
                number="02" 
                title="Take Test" 
                description="Complete an automated assessment based on your subjects"
                icon="📝"
              />
              <StepCard 
                number="03" 
                title="Auto Evaluation" 
                description="AI grades your test instantly with 60% pass threshold"
                icon="🤖"
              />
              <StepCard 
                number="04" 
                title="Get Approved" 
                description="Admin reviews and approves your leave request"
                icon="✅"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm mb-4">
              User Roles
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Designed for Everyone
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-3xl">👨‍🎓</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Students</h3>
                <ul className="space-y-3">
                  {['Submit leave requests easily', 'Take proctored tests', 'Track request status', 'View personal analytics', 'Receive instant notifications'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Admin Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Administrators</h3>
                <ul className="space-y-3">
                  {['Review all requests', 'Approve or reject leaves', 'Manage question bank', 'Access full analytics', 'View audit trail'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-50"></div>
            
            {/* Content */}
            <div className="relative bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-3xl p-12 md:p-16 text-center border border-white/10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Institution?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join hundreds of institutions using LeaveSys for transparent, fair, and efficient leave management.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/register" 
                  className="group px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/login" 
                  className="px-10 py-4 bg-white/10 border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <span className="text-xl font-bold">LeaveSys</span>
            </div>
            <div className="flex items-center gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 LeaveSys. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, gradient, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-4 transform transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description, icon }) => (
  <div className="group relative">
    <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all duration-500 transform hover:-translate-y-2 text-center">
      <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="absolute top-4 right-4 text-5xl font-bold text-white/5">{number}</span>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default Home;

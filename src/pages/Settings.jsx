import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    passingScore: 60,
    questionsPerTest: 5,
    timePerQuestion: 5,
    maxTabSwitches: 3,
    autoApproveOnPass: false,
    emailNotifications: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setUser(userInfo);
    loadSettings(userInfo.token);
  }, [navigate]);

  const loadSettings = async (token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/settings', config);
      
      // Map backend settings to frontend state
      setSettings({
        passingScore: data.passMark?.value || 60,
        questionsPerTest: data.questionsPerTest?.value || 5,
        timePerQuestion: data.testDuration?.value ? Math.round(data.testDuration.value / (data.questionsPerTest?.value || 5)) : 5,
        maxTabSwitches: data.maxTabSwitches?.value || 3,
        autoApproveOnPass: data.autoApproveOnPass?.value || false,
        emailNotifications: data.emailNotifications?.value || true,
        maintenanceMode: data.maintenanceMode?.value || false,
      });
    } catch (error) {
      // If no settings found, use defaults and also save from localStorage if available
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        },
        withCredentials: true,
      };
      
      // Save to backend
      const settingsToSave = {
        passMark: { value: settings.passingScore, description: 'Pass mark percentage', category: 'test' },
        questionsPerTest: { value: settings.questionsPerTest, description: 'Number of questions per test', category: 'test' },
        testDuration: { value: settings.questionsPerTest * settings.timePerQuestion, description: 'Test duration in minutes', category: 'test' },
        maxTabSwitches: { value: settings.maxTabSwitches, description: 'Maximum tab switches allowed', category: 'test' },
        autoApproveOnPass: { value: settings.autoApproveOnPass, description: 'Auto-approve leave on test pass', category: 'leave' },
        emailNotifications: { value: settings.emailNotifications, description: 'Enable email notifications', category: 'notification' },
        maintenanceMode: { value: settings.maintenanceMode, description: 'System maintenance mode', category: 'system' },
      };
      
      await axios.put('/api/settings', settingsToSave, config);
      
      // Also save to localStorage as backup
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      // Fallback to localStorage if backend fails
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setMessage({ type: 'success', text: 'Settings saved locally!' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        passingScore: 60,
        questionsPerTest: 5,
        timePerQuestion: 5,
        maxTabSwitches: 3,
        autoApproveOnPass: false,
        emailNotifications: true,
        maintenanceMode: false,
      };
      setSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      setMessage({ type: 'success', text: 'Settings reset to defaults!' });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">⚙️ System Settings</h1>
        <p className="text-indigo-200">Configure system-wide settings and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Test Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">📝</span>
          Test Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.passingScore}
              onChange={(e) => setSettings({ ...settings, passingScore: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Minimum score required to pass a test</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions Per Test
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.questionsPerTest}
              onChange={(e) => setSettings({ ...settings, questionsPerTest: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Number of questions in each test</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Per Question (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.timePerQuestion}
              onChange={(e) => setSettings({ ...settings, timePerQuestion: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Time allocated per question</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tab Switches
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxTabSwitches}
              onChange={(e) => setSettings({ ...settings, maxTabSwitches: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Auto-submit after this many tab switches</p>
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">🤖</span>
          Automation
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Auto-Approve on Pass</div>
              <div className="text-sm text-gray-500">Automatically approve leave requests when students pass the test</div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoApproveOnPass}
                onChange={(e) => setSettings({ ...settings, autoApproveOnPass: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-500">Send email notifications for leave status changes</div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-lg">🔧</span>
          System
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
            <div>
              <div className="font-medium text-red-900">Maintenance Mode</div>
              <div className="text-sm text-red-700">Disable student access temporarily for maintenance</div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📊</span>
          Current Configuration Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{settings.passingScore}%</div>
            <div className="text-sm text-gray-500">Pass Mark</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{settings.questionsPerTest}</div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{settings.questionsPerTest * settings.timePerQuestion}</div>
            <div className="text-sm text-gray-500">Total Minutes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{settings.maxTabSwitches}</div>
            <div className="text-sm text-gray-500">Tab Switches</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <button
          onClick={handleReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;

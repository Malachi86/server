import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Calendar, Monitor, User, BookOpen, AlertCircle } from 'lucide-react';
import ManageUsers from './ManageUsers';
import AllRequests from './AllRequests';
import AttendanceReports from './AttendanceReports';
import LabManagement from './LabManagement';
import AuditLog from './AuditLog';
import SystemSettings from './SystemSettings';
import AdminEnrollments from './AdminEnrollments';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    enrollments: 0,
    activeSessions: 0, // Note: These are placeholders as we haven't migrated attendance
    sessionsToday: 0   // Note: These are placeholders as we haven't migrated attendance
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentView === 'home') {
      loadStats();
    }
  }, [currentView]);

  const loadStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Could not load system statistics. The server might be down.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-[#b40000] mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          System Overview
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <StatCard
            icon={<Users size={30} />}
            color="bg-[#b40000]"
            label="Total Users"
            value={stats.totalUsers}
            onClick={() => setCurrentView('users')}
          />
          <StatCard
            icon={<User size={30} />}
            color="bg-blue-600"
            label="Teachers"
            value={stats.teachers}
            onClick={() => setCurrentView('users')}
          />
          <StatCard
            icon={<User size={30} />}
            color="bg-green-600"
            label="Students"
            value={stats.students}
            onClick={() => setCurrentView('users')}
          />
          <StatCard
            icon={<BookOpen size={30} />}
            color="bg-purple-600"
            label="Total Enrollments"
            value={stats.enrollments}
            onClick={() => setCurrentView('requests')}
          />
          {/* Hardcoded placeholders for now */}
          <StatCard
            icon={<Monitor size={30} />}
            color="bg-cyan-600"
            label="Active Sessions"
            value={stats.activeSessions}
            onClick={() => setCurrentView('attendance')}
          />
          <StatCard
            icon={<Calendar size={30} />}
            color="bg-orange-600"
            label="Sessions Today"
            value={stats.sessionsToday}
            onClick={() => setCurrentView('attendance')}
          />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'users': return <ManageUsers />;
      case 'requests': return <AllRequests />;
      case 'attendance': return <AttendanceReports />;
      case 'labs': return <LabManagement />;
      case 'audit': return <AuditLog />;
      case 'settings': return <SystemSettings />;
      case 'admin_enrollments': return <AdminEnrollments />;
      default: return renderHome();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function StatCard({ icon, label, value, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl shadow-lg bg-white p-6 ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`${color} text-white p-4 rounded-xl`}>{icon}</div>
        <div>
          <p className="text-gray-500 text-md">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

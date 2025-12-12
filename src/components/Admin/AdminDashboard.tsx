import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, Monitor, Calendar, BarChart3, Settings, FileText } from 'lucide-react';
import ManageUsers from './ManageUsers';
import AdminEnrollments from './AdminEnrollments';
import LabManagement from './LabManagement'; // Assuming this is for Active Sessions
import AttendanceReports from './AttendanceReports'; // Assuming this is for Sessions Today
import AuditLog from './AuditLog';
import SystemSettings from './SystemSettings';
import AllRequests from './AllRequests';

const API_URL = '/api'; // Relative path for API calls

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    enrollments: 0,
    // Active sessions and sessions today might need more complex logic or a dedicated endpoint
  });

  const loadStats = useCallback(async () => {
    try {
      const [usersRes, enrollmentsRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/enrollments`),
      ]);

      if (!usersRes.ok || !enrollmentsRes.ok) {
        throw new Error('Failed to fetch initial dashboard data');
      }

      const users = await usersRes.json();
      const enrollments = await enrollmentsRes.json();

      setStats({
        totalUsers: users.length,
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        students: users.filter((u: any) => u.role === 'student').length,
        enrollments: enrollments.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      loadStats();
    }
  }, [currentView, loadStats]);

  const renderHome = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-[#b40000] mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">System Overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} onClick={() => setCurrentView('users')} />
        <StatCard icon={<Users />} label="Teachers" value={stats.teachers} onClick={() => setCurrentView('users')} />
        <StatCard icon={<Users />} label="Students" value={stats.students} onClick={() => setCurrentView('users')} />
        <StatCard icon={<BookOpen />} label="Enrollments" value={stats.enrollments} onClick={() => setCurrentView('admin_enrollments')} />
        {/* Add other stat cards as needed */}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'users': return <ManageUsers />;
      case 'admin_enrollments': return <AdminEnrollments />;
      case 'labs': return <LabManagement />;
      case 'attendance': return <AttendanceReports />;
      case 'audit': return <AuditLog />;
      case 'settings': return <SystemSettings />;
      case 'requests': return <AllRequests />;
      default: return renderHome();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function StatCard({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value: number | string, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-gray-500">{label}</div>
        <div className="text-gray-800">{icon}</div>
      </div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, Book, FileText, Calendar, Users, Settings, LogOut,
  BookOpen, BarChart3, FileCheck, Menu, X, RefreshCw, Monitor, MapPin, Scan
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'subjects', label: 'My Subjects', icon: Book },
          { id: 'make-request', label: 'Make Request', icon: FileText },
          { id: 'my-requests', label: 'My Requests', icon: FileCheck },
          { id: 'my-sessions', label: 'My Sessions', icon: Calendar },
          { id: 'enroll', label: 'Enroll in Subject', icon: Users },
          { id: 'library', label: 'Library', icon: BookOpen },
        ];
      case 'teacher':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'reservations', label: 'Room Reservations', icon: MapPin },
          { id: 'pending-requests', label: 'Pending Requests', icon: FileText },
          { id: 'pending-enrollments', label: 'Pending Enrollments', icon: Users },
          { id: 'enrolled-students', label: 'Enrolled Students', icon: Users },
          { id: 'lab-view', label: 'Lab View', icon: Monitor },
          { id: 'manage-subjects', label: 'Manage Subjects', icon: Book },
        ];
      case 'admin':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'requests', label: 'All Requests', icon: FileText },
          { id: 'attendance', label: 'Attendance Reports', icon: Calendar },
          { id: 'labs', label: 'Lab Management', icon: Monitor },
          { id: 'audit', label: 'Audit Log', icon: BarChart3 },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ];
      case 'library_admin':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'books', label: 'Manage Books', icon: BookOpen },
          { id: 'scan-lend', label: 'Scan & Lend', icon: Scan },
          { id: 'borrow-requests', label: 'Borrow Requests', icon: FileText },
          { id: 'borrow-records', label: 'Borrow Records', icon: FileCheck },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#b40000] text-white py-6 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-1">AMA</h1>
            <p className="text-lg">Student Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:sticky top-0 left-0 h-screen w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 flex flex-col`}
        >
          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-[#b40000] to-[#8b0000] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-center mb-1">{user?.name}</h3>
            <p className="text-center text-sm text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <button
              onClick={() => onNavigate('home')}
              className="w-full px-6 py-2 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            
            <div className="h-px bg-gray-200 my-2 mx-4" />

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full px-6 py-3 flex items-center gap-3 transition-colors ${
                    currentView === item.id
                      ? 'bg-red-50 text-[#b40000] border-r-4 border-[#b40000]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
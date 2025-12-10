import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import { BookOpen, FileText, Clock } from 'lucide-react';
import ManageBooks from './ManageBooks';
import BorrowRequests from './BorrowRequests';
import BorrowRecords from './BorrowRecords';
import ScanLend from './ScanLend';

export default function LibraryDashboard() {
  const [currentView, setCurrentView] = useState('home');
  const [stats, setStats] = useState({
    totalBooks: 0,
    available: 0,
    borrowed: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    if (currentView === 'home') {
      loadStats();
    }
  }, [currentView]);

  const loadStats = () => {
    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const requests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');

    setStats({
      totalBooks: books.length,
      available: books.filter((b: any) => b.status === 'Available').length,
      borrowed: books.filter((b: any) => b.status === 'Borrowed').length,
      pendingRequests: requests.filter((r: any) => r.status === 'Pending').length
    });
  };

  const renderHome = () => (
    <div>
      <h2 className="text-3xl mb-2">Library Dashboard</h2>
      <p className="text-gray-600 mb-8">Library management overview</p>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="text-[#b40000]" size={32} />}
          label="Total Books"
          value={stats.totalBooks}
          onClick={() => setCurrentView('books')}
        />
        <StatCard
          icon={<BookOpen className="text-green-600" size={32} />}
          label="Available"
          value={stats.available}
          onClick={() => setCurrentView('books')}
        />
        <StatCard
          icon={<BookOpen className="text-blue-600" size={32} />}
          label="Borrowed"
          value={stats.borrowed}
          onClick={() => setCurrentView('borrow-records')}
        />
        <StatCard
          icon={<FileText className="text-orange-600" size={32} />}
          label="Pending Requests"
          value={stats.pendingRequests}
          onClick={() => setCurrentView('borrow-requests')}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'books':
        return <ManageBooks />;
      case 'scan-lend':
        return <ScanLend />;
      case 'borrow-requests':
        return <BorrowRequests />;
      case 'borrow-records':
        return <BorrowRecords />;
      default:
        return renderHome();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function StatCard({ icon, label, value, onClick }: any) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className="text-3xl">{value}</p>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Book, Users, AlertCircle } from 'lucide-react';
import ManageSubjects from './ManageSubjects';
import EnrolledStudents from './EnrolledStudents';
import PendingEnrollments from './PendingEnrollments';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

interface ISubject {
  id: string;
  name: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentView === 'home' && user) {
      loadSubjects();
    }
  }, [currentView, user]);

  const loadSubjects = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/subjects?teacher_usn=${user.usn}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Could not load your subjects.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div>
      <h2 className="text-3xl mb-2">Welcome, {user?.name}</h2>
      <p className="text-gray-600 text-lg mb-8">Your Subjects Overview</p>

      {error && <div className="text-red-500 bg-red-100 p-4 rounded-lg mb-6">Error: {error}</div>}

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl mb-6 flex items-center gap-2">
          <Book className="text-[#b40000]" />
          Your Active Subjects
        </h3>

        {isLoading ? (
          <p>Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Book size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">You haven\'t created any subjects yet.</p>
            <button
              onClick={() => setCurrentView('manage-subjects')}
              className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
            >
              Create Your First Subject
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{subject.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'manage-subjects': return <ManageSubjects />;
      case 'enrolled-students': return <EnrolledStudents />;
      case 'pending-enrollments': return <PendingEnrollments />;
      default: return renderHome();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Book, Users } from 'lucide-react';
import PendingRequests from './PendingRequests';
import PendingEnrollments from './PendingEnrollments';
import EnrolledStudents from './EnrolledStudents';
import ManageSubjects from './ManageSubjects';
import LabView from './LabView';
import RoomReservations from './RoomReservations';

/* ✅ Interfaces (v2 safe) */
interface ISubject {
  name: string;
}

interface ITeachers {
  [key: string]: {
    subjects: ISubject[];
  };
}

interface IEnrollment {
  teacher: string;
  subject: string;
  status: string;
  student: string;
  student_name: string;
}

interface ISession {
  teacher: string;
  subject: string;
  start_iso: string;
}

interface IAttendance {
  [key: string]: ISession[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (currentView === 'home' && user) {
      loadSubjects();
    }
  }, [currentView, user]);

  const loadSubjects = () => {
    if (!user) return;

    const teachers: ITeachers = JSON.parse(
      localStorage.getItem('teachers') || '{}'
    );

    const teacherData = teachers[user.usn];

    if (teacherData) {
      const subjectNames = teacherData.subjects.map((s) => s.name);
      setSubjects(subjectNames);
    }
  };

  const showSubjectStudents = (subject: string) => {
    if (!user) return;

    const enrollments: IEnrollment[] = JSON.parse(
      localStorage.getItem('enrollments') || '[]'
    );
    const attendance: IAttendance = JSON.parse(
      localStorage.getItem('attendance') || '{}'
    );

    const approved = enrollments.filter(
      (e) =>
        e.teacher === user.usn &&
        e.subject === subject &&
        e.status === 'Approved'
    );

    let message = `Subject: ${subject}\n\nEnrolled Students:\n\n`;

    if (approved.length === 0) {
      alert('No enrolled students yet');
      return;
    }

    approved.forEach((enrollment, idx) => {
      const studentSessions = attendance[enrollment.student] || [];
      const subjectSessions = studentSessions.filter(
        (s) => s.teacher === user.usn && s.subject === subject
      );

      message += `${idx + 1}. ${enrollment.student_name} (${enrollment.student})\n`;
      message += `   Sessions: ${subjectSessions.length}\n`;

      if (subjectSessions.length > 0) {
        const lastSession = subjectSessions[subjectSessions.length - 1];
        message += `   Last session: ${new Date(
          lastSession.start_iso
        ).toLocaleDateString()}\n`;
      }

      message += '\n';
    });

    alert(message);
  };

  /* ✅ SAME UI AS v1 */
  const renderHome = () => (
    <div>
      <h2 className="text-3xl mb-2">Welcome, {user?.name}</h2>
      <p className="text-gray-600 text-lg mb-8">Your Subjects</p>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl mb-6 flex items-center gap-2">
          <Book className="text-[#b40000]" />
          Click a subject to view enrolled students
        </h3>

        {subjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Book size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">Wala pang subjects.</p>
            <button
              onClick={() => setCurrentView('manage-subjects')}
              className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
            >
              Manage Subjects
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {subjects.map((subject, idx) => (
              <button
                key={idx}
                onClick={() => showSubjectStudents(subject)}
                className="p-6 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200 hover:border-[#b40000]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Book size={24} className="text-[#b40000]" />
                    <span className="text-lg">{subject}</span>
                  </div>
                  <Users size={20} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'pending-requests':
        return <PendingRequests />;
      case 'pending-enrollments':
        return <PendingEnrollments />;
      case 'enrolled-students':
        return <EnrolledStudents />;
      case 'lab-view':
        return <LabView />;
      case 'manage-subjects':
        return <ManageSubjects />;
      case 'reservations':
        return <RoomReservations />;
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

import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, BookOpen, MapPin } from 'lucide-react';
import MySubjects from './MySubjects';
import MakeRequest from './MakeRequest';
import MyRequests from './MyRequests';
import MySessions from './MySessions';
import EnrollSubject from './EnrollSubject';
import Library from './Library';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [todayClasses, setTodayClasses] = useState<any[]>([]);

  useEffect(() => {
    if (currentView === 'home') loadTodayClasses();
  }, [currentView]);

  const loadTodayClasses = () => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');

    const myEnrollments = enrollments.filter(
      (e: any) => e.student === user?.usn && e.status === 'Approved'
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = days[new Date().getDay()];
    const todayDate = new Date().toISOString().split('T')[0];
    const now = new Date();

    const classes: any[] = [];

    myEnrollments.forEach((enrollment: any) => {
      const teacherData = teachers[enrollment.teacher];
      if (!teacherData) return;

      const subject = teacherData.subjects.find((s: any) => s.name === enrollment.subject);
      if (!subject?.schedules) return;

      subject.schedules.forEach((schedule: any) => {
        if (schedule.day !== today) return;

        const [sh, sm] = schedule.start.split(':').map(Number);
        const [eh, em] = schedule.end.split(':').map(Number);

        const start = new Date(); start.setHours(sh, sm, 0);
        const end = new Date(); end.setHours(eh, em, 0);

        let status = now >= start && now <= end ? 'ongoing' : 'upcoming';
        if (now > end) return;

        const reservation = reservations.find((r: any) =>
          r.teacher === enrollment.teacher &&
          r.subject === enrollment.subject &&
          r.date === todayDate
        );

        classes.push({
          subject: enrollment.subject,
          teacherName: users[enrollment.teacher]?.name || enrollment.teacher,
          schedule,
          status,
          location: reservation?.location_name || 'No room assigned'
        });
      });
    });

    setTodayClasses(classes);
  };

  const renderHome = () => (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-[#b40000] mb-2">
          Hello, {user?.name}
        </h2>
        <p className="text-gray-600">
          AMA Student Dashboard Today’s Schedule
        </p>
      </div>

      {/* Classes Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl mb-6 flex items-center gap-3">
          <div className="bg-[#b40000] text-white p-2 rounded-lg">
            <Calendar />
          </div>
          Today’s Classes
        </h3>

        {todayClasses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen size={72} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">Wala kang klase ngayon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ongoing */}
            {todayClasses.some(c => c.status === 'ongoing') && (
              <Section
                title="Ongoing Now"
                color="green"
                classes={todayClasses.filter(c => c.status === 'ongoing')}
              />
            )}

            {/* Upcoming */}
            {todayClasses.some(c => c.status === 'upcoming') && (
              <Section
                title="Upcoming Today"
                color="yellow"
                classes={todayClasses.filter(c => c.status === 'upcoming')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'subjects': return <MySubjects />;
      case 'make-request': return <MakeRequest />;
      case 'my-requests': return <MyRequests />;
      case 'my-sessions': return <MySessions />;
      case 'enroll': return <EnrollSubject />;
      case 'library': return <Library />;
      default: return renderHome();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

/* ✅ Reusable Class Section */
function Section({ title, color, classes }: any) {
  const colorMap: any = {
    green: 'bg-green-100 border-green-300 text-green-900',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900'
  };

  return (
    <div>
      <h4 className="mb-4 font-semibold text-gray-700">{title}</h4>
      {classes.map((c: any, i: number) => (
        <div
          key={i}
          className={`border-2 rounded-xl p-5 mb-4 hover:shadow-lg transition-all ${colorMap[color]}`}
        >
          <h5 className="text-xl font-semibold mb-2">{c.subject}</h5>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <User size={16} /> {c.teacherName}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> {c.schedule.start} - {c.schedule.end}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {c.location}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

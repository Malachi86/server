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
    if (currentView === 'home') {
      loadTodayClasses();
    }
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
      if (!subject || !subject.schedules) return;

      subject.schedules.forEach((schedule: any) => {
        if (schedule.day === today) {
          const [startHour, startMin] = schedule.start.split(':').map(Number);
          const [endHour, endMin] = schedule.end.split(':').map(Number);
          
          const startTime = new Date();
          startTime.setHours(startHour, startMin, 0);
          
          const endTime = new Date();
          endTime.setHours(endHour, endMin, 0);

          let status = 'upcoming';
          if (now >= startTime && now <= endTime) {
            status = 'ongoing';
          } else if (now > endTime) {
            status = 'ended';
          }

          // Check if there's a reservation for this class today
          const reservation = reservations.find((r: any) => 
            r.teacher === enrollment.teacher && 
            r.subject === enrollment.subject &&
            r.date === todayDate
          );

          if (status !== 'ended') {
            classes.push({
              subject: enrollment.subject,
              teacher: enrollment.teacher,
              teacherName: users[enrollment.teacher]?.name || enrollment.teacher,
              schedule,
              status,
              enrollment,
              location: reservation ? `${reservation.location_name}` : 'No room assigned',
              locationType: reservation?.location_type || null
            });
          }
        }
      });
    });

    setTodayClasses(classes);
  };

  const renderHome = () => (
    <div>
      <h2 className="text-3xl mb-2">Hello, {user?.name}</h2>
      <p className="text-gray-600 text-lg mb-8">Student Dashboard — Today's Classes</p>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl mb-6 flex items-center gap-2">
          <Calendar className="text-[#b40000]" />
          Today's Classes
        </h3>

        {todayClasses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Wala kang klase ngayon o wala sa oras mo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.filter((c) => c.status === 'ongoing').length > 0 && (
              <div>
                <h4 className="mb-3 text-gray-700">Ongoing Now</h4>
                {todayClasses
                  .filter((c) => c.status === 'ongoing')
                  .map((classItem, idx) => (
                    <div
                      key={idx}
                      className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        alert(`Subject: ${classItem.subject}\nTeacher: ${classItem.teacherName}\nDay: ${classItem.schedule.day}\nTime: ${classItem.schedule.start} - ${classItem.schedule.end}\nLocation: ${classItem.location}\nStatus: Ongoing`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg text-green-900">{classItem.subject}</h5>
                          <p className="text-green-700 flex items-center gap-2 mt-1">
                            <User size={16} />
                            {classItem.teacherName}
                            <Clock size={16} className="ml-2" />
                            {classItem.schedule.start} - {classItem.schedule.end}
                          </p>
                          <p className="text-green-700 flex items-center gap-2 mt-1">
                            <MapPin size={16} />
                            {classItem.location}
                          </p>
                        </div>
                        <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm">
                          Ongoing
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {todayClasses.filter((c) => c.status === 'upcoming').length > 0 && (
              <div>
                <h4 className="mb-3 text-gray-700">Upcoming Today</h4>
                {todayClasses
                  .filter((c) => c.status === 'upcoming')
                  .map((classItem, idx) => (
                    <div
                      key={idx}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        alert(`Subject: ${classItem.subject}\nTeacher: ${classItem.teacherName}\nDay: ${classItem.schedule.day}\nTime: ${classItem.schedule.start} - ${classItem.schedule.end}\nLocation: ${classItem.location}\nStatus: Upcoming`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg text-yellow-900">{classItem.subject}</h5>
                          <p className="text-yellow-700 flex items-center gap-2 mt-1">
                            <User size={16} />
                            {classItem.teacherName}
                            <Clock size={16} className="ml-2" />
                            {classItem.schedule.start} - {classItem.schedule.end}
                          </p>
                          <p className="text-yellow-700 flex items-center gap-2 mt-1">
                            <MapPin size={16} />
                            {classItem.location}
                          </p>
                        </div>
                        <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm">
                          Upcoming
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'subjects':
        return <MySubjects />;
      case 'make-request':
        return <MakeRequest />;
      case 'my-requests':
        return <MyRequests />;
      case 'my-sessions':
        return <MySessions />;
      case 'enroll':
        return <EnrollSubject />;
      case 'library':
        return <Library />;
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
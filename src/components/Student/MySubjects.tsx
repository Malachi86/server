import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, User, Calendar, Clock } from 'lucide-react';

// Define interfaces for type safety
interface ISchedule {
  day: string;
  start: string;
  end: string;
}

interface ITeacherSubject {
  name: string;
  schedules: ISchedule[];
}

interface ITeacher {
  subjects: ITeacherSubject[];
}

interface IEnrollment {
  student: string;
  teacher: string;
  subject: string;
  status: 'Approved' | 'Pending' | 'Declined';
}

interface IAttendanceSession {
  teacher: string;
  subject: string;
  start_iso: string;
}

interface ISubjectData extends IEnrollment {
  teacherName: string;
  schedules: ISchedule[];
  sessionsCount: number;
  lastSession: string | null;
}

export default function MySubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ISubjectData[]>([]);

  useEffect(() => {
    loadSubjects();
  }, [user]); // Add user as a dependency

  const loadSubjects = () => {
    if (!user) return; // Ensure user is not null

    const enrollments: IEnrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const teachers: { [key: string]: ITeacher } = JSON.parse(localStorage.getItem('teachers') || '{}');
    const users: { [key: string]: { name: string } } = JSON.parse(localStorage.getItem('users') || '{}');
    const attendance: { [key: string]: IAttendanceSession[] } = JSON.parse(localStorage.getItem('attendance') || '{}');

    const approved = enrollments.filter(
      (e) => e.student === user.usn && e.status === 'Approved'
    );

    const subjectData: ISubjectData[] = approved.map((enrollment) => {
      const teacherData = teachers[enrollment.teacher];
      const subject = teacherData?.subjects.find((s) => s.name === enrollment.subject);
      
      const studentAttendance = attendance[user.usn] || [];
      const sessions = studentAttendance.filter(
        (a) => a.teacher === enrollment.teacher && a.subject === enrollment.subject
      );

      const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

      return {
        ...enrollment,
        teacherName: users[enrollment.teacher]?.name || enrollment.teacher,
        schedules: subject?.schedules || [],
        sessionsCount: sessions.length,
        lastSession: lastSession?.start_iso || null
      };
    });

    setSubjects(subjectData);
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">My Subjects</h2>
      <p className="text-gray-600 mb-8">View all your approved subject enrollments</p>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Book size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Wala kang approved enrollments.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {subjects.map((subject, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                const schedText = subject.schedules
                  .map((s) => `${s.day} ${s.start}-${s.end}`)
                  .join(', ');
                alert(
                  `Subject: ${subject.subject}\nTeacher: ${subject.teacherName}\nSchedules: ${schedText || 'None'}\nTotal Sessions: ${subject.sessionsCount}\nLast Session: ${subject.lastSession ? new Date(subject.lastSession).toLocaleString() : 'Never'}`
                );
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl mb-2 text-[#b40000] flex items-center gap-2">
                    <Book size={24} />
                    {subject.subject}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2 mb-2">
                    <User size={18} />
                    {subject.teacherName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm mb-2">
                    {subject.sessionsCount} Sessions
                  </div>
                  {subject.lastSession && (
                    <p className="text-xs text-gray-500">
                      Last: {new Date(subject.lastSession).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {subject.schedules.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Schedules
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subject.schedules.map((schedule, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Clock size={14} />
                        {schedule.day} {schedule.start}-{schedule.end}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function AttendanceReports() {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  
  const allSessions: any[] = [];
  Object.entries(attendance).forEach(([studentUsn, sessions]: any) => {
    sessions.forEach((session: any) => {
      allSessions.push({
        ...session,
        student: studentUsn,
        studentName: users[studentUsn]?.name || studentUsn
      });
    });
  });

  allSessions.sort((a, b) => new Date(b.start_iso).getTime() - new Date(a.start_iso).getTime());

  return (
    <div>
      <h2 className="text-3xl mb-2">Attendance Reports</h2>
      <p className="text-gray-600 mb-8">View all student lab sessions</p>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left">Student</th>
              <th className="px-4 py-4 text-left">Subject</th>
              <th className="px-4 py-4 text-left">Teacher</th>
              <th className="px-4 py-4 text-left">Lab/Room</th>
              <th className="px-4 py-4 text-left">PC</th>
              <th className="px-4 py-4 text-left">Start</th>
              <th className="px-4 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {allSessions.map((session, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4">{session.studentName}</td>
                <td className="px-4 py-4">{session.subject}</td>
                <td className="px-4 py-4">{session.teacher}</td>
                <td className="px-4 py-4">{session.lab || session.room || '-'}</td>
                <td className="px-4 py-4">{session.pc || '-'}</td>
                <td className="px-4 py-4 text-sm">
                  {new Date(session.start_iso).toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    session.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.active ? 'Active' : 'Ended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

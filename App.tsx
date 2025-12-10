import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import StudentDashboard from './components/Student/StudentDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import LibraryDashboard from './components/Library/LibraryDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={
        user.role === 'student' ? <StudentDashboard /> :
        user.role === 'teacher' ? <TeacherDashboard /> :
        user.role === 'admin' ? <AdminDashboard /> :
        user.role === 'library_admin' ? <LibraryDashboard /> :
        <Navigate to="/" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

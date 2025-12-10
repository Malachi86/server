import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  usn: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'library_admin';
}

interface AuthContextType {
  user: User | null;
  login: (usn: string, password: string) => boolean;
  logout: () => void;
  register: (data: any) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize default data
    initializeData();
  }, []);

  const initializeData = () => {
    if (!localStorage.getItem('users')) {
      const defaultUsers = {
        admin: {
          name: 'Administrator',
          email: 'admin@amacc_lipa.com',
          password: 'admin123',
          role: 'admin'
        },
        library: {
          name: 'Library Manager',
          email: 'library@amacc_lipa.com',
          password: 'library123',
          role: 'library_admin'
        }
      };
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('teachers')) {
      const defaultTeachers = {
        admin: {
          subjects: [
            { name: 'Exam', schedules: [] },
            { name: 'Personal Use', schedules: [] }
          ]
        }
      };
      localStorage.setItem('teachers', JSON.stringify(defaultTeachers));
    }

    if (!localStorage.getItem('labs')) {
      const defaultLabs = [
        { id: '1', name: 'Super Lab', capacity: 40, pcs: Array.from({ length: 40 }, (_, i) => ({ number: i + 1, status: 'available', currentUser: null })) },
        { id: '2', name: 'Computer Lab', capacity: 40, pcs: Array.from({ length: 40 }, (_, i) => ({ number: i + 1, status: 'available', currentUser: null })) },
        { id: '3', name: 'Internet Lab', capacity: 20, pcs: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: 'available', currentUser: null })) }
      ];
      localStorage.setItem('labs', JSON.stringify(defaultLabs));
    }

    if (!localStorage.getItem('rooms')) {
      const defaultRooms = [
        { id: '1', name: 'Room 101', capacity: 30 },
        { id: '2', name: 'Room 102', capacity: 35 },
        { id: '3', name: 'Room 201', capacity: 40 }
      ];
      localStorage.setItem('rooms', JSON.stringify(defaultRooms));
    }

    if (!localStorage.getItem('requests')) {
      localStorage.setItem('requests', JSON.stringify([]));
    }

    if (!localStorage.getItem('enrollments')) {
      localStorage.setItem('enrollments', JSON.stringify([]));
    }

    if (!localStorage.getItem('attendance')) {
      localStorage.setItem('attendance', JSON.stringify({}));
    }

    if (!localStorage.getItem('library_books')) {
      localStorage.setItem('library_books', JSON.stringify([]));
    }

    if (!localStorage.getItem('borrow_requests')) {
      localStorage.setItem('borrow_requests', JSON.stringify([]));
    }

    if (!localStorage.getItem('borrow_records')) {
      localStorage.setItem('borrow_records', JSON.stringify([]));
    }

    if (!localStorage.getItem('audit_log')) {
      localStorage.setItem('audit_log', JSON.stringify([]));
    }

    if (!localStorage.getItem('pc_history')) {
      localStorage.setItem('pc_history', JSON.stringify({}));
    }

    if (!localStorage.getItem('active_sessions')) {
      localStorage.setItem('active_sessions', JSON.stringify([]));
    }

    if (!localStorage.getItem('reservations')) {
      localStorage.setItem('reservations', JSON.stringify([]));
    }
  };

  const login = (usn: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[usn];

    if (userData && userData.password === password) {
      const loggedInUser = {
        usn,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      
      // Add audit log
      addAuditLog('Sign In', usn, { role: userData.role });
      
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      addAuditLog('Sign Out', user.usn, { role: user.role });
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = (data: any): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[data.usn]) {
      return false; // User already exists
    }

    users[data.usn] = {
      name: data.name,
      email: `${data.usn}_${data.name.replace(/\s/g, '')}@amacc_lipa.com`,
      password: data.password,
      role: data.role
    };

    localStorage.setItem('users', JSON.stringify(users));

    if (data.role === 'teacher') {
      const teachers = JSON.parse(localStorage.getItem('teachers') || '{}');
      teachers[data.usn] = { subjects: [] };
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }

    addAuditLog('Sign Up', data.usn, { name: data.name, role: data.role });
    
    return true;
  };

  const addAuditLog = (action: string, actor: string, details: any) => {
    const logs = JSON.parse(localStorage.getItem('audit_log') || '[]');
    logs.push({
      ts: new Date().toISOString(),
      action,
      actor,
      details
    });
    localStorage.setItem('audit_log', JSON.stringify(logs));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
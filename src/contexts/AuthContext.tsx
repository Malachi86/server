import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

interface User {
  usn: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'library_admin';
}

interface AuthContextType {
  user: User | null;
  login: (usn: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from a previous session
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false); // Finished loading user from storage
  }, []);

  const login = async (usn: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Login Failed: ${errorData.error}`);
        return false;
      }

      const loggedInUser: User = await response.json();
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;

    } catch (error) {
      console.error("Login error:", error);
      alert('An error occurred during login. Please try again.');
      return false;
    }
  };

  const logout = () => {
    // We can add a server-side logout call here if needed in the future
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Registration Failed: ${errorData.error}`);
        return false;
      }

      alert('Registration successful! You can now log in.');
      return true;

    } catch (error) {
      console.error("Registration error:", error);
      alert('An error occurred during registration. Please try again.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

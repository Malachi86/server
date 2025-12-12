import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, RefreshCw } from 'lucide-react';

const API_URL = '/api'; // Using relative path to the backend

interface User {
  id: string;
  usn_emp: string;
  name: string;
  email?: string; // Make email optional as it might not be in all user objects
  role: 'student' | 'teacher' | 'admin' | 'library_admin';
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const usersData: User[] = await response.json();
      // Map usn_emp to usn for consistency if needed, but the backend model is what we should follow
      setUsers(usersData.map(u => ({ ...u, usn: u.usn_emp })));
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.usn_emp.toLowerCase().includes(search.toLowerCase())
  );

  // showUserDetails can be simplified or enhanced later if needed
  const showUserDetails = (user: User) => {
    let details = `Name: ${user.name}\nUSN: ${user.usn_emp}\nRole: ${user.role}`;
    if(user.email) {
        details += `\nEmail: ${user.email}`;
    }
    alert(details);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl">Manage Users</h2>
        <button 
          onClick={loadUsers}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        >
          <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <p className="text-gray-600 mb-8">View and manage all system users</p>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or USN..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">Error: {error}</p>}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">USN / Emp. ID</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => showUserDetails(user)}
              >
                <td className="px-6 py-4 font-mono">{user.usn_emp}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${{
                    admin: 'bg-red-100 text-red-800',
                    teacher: 'bg-blue-100 text-blue-800',
                    library_admin: 'bg-purple-100 text-purple-800',
                    student: 'bg-green-100 text-green-800'
                  }[user.role]}`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
                <Users size={40} className="mx-auto mb-2" />
                <p>No users found.</p>
            </div>
        )}
      </div>
    </div>
  );
}

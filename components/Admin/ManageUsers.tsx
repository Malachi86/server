import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '{}');
    const usersList = Object.entries(usersData).map(([usn, data]: any) => ({
      usn,
      ...data
    }));
    setUsers(usersList);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.usn.toLowerCase().includes(search.toLowerCase())
  );

  const showUserDetails = (userUsn: string) => {
    const user = users.find(u => u.usn === userUsn);
    if (!user) return;

    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    const userSessions = attendance[userUsn] || [];

    let details = `Name: ${user.name}\nUSN: ${user.usn}\nEmail: ${user.email}\nRole: ${user.role}\n\n`;
    
    if (user.role === 'student') {
      details += `Total Sessions: ${userSessions.length}\n`;
      if (userSessions.length > 0) {
        details += `\nRecent Sessions:\n`;
        userSessions.slice(-5).reverse().forEach((s: any, i: number) => {
          details += `${i + 1}. ${s.subject} - ${s.lab || s.room} (${new Date(s.start_iso).toLocaleDateString()})\n`;
        });
      }
    }

    alert(details);
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">Manage Users</h2>
      <p className="text-gray-600 mb-8">View and manage all system users</p>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">USN</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => showUserDetails(user.usn)}
              >
                <td className="px-6 py-4">{user.usn}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'library_admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
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

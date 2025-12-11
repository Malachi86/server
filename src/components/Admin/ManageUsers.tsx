import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      alert('Could not load user data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.usn.toLowerCase().includes(search.toLowerCase())
  );
  
  if (isLoading) {
    return <div>Loading user data...</div>
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Manage Users</h2>
      <p className="text-gray-600 mb-8">View and manage all system users from the central database.</p>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or USN..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">USN</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{user.usn}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'library_admin' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

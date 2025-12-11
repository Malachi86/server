import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function ManageBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    copies: 1
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
      alert('Could not load book data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.author) {
      alert('Please fill title and author');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add book');
      
      setFormData({ title: '', author: '', copies: 1 });
      setShowAddForm(false);
      loadBooks(); // Refresh the list
    } catch (error) {
      console.error("Error adding book:", error);
      alert('Failed to add new book.');
    }
  };

  if (isLoading) {
      return <div>Loading books...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2">Manage Books</h2>
          <p className="text-gray-600">Add and manage library books</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddForm ? 'Cancel' : 'Add Book'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl mb-4">Add New Book</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Copies</label>
              <input
                type="number"
                value={formData.copies}
                onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Book
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Author</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Copies</th>
                 {/* Delete button column temporarily removed */}
              </tr>
            </thead>
            <tbody>
              {books.map((book, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{book.title}</td>
                  <td className="px-6 py-4">{book.author}</td>
                  <td className="px-6 py-4">{book.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

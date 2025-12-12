import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';

export default function ManageBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    barcode: '',
    title: '',
    author: ''
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const booksData = JSON.parse(localStorage.getItem('library_books') || '[]');
    setBooks(booksData);
  };

  const handleAdd = () => {
    if (!formData.barcode || !formData.title) {
      alert('Please fill barcode and title');
      return;
    }

    const newBook = {
      barcode: formData.barcode,
      title: formData.title,
      author: formData.author,
      status: 'Available',
      borrowed_by: null,
      borrowed_at: null,
      due_date: null
    };

    const updated = [...books, newBook];
    localStorage.setItem('library_books', JSON.stringify(updated));
    
    setFormData({ barcode: '', title: '', author: '' });
    setShowAddForm(false);
    loadBooks();
  };

  const handleDelete = (barcode: string) => {
    if (!window.confirm('Delete this book?')) return;

    const updated = books.filter(b => b.barcode !== barcode);
    localStorage.setItem('library_books', JSON.stringify(updated));
    loadBooks();
  };

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
          Add Book
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl mb-4">Add New Book</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
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
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Barcode</th>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Author</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Borrowed By</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{book.barcode}</td>
                <td className="px-6 py-4">{book.title}</td>
                <td className="px-6 py-4">{book.author || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {book.status}
                  </span>
                </td>
                <td className="px-6 py-4">{book.borrowed_by || '-'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(book.barcode)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

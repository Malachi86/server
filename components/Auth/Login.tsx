import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    usn: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'student',
    teacherCode: ''
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(formData.usn, formData.password);
      if (!success) {
        setError('Invalid credentials');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.role === 'teacher' && formData.teacherCode !== 'AMACC2025') {
        setError('Invalid teacher code');
        return;
      }

      const success = register(formData);
      if (!success) {
        setError('USN already exists');
      } else {
        setIsLogin(true);
        setFormData({ ...formData, usn: '', password: '', confirmPassword: '' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header */}
      <div className="bg-[#b40000] text-white py-8 px-6 shadow-lg">
        <h1 className="text-4xl mb-2">AMA</h1>
        <p className="text-xl">Student Portal</p>
        <p className="text-sm mt-2 opacity-90">Vision • Mission • Quality Policy</p>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="bg-gradient-to-br from-[#b40000] to-[#8b0000] p-12 text-white flex flex-col justify-center">
              <h2 className="text-3xl mb-4">Welcome to</h2>
              <h3 className="text-5xl mb-6">Student Portal</h3>
              <p className="text-lg opacity-90">
                A wise man will hear, and will increase learning; and a man of understanding shall attain unto wise counsels.
              </p>
            </div>

            {/* Right Side - Form */}
            <div className="p-12">
              <div className="mb-8">
                <h3 className="text-2xl mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-gray-600">
                  {isLogin ? 'Please sign in to continue' : 'Join the AMA Lab system'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    {isLogin ? 'USN/EMP' : 'USN/EMP (Email)'}
                  </label>
                  <input
                    type="text"
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                    required
                  />
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>

                    {formData.role === 'teacher' && (
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Teacher Code</label>
                        <input
                          type="password"
                          value={formData.teacherCode}
                          onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                          placeholder="Required for teacher registration"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#b40000] hover:bg-[#8b0000] text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLogin ? (
                    <>
                      <LogIn size={20} />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Sign Up
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-[#b40000] hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

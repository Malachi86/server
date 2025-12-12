import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import amaLogo from '../../public/ama-logo.png';

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
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const success = await login(formData.usn, formData.password);
      if (!success) {
        setError('Invalid credentials or server error');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.role === 'teacher' && formData.teacherCode !== 'AMACC2025') {
        setError('Invalid teacher code');
        setLoading(false);
        return;
      }

      const success = await register(formData);
      if (!success) {
        setError('USN already exists or server error');
      } else {
        setIsLogin(true);
        setFormData({ ...formData, usn: '', password: '', confirmPassword: '' });
        // Optionally, you can automatically log the user in after registration
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">

      {/* UPDATED HEADER */}
      <header className="bg-gradient-to-r from-[#9b0000] to-[#7a0000] text-white py-5 px-8 shadow-xl flex items-center gap-5">
        <img 
          src={amaLogo}
          alt="AMA Logo"
          className="h-14 w-auto object-contain drop-shadow-lg"
        />

        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-wide">AMA Student Portal</h1>
          <p className="text-sm opacity-80">Vision • Mission • Quality Policy</p>
        </div>
      </header>

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
                      disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                        disabled={loading}
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
                          disabled={loading}
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#b40000] hover:bg-[#8b0000] text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isLogin ? <><LogIn size={20} />Sign In</> : <><UserPlus size={20} />Sign Up</>)}
                </button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-[#b40000] hover:underline disabled:opacity-50"
                    disabled={loading}
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

'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, displayName, role });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-lavender-light to-blue-light">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-lavender-mid/30"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lavender rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lavender/30">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-dark">AssignFlow</h1>
          <p className="text-text-mid mt-2">{isLogin ? 'Welcome back, Scholar!' : 'Start your academic journey'}</p>
        </div>

        {error && (
          <div className="bg-salmon-light border border-salmon-mid text-salmon px-4 py-3 rounded-xl mb-6 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-text-mid uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" required
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <UserPlus className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-mid uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" required
                className="input-field pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-mid uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" required
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-3.5 text-lavender w-5 h-5" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-text-mid uppercase tracking-wider mb-1">Role</label>
              <select 
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-lavender/30 flex items-center justify-center gap-2">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-lavender font-bold hover:underline"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

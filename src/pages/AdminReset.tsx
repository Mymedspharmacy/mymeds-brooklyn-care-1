import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../lib/api';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/admin-reset', { token, password });
      setSuccess('Password reset successful! You can now sign in.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f7f6] via-[#f5fefd] to-[#d2f1ef] p-4">
      <form
        className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center border border-[#e0f2f1]"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          onClick={() => navigate('/admin-signin')}
          className="absolute top-4 left-4 text-[#57bbb6] hover:text-[#2e8f88] transition-colors flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>
        <img src={logo} alt="Pharmacy Logo" className="w-16 h-16 mb-4 rounded-full shadow-lg animate-pulse" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#376f6b] mb-2 tracking-tight">Reset Admin Password</h2>
        <p className="text-[#2e8f88] text-sm mb-6 text-center">Enter your new password below.</p>
        {error && <div className="mb-4 text-[#e53935] bg-[#fff0f0] px-3 py-2 rounded-lg w-full text-center border border-[#ffcdd2] animate-shake">{error}</div>}
        {success && <div className="mb-4 text-green-600 bg-[#e6f7f6] px-3 py-2 rounded-lg w-full text-center border border-[#b2dfdb]">{success}</div>}
        <div className="w-full mb-6 relative">
          <label className="block text-[#31968a] font-semibold mb-1" htmlFor="admin-reset-password">New Password</label>
          <input
            id="admin-reset-password"
            className="w-full border border-[#57bbb6] focus:border-[#2e8f88] focus:ring-2 focus:ring-[#57bbb6] p-2 pr-10 rounded-lg outline-none transition bg-[#f5fefd] placeholder-[#57bbb6]"
            placeholder="New password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-2 top-8 text-[#57bbb6] hover:text-[#2e8f88] focus:outline-none"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 bg-[#376f6b] hover:bg-[#2e8f88] text-white py-2 rounded-lg font-bold text-lg shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading || !!success}
        >
          {loading && <Loader2 className="animate-spin" size={20} />} Reset Password
        </button>
      </form>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../lib/api';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function AdminReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // If no token in URL, mark as invalid
    if (!token) setTokenValid(false);
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/admin-reset', { token, password });
      setSuccess('Password reset successful! You can now sign in.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f7f6] via-[#f5fefd] to-[#d2f1ef] p-4">
      <div className="w-full max-w-md">
        <form
          className="relative bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-[#e0f2f1] animate-fade-in"
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
          <img src={logo} alt="Pharmacy Logo" className="w-20 h-20 mb-4 rounded-full shadow-lg animate-pulse" />
          <h2 className="text-3xl font-extrabold text-[#376f6b] mb-2 tracking-tight text-center">Reset Admin Password</h2>
          <p className="text-[#2e8f88] text-base mb-6 text-center">{tokenValid ? 'Enter your new password below.' : 'Invalid or missing reset link. Please request a new password reset.'}</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-[#e53935] bg-[#fff0f0] px-3 py-2 rounded-lg w-full text-center border border-[#ffcdd2] animate-shake">
              <XCircle size={20} /> {error}
            </div>
          )}
          {/* Success Message */}
          {success && (
            <div className="mb-4 flex items-center gap-2 text-green-600 bg-[#e6f7f6] px-3 py-2 rounded-lg w-full text-center border border-[#b2dfdb]">
              <CheckCircle size={20} /> {success}
            </div>
          )}

          {/* Password Form */}
          {tokenValid && !success && (
            <div className="w-full mb-6 relative">
              <label className="block text-[#31968a] font-semibold mb-1" htmlFor="admin-reset-password">New Password</label>
              <input
                id="admin-reset-password"
                className="w-full border border-[#57bbb6] focus:border-[#2e8f88] focus:ring-2 focus:ring-[#57bbb6] p-3 pr-12 rounded-xl outline-none transition bg-[#f5fefd] placeholder-[#57bbb6] text-lg"
                placeholder="New password (min 8 characters)"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-[#57bbb6] hover:text-[#2e8f88] focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          )}

          {/* Submit Button */}
          {tokenValid && !success && (
            <button
              className="w-full flex items-center justify-center gap-2 bg-[#376f6b] hover:bg-[#2e8f88] text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" size={22} />} Reset Password
            </button>
          )}

          {/* If token is invalid, show a link to request again */}
          {!tokenValid && !success && (
            <button
              type="button"
              className="mt-4 text-[#376f6b] hover:text-[#2e8f88] underline text-base"
              onClick={() => navigate('/admin-signin')}
            >
              Request a new password reset
            </button>
          )}
        </form>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease;
          }
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
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import railwayAuth from '../lib/railwayAuth';

import { Eye, EyeOff, Loader2, ArrowLeft, Lock, Mail, X } from 'lucide-react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AdminSignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is already authenticated
    if (railwayAuth.isAuthenticated()) {
      navigate('/admin');
    }
    
    const emailInput = document.getElementById('admin-email');
    if (emailInput) emailInput.focus();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Railway Auth sign in
      const { token, user } = await railwayAuth.login({
        email: username,
        password
      });
      
      console.log('Railway login successful!', { user });
      
      if (rememberMe) {
        localStorage.setItem('admin-remember', 'true');
      }
      
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  }

  async function handleResetRequest(e) {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    setResetError('');
    try {
      // Use Railway backend password reset
      await railwayAuth.requestPasswordReset({ email: resetEmail });
      setResetMessage('If this email is registered as admin, you will receive a reset link.');
    } catch (error) {
      setResetError(error.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
      
      <div className="pt-20 flex items-center justify-center p-4">
        <div className={`transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <form
          className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center border border-[#e0f2f1]"
          onSubmit={handleSubmit}
        >
          {/* Back to Home Link */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-[#57bbb6] hover:text-[#2e8f88] transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img src="/logo.png" alt="My Meds Pharmacy Logo" className="w-20 sm:w-24 md:w-28 h-auto mb-4 shadow-lg"/>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#57bbb6] rounded-full flex items-center justify-center">
                <Lock size={12} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#376f6b] mb-2 tracking-tight">Admin Portal</h2>
            <p className="text-[#2e8f88] text-sm text-center">Sign in to manage the pharmacy</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-[#e53935] bg-[#fff0f0] px-3 py-2 rounded-lg w-full text-center border border-[#ffcdd2] animate-shake">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="w-full mb-4">
            <label className="block text-[#31968a] font-semibold mb-1 text-sm" htmlFor="admin-email">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#57bbb6]" />
              <input
                id="admin-email"
                className="w-full border border-[#57bbb6] focus:border-[#2e8f88] focus:ring-2 focus:ring-[#57bbb6] p-2 pl-10 rounded-lg outline-none transition bg-[#f5fefd] placeholder-[#57bbb6] text-sm"
                placeholder="Enter your email"
                type="email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <label className="block text-[#31968a] font-semibold mb-1 text-sm" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#57bbb6]" />
              <input
                id="admin-password"
                className="w-full border border-[#57bbb6] focus:border-[#2e8f88] focus:ring-2 focus:ring-[#57bbb6] p-2 pl-10 pr-10 rounded-lg outline-none transition bg-[#f5fefd] placeholder-[#57bbb6] text-sm"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#57bbb6] hover:text-[#2e8f88] focus:outline-none transition-colors"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="w-full mb-6 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#31968a] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#376f6b] border-[#57bbb6] rounded focus:ring-[#57bbb6]"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-sm text-[#57bbb6] hover:text-[#2e8f88] transition-colors underline"
              onClick={() => setShowResetModal(true)}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            className="w-full flex items-center justify-center gap-2 bg-[#376f6b] hover:bg-[#2e8f88] text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#57bbb6]">
              Secure admin access • Protected by encryption
            </p>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs relative animate-fade-in">
              <button
                className="absolute top-2 right-2 text-[#57bbb6] hover:text-[#2e8f88]"
                onClick={() => {
                  setShowResetModal(false);
                  setResetEmail('');
                  setResetMessage('');
                  setResetError('');
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-[#376f6b] mb-2 text-center">Reset Admin Password</h3>
              <p className="text-[#2e8f88] text-sm mb-4 text-center">Enter your admin email to receive a reset link.</p>
              <form onSubmit={handleResetRequest} className="flex flex-col gap-3">
                <input
                  className="w-full border border-[#57bbb6] focus:border-[#2e8f88] focus:ring-2 focus:ring-[#57bbb6] p-2 rounded-lg outline-none transition bg-[#f5fefd] placeholder-[#57bbb6] text-sm"
                  type="email"
                  placeholder="Admin email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  className="w-full bg-[#376f6b] hover:bg-[#2e8f88] text-white py-2 rounded-lg font-bold text-base shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? <Loader2 className="animate-spin inline" size={18} /> : 'Send Reset Link'}
                </button>
              </form>
              {resetMessage && <div className="mt-3 text-green-600 text-sm text-center">{resetMessage}</div>}
              {resetError && <div className="mt-3 text-red-500 text-sm text-center animate-shake">{resetError}</div>}
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease;
              }
            `}</style>
          </div>
        )}
      </div>
      {/* Add custom animation for shake effect */}
      <style>{`
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

      <Footer />
    </div>
  );
} 
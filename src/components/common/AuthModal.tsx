import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, Phone, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'alumni' | 'teacher' | 'institution_rep'>('student');
  const [city, setCity] = useState('Lucknow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please fill in both email and password');
        }
        await authService.loginWithEmail(email);
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill all required fields');
        }
        await authService.signup({ name, email, role, city });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }
    setLoading(true);
    try {
      await authService.loginWithPhone(phone);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Phone OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-950 flex items-center justify-center text-blue-400 mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            {tab === 'signin' ? 'Welcome Back to Scorevault' : 'Create Your Scorevault Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'signin' 
              ? 'Access your saved colleges, write verified reviews, and compare institutes.'
              : 'Join thousands of students and parents making informed education decisions.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setTab('signin'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signin' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Google One-Click */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
              Or with {authMethod === 'email' ? 'Email' : 'Mobile'}
            </span>
          </div>
        </div>

        {/* Method Switcher */}
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`font-semibold pb-1 border-b-2 transition-colors ${
              authMethod === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Email Address
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`font-semibold pb-1 border-b-2 transition-colors ${
              authMethod === 'phone' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Indian Mobile OTP
          </button>
        </div>

        {authMethod === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {tab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Srivastava"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">I am a</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="student">Student (School / College)</option>
                    <option value="parent">Parent</option>
                    <option value="alumni">Alumni / Graduate</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="institution_rep">Institution Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Lucknow">Lucknow</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : tab === 'signin' ? 'Sign In to Scorevault' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-medium text-slate-500 border-r border-slate-200 pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">We'll send a 6-digit verification code via SMS</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-[11px] text-slate-400">
          By continuing, you agree to Scorevault’s Community Guidelines and Review Verification Terms.
        </div>
      </div>
    </div>
  );
};

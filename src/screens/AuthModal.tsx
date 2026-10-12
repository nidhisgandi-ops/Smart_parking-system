import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, VehicleType } from '../types';
import { Mail, Phone, Lock, User, Plus, Check, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useApp();
  const [tab, setTab] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('••••••••');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
    setTab('otp');
    setTimer(30);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
    });
    onClose();
  };

  const handleQuickAutoFillOtp = () => {
    setOtpCode('8492');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {tab === 'otp' ? 'Phone OTP Verification' : tab === 'login' ? 'Welcome to SmartPark' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-white/80 mt-1">
              {tab === 'otp'
                ? `6-digit security code sent to ${phone}`
                : 'Access live CCTV feeds, verified parking, & valet service'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-black/20 hover:bg-black/30">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        {tab !== 'otp' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
                tab === 'signup'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {tab !== 'otp' ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continue with Phone OTP</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Enter 4-digit OTP code received on SMS
                </span>

                <div className="flex justify-center gap-2 py-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="8492"
                    className="w-36 py-2.5 rounded-xl border-2 border-brand-500 text-center font-mono text-xl font-black tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleQuickAutoFillOtp}
                    className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[11px] font-bold border border-brand-300"
                  >
                    ⚡ Auto-Fill Mock OTP (8492)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all"
              >
                Verify & Enter SmartPark
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  ← Back to Email Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

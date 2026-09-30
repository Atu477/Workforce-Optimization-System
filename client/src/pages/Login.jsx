import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Award, Lock, User, Mail, Building, Briefcase, Clock, Phone, KeyRound, ArrowRight, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  
  // Sign In State
  const [loginId, setLoginId] = useState('admin@manpower.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign Up State
  const [signupStep, setSignupStep] = useState(1); // 1: Details, 2: OTP Verification
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    shift: 'Morning Shift (08:00 - 16:00)',
    role: 'Employee',
    contactNumber: ''
  });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerSendOtp, registerVerifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setDevOtp('');
    setSignupStep(1);
    setOtp('');
  };

  // 1. Direct Login (No OTP Verification)
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await login(loginId, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (id) => {
    setLoginId(id);
    setLoginPassword('password123');
  };

  // 2. Sign Up Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const data = await registerSendOtp(signupForm);
      setSuccessMsg(data.message);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setSignupStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Sign Up Step 2: Verify OTP & Complete First-Time Registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await registerVerifyOtp(signupForm.email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const data = await registerSendOtp(signupForm);
      setSuccessMsg(`Resent OTP to ${signupForm.email}`);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manpower & Skill System</h1>
          <p className="text-xs text-slate-400 mt-1">Workforce Management & Attendance Portal</p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleModeSwitch('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In (No OTP)
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up (Email OTP)
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl mb-4 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* DEV HINT NOTICE IF OTP AVAILABLE */}
        {devOtp && mode === 'signup' && signupStep === 2 && (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs p-3 rounded-xl mb-4 flex items-center justify-between">
            <span>Demo OTP Verification Code:</span>
            <span className="font-mono font-bold text-sm tracking-widest bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
              {devOtp}
            </span>
          </div>
        )}

        {/* MODE 1: SIGN IN (DIRECT LOGIN WITHOUT OTP) */}
        {mode === 'signin' && (
          <div>
            {/* Quick Demo Credentials Switcher */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 mb-6">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 mb-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Select Demo Account to Direct Login:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('admin@manpower.com')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                    loginId === 'admin@manpower.com'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-900 text-purple-300 border-purple-500/20 hover:bg-slate-800'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('manager@manpower.com')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                    loginId === 'manager@manpower.com'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-blue-300 border-blue-500/20 hover:bg-slate-800'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('employee@manpower.com')}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                    loginId === 'employee@manpower.com'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-emerald-300 border-emerald-500/20 hover:bg-slate-800'
                  }`}
                >
                  Employee
                </button>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. admin@manpower.com or EMP-1001"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50 mt-6"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: SIGN UP (FIRST-TIME REGISTRATION WITH EMAIL OTP) */}
        {mode === 'signup' && (
          <div>
            {signupStep === 1 ? (
              /* STEP 1: REGISTRATION DETAILS FORM */
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address * (First-Time Registration)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="john.doe@company.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={signupForm.department}
                      onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupForm.designation}
                      onChange={(e) => setSignupForm({ ...signupForm, designation: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Shift *
                    </label>
                    <select
                      value={signupForm.shift}
                      onChange={(e) => setSignupForm({ ...signupForm, shift: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="Morning Shift (08:00 - 16:00)">Morning (08-16)</option>
                      <option value="Evening Shift (16:00 - 00:00)">Evening (16-00)</option>
                      <option value="Night Shift (00:00 - 08:00)">Night (00-08)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={signupForm.contactNumber}
                      onChange={(e) => setSignupForm({ ...signupForm, contactNumber: e.target.value })}
                      placeholder="+1 555 0192"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50 mt-4"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Generating OTP...' : 'Send OTP to Email'}</span>
                </button>
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION CODE FORM */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <KeyRound className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-sm font-bold text-white">Email Verification Required</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the 6-digit OTP code sent to{' '}
                    <span className="text-cyan-400 font-medium">{signupForm.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl py-3 text-center text-2xl font-mono tracking-widest text-cyan-400 placeholder-slate-700 focus:outline-none focus:border-cyan-400 transition shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition transform active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Complete Sign Up'}</span>
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ← Edit Details / Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          Workforce System • <span className="text-slate-400 font-medium">First-time Email OTP Verified</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

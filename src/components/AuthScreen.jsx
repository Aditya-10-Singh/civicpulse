import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock,
  RefreshCw,
  Check,
  ChevronDown,
  Globe,
  Quote,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiSendEmailOtp, apiVerifyEmailOtp, apiSignIn, apiSignUp } from '../lib/supabaseClient';

export default function AuthScreen({ onAuthSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' or 'password'
  
  // Form fields
  const [email, setEmail] = useState('adityasinghfeb102005@gmail.com');
  const [fullName, setFullName] = useState('Aditya Singh');
  const [password, setPassword] = useState('password123');
  const [country, setCountry] = useState('India');
  const [hostingRegion, setHostingRegion] = useState('AP (Mumbai)');

  // OTP specific states (Flipkart style)
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [rateLimitNotice, setRateLimitNotice] = useState('');

  // UI status
  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, otpTimer]);

  // Request real email OTP (Flipkart style)
  const handleRequestOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await apiSendEmailOtp(email, fullName);
      setActiveOtpCode(res.code);
      setOtpSent(true);
      setOtpTimer(45);
      setOtpDigits(['', '', '', '', '', '']);

      if (res.rateLimitWarning) {
        setRateLimitNotice(res.rateLimitWarning);
      }

      setSuccessMsg(
        res.rateLimitWarning 
          ? `Note: ${res.rateLimitWarning} Use the active code below or check spam.` 
          : `Verification code dispatched! Check your Inbox and Spam/Promotions folder.`
      );

      // Focus first digit box
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);

    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle single digit input with auto-advance
  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const split = pastedData.split('');
      setOtpDigits(split);
      inputRefs.current[5]?.focus();
    }
  };

  // Verify entered OTP
  const handleVerifyOtp = async () => {
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await apiVerifyEmailOtp(email, enteredCode, fullName);
      
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || "Invalid verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Citizen
  const handle1ClickLogin = () => {
    onAuthSuccess({
      id: 'usr-aditya-101',
      email: 'adityasinghfeb102005@gmail.com',
      user_metadata: {
        full_name: 'Aditya Singh',
        role: 'Verified Citizen (Ward 14)',
        country: 'India'
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif] bg-white">
      
      {/* =========================================================================
          LEFT SIDE: Clean Make.com White Card Form
          ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-r border-slate-100">
        
        {/* Top Header: Logo + 1-Click Demo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">CivicPulse</span>
              <span className="ml-2 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Ward 14 Portal
              </span>
            </div>
          </div>

          <button
            onClick={handle1ClickLogin}
            type="button"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all flex items-center space-x-1.5"
            title="Fast 1-click citizen login"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>1-Click Demo</span>
          </button>
        </div>

        {/* Center: Main Form Content */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          
          {/* FLIPKART-STYLE OTP VERIFICATION SCREEN */}
          {otpSent ? (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verify with OTP
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  We have sent a 6-digit verification code to
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-semibold text-slate-800 text-sm">{email}</span>
                  <button 
                    onClick={() => { setOtpSent(false); setError(''); }} 
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1 underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && !error && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 mb-5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Email Dispatched!</span> Check your inbox (or spam folder) for the 6-digit code.
                  </div>
                </div>
              )}

              {/* Instant Verification Code Display */}
              {activeOtpCode && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 mb-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800">Your Verification Code:</span>
                    <span className="font-mono text-base font-extrabold text-purple-700 tracking-widest">{activeOtpCode}</span>
                  </div>
                  <p className="text-[11px] text-purple-600">
                    Check your Gmail Spam/Updates tab, or enter the code above (or <strong>123456</strong>) to continue right now.
                  </p>
                </div>
              )}

              {/* 6 Digit Input Boxes (Flipkart Style) */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="mt-5 text-center text-xs text-slate-500">
                {otpTimer > 0 ? (
                  <p>Resend code in <span className="font-mono font-bold text-purple-700">{otpTimer}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Email input
                </button>
              </div>
            </div>
          ) : (
            /* MAKE.COM SIGNUP / LOGIN INITIAL SCREEN */
            <div>
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {mode === 'signup' ? 'Sign up' : 'Sign in'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  {mode === 'signup' 
                    ? 'Register to report civic hazards and track municipal field squads.' 
                    : 'Access your citizen reporting dashboard and track active tickets.'}
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'signup' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign Up (New Citizen)
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'login' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Alert message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={(e) => { e.preventDefault(); handleRequestOtp(); }} className="space-y-4">
                
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="aditya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Full Name (Sign Up only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Aditya Singh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Region & Country Selectors (Make.com Style) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jurisdiction *
                    </label>
                    <select
                      value={hostingRegion}
                      onChange={(e) => setHostingRegion(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                    >
                      <option value="AP (Mumbai)">Ward 14 (Central)</option>
                      <option value="AP (Delhi)">Ward 12 (North)</option>
                      <option value="AP (Bengaluru)">Ward 08 (Tech Zone)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>
                </div>

                {/* Make.com Style reCAPTCHA Checkbox */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={captchaChecked}
                      onChange={(e) => setCaptchaChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">I'm not a robot</span>
                  </label>
                  <div className="flex flex-col items-center text-[9px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>reCAPTCHA</span>
                  </div>
                </div>

                {/* Make.com Style Gradient Button */}
                <button
                  type="submit"
                  disabled={loading || !captchaChecked}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Email Verification...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Sign up with Email OTP' : 'Request Login OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Bottom Sign-in link */}
              <div className="mt-6 text-center text-xs text-slate-500">
                {mode === 'signup' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(''); }}
                      className="font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                    >
                      Sign up for free
                    </button>
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer: Guest mode */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>CivicPulse Secure Citizen Portal</span>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline cursor-pointer"
          >
            Continue as Guest →
          </button>
        </div>

      </div>

      {/* =========================================================================
          RIGHT SIDE: Make.com Deep Royal Purple Gradient + Quote & Testimonials
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-[#4c1d95] via-[#581c87] to-[#1e1b4b] p-12 lg:p-16 flex-col justify-between relative overflow-hidden text-white">
        
        {/* Soft background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand accent */}
        <div className="flex items-center justify-end z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-200/80 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PostgreSQL & Sheets Live Sync</span>
          </div>
        </div>

        {/* Center: Quote Testimonial matching Image 1 */}
        <div className="max-w-xl my-auto z-10">
          
          {/* Big Quote marks */}
          <div className="text-purple-300/40 text-7xl font-serif font-black leading-none mb-3">
            “
          </div>

          <blockquote className="text-2xl sm:text-3xl font-medium text-purple-50 leading-snug tracking-tight">
            Combining CivicPulse's live citizen reporting with instant Google Sheets field dispatch, municipal squads resolve community hazards 4x faster.
          </blockquote>

          {/* Testimonial Author */}
          <div className="mt-8 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full ring-2 ring-purple-300/40 overflow-hidden bg-purple-900 flex items-center justify-center font-bold text-lg text-white">
              AS
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight">Aditya Singh</p>
              <p className="text-xs text-purple-200/80 mt-0.5">Municipal Redressal Platform Architect & Full-Stack Developer</p>
            </div>
          </div>

        </div>

        {/* Bottom: Trusted by Municipal Agencies & Citizen Count (Make.com style) */}
        <div className="z-10 pt-8 border-t border-white/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300/70 mb-4">
            Trusted by 45,000+ residents & civic authorities
          </p>
          <div className="flex items-center space-x-6 sm:space-x-8 text-xs font-bold text-purple-200/80">
            <span className="hover:text-white transition-colors">PWD Roads</span>
            <span className="hover:text-white transition-colors">Jal Board</span>
            <span className="hover:text-white transition-colors">CleanCity Squad</span>
            <span className="hover:text-white transition-colors">PowerGrid</span>
            <span className="hover:text-white transition-colors">TransitCorp</span>
          </div>
        </div>

      </div>

    </div>
  );
}

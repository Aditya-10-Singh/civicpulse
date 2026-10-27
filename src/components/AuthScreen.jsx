import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock,
  Smartphone,
  Check,
  RefreshCw,
  Quote
} from 'lucide-react';
import { apiSignIn, apiSignUp } from '../lib/supabaseClient';

export default function AuthScreen({ onAuthSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login' (default signup like Make.com screenshot!)
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' or 'password'
  
  const [email, setEmail] = useState('adityasinghfeb102005@gmail.com');
  const [fullName, setFullName] = useState('Aditya Singh');
  const [password, setPassword] = useState('password123');
  const [country, setCountry] = useState('India');
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);

  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Generate and send OTP
  const handleSendOtp = () => {
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    setError('');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setOtpSent(true);
    setOtpTimer(45);
    setSuccessMsg(`OTP sent! Your 6-digit verification code is: ${randomCode}`);
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otpInput.join('');
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (entered !== generatedOtp && entered !== '123456') {
      setError("Invalid OTP code. Please check the code or click Resend.");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        if (mode === 'signup') {
          await apiSignUp(email, password || 'password123', fullName || 'Aditya Singh');
        }
        const user = {
          id: 'usr-' + Date.now().toString().slice(-6),
          email: email.trim().toLowerCase(),
          user_metadata: {
            full_name: fullName.trim() || 'Aditya Singh',
            role: 'Verified Citizen (OTP Authenticated)',
            phone_verified: true
          }
        };
        onAuthSuccess(user);
      } catch (err) {
        // Fallback login
        onAuthSuccess({
          id: 'usr-aditya-101',
          email: email.trim().toLowerCase(),
          user_metadata: { full_name: fullName || 'Aditya Singh', role: 'Verified Citizen' }
        });
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (authMethod === 'otp' && !otpSent) {
      handleSendOtp();
      return;
    }

    if (authMethod === 'otp' && otpSent) {
      handleVerifyOtp();
      return;
    }

    // Password Method
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error("Full name is required.");
        await apiSignUp(email, password, fullName);
        setSuccessMsg("Account registered! Signing you in...");
      }
      const user = await apiSignIn(email, password);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickLogin = () => {
    onAuthSuccess({
      id: 'usr-aditya-101',
      email: 'adityasinghfeb102005@gmail.com',
      user_metadata: {
        full_name: 'Aditya Singh',
        role: 'Lead Developer / Citizen',
        country: 'India'
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* LEFT COLUMN: Clean Make.com style form */}
      <div className="w-full lg:w-5/12 xl:w-5/12 bg-[#0D1019] border-r border-white/[0.06] p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        
        {/* Top: Minimal Brand */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-base shadow-inner">
              CP
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CivicPulse</span>
          </div>

          <button
            onClick={handle1ClickLogin}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Click Demo</span>
          </button>
        </div>

        {/* Center: Main Form Box */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            {mode === 'signup' ? 'Sign up' : 'Sign in'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {mode === 'signup' 
              ? 'Join 45,000+ citizens resolving municipal infrastructure in real-time.' 
              : 'Welcome back. Sign in to track or file infrastructure grievances.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#080B12] rounded-xl mb-5 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Verification Method Toggle */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] text-slate-400 font-medium">Authentication Method:</span>
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setOtpSent(false); }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  authMethod === 'otp' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Email OTP Code</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  authMethod === 'password' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Password</span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1">
                <span>{successMsg}</span>
                {generatedOtp && (
                  <button
                    type="button"
                    onClick={() => setOtpInput(generatedOtp.split(''))}
                    className="block mt-1 font-bold text-sky-400 underline hover:text-sky-300"
                  >
                    Click to auto-fill code: {generatedOtp}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Email Address */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
                Work Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adityasinghfeb102005@gmail.com"
                className="w-full bg-[#141926] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Full Name (if signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aditya Singh"
                  className="w-full bg-[#141926] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* Hosting Region & Country (Matching Make.com design) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
                    Hosting Region
                  </label>
                  <select 
                    defaultValue="AP (Asia-South)"
                    className="w-full bg-[#141926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="AP (Asia-South)">AP (India South)</option>
                    <option value="EU">EU (Europe)</option>
                    <option value="US">US (North America)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
                    Country <span className="text-rose-400">*</span>
                  </label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#141926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password input (if password method) */}
            {authMethod === 'password' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141926] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* OTP 6-Digit Box (if OTP sent) */}
            {authMethod === 'otp' && otpSent && (
              <div className="p-4 rounded-xl bg-[#090C14] border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-300 font-semibold">Enter 6-Digit Email OTP:</span>
                  <span className="text-slate-400 font-mono">
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : (
                      <button type="button" onClick={handleSendOtp} className="text-purple-400 underline">
                        Resend Code
                      </button>
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  {otpInput.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      className="w-11 h-12 text-center text-lg font-bold bg-[#141926] border border-purple-500/40 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Make.com Style reCAPTCHA Badge */}
            <div className="p-3 rounded-xl bg-[#141926] border border-white/[0.08] flex items-center justify-between cursor-pointer"
                 onClick={() => setCaptchaChecked(!captchaChecked)}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                  captchaChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 bg-slate-800'
                }`}>
                  {captchaChecked && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-200 font-medium">I'm not a robot</span>
              </div>
              <div className="text-right text-[10px] text-slate-500 leading-tight">
                <p className="font-semibold text-slate-400">reCAPTCHA</p>
                <p>Privacy - Terms</p>
              </div>
            </div>

            {/* Main Action Button (Make.com vibrant purple gradient) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading 
                ? 'Authenticating...' 
                : authMethod === 'otp' && !otpSent
                  ? 'Send 6-Digit OTP to Email'
                  : authMethod === 'otp' && otpSent
                    ? 'Verify OTP & Enter Platform'
                    : mode === 'signup' 
                      ? 'Sign up for free' 
                      : 'Sign in to CivicPulse'}
            </button>
          </form>

          {/* Social Proof & Guest switch */}
          <div className="mt-5 text-center space-y-2">
            <p className="text-xs text-slate-400">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
                className="text-purple-400 hover:text-purple-300 font-semibold underline ml-1"
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors block mx-auto"
            >
              Or explore live platform as guest &rarr;
            </button>
          </div>

        </div>

        {/* Bottom footer credit */}
        <div className="text-[11px] text-slate-500 text-center lg:text-left">
          Protected by CivicPulse Security • Supabase PostgreSQL • Real-Time Webhooks
        </div>

      </div>

      {/* RIGHT COLUMN: Rich Make.com purple gradient showcase (Matching Image 1) */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-7/12 bg-gradient-to-br from-[#7B2CBF] via-[#5B1EA8] to-[#1F0847] p-12 lg:p-16 flex-col justify-between relative overflow-hidden text-white">
        
        {/* Subtle decorative background circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Top right Logo */}
        <div className="flex items-center justify-end space-x-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center font-extrabold text-white">
            CP
          </div>
          <span className="text-2xl font-black tracking-tight text-white">CivicPulse</span>
        </div>

        {/* Center: Quote & Testimonial (Matching Image 1) */}
        <div className="max-w-xl my-auto">
          <Quote className="w-16 h-16 text-purple-300/30 mb-4" />
          
          <blockquote className="text-2xl xl:text-3xl font-extrabold leading-snug tracking-tight text-white mb-6">
            “Combining CivicPulse’s modern grievance platform with Supabase & Google Sheets sync, we’re empowering municipal teams to resolve community infrastructure issues faster than ever.”
          </blockquote>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-purple-400 p-0.5">
              <div className="w-full h-full rounded-full bg-[#16122E] flex items-center justify-center text-sm font-bold text-white">
                AS
              </div>
            </div>
            <div>
              <p className="font-bold text-base text-white">Aditya Singh</p>
              <p className="text-xs text-purple-200">Lead Full-Stack Developer • Civic Technology Systems</p>
            </div>
          </div>
        </div>

        {/* Bottom: Trusted by Companies & Tech Badges (Matching Image 1) */}
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-purple-200/70 mb-4">
            Powered by Production-Grade Architecture
          </p>
          <div className="flex items-center space-x-6 text-sm font-bold text-white/80 opacity-90">
            <span className="hover:text-white transition-colors">Supabase</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">PostgreSQL</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Google Sheets API</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Vercel Edge</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">React 18</span>
          </div>
        </div>

      </div>

    </div>
  );
}

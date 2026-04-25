import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';

// Floating particle component for the cyber background
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyber-neon/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Animated grid lines background
function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Scan line animation
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-neon/40 to-transparent pointer-events-none z-10"
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// Friendly Firebase error messages
function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-login-credentials': 'Invalid email or password.',
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Another popup is already open.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/missing-password': 'Please enter your password.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/requires-recent-login': 'Please log in again to continue.',
    'auth/credential-already-in-use': 'This credential is already linked to another account.',
  };
  if (!map[code]) {
    console.error('[Firebase Auth Error] Unhandled error code:', code);
  }
  return map[code] || `Authentication failed (${code}). Please try again.`;
}

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        /**
         * The user's email is already registered with a different provider.
         * Correct fix:
         *  1. Extract the pending credential from the error
         *  2. Fetch which provider already owns this email
         *  3. Sign in with that existing provider
         *  4. Link the pending credential so future logins with either provider work
         */
        try {
          const email = err.customData?.email;
          // Grab the OAuth credential that failed (e.g. GitHub token)
          const pendingCred =
            GithubAuthProvider.credentialFromError(err) ||
            GoogleAuthProvider.credentialFromError(err);

          // Determine which provider owns the email
          const methods = await fetchSignInMethodsForEmail(auth, email);
          const existingMethod = methods[0];
          const existingProviderName =
            existingMethod === 'google.com' ? 'Google' :
            existingMethod === 'github.com' ? 'GitHub' : existingMethod;

          setError(
            `This email is linked to ${existingProviderName}. ` +
            `Opening ${existingProviderName} sign-in to merge your accounts…`
          );

          // Sign in with the existing provider
          let existingProvider;
          if (existingMethod === 'google.com') {
            existingProvider = new GoogleAuthProvider();
            existingProvider.setCustomParameters({ login_hint: email });
          } else if (existingMethod === 'github.com') {
            existingProvider = new GithubAuthProvider();
          } else {
            // password — can't auto-link, tell them to use the form
            setError('This email uses password sign-in. Please enter your password above.');
            setIsLoading(false);
            return;
          }

          // Sign in then link the pending credential
          const result = await signInWithPopup(auth, existingProvider);
          if (pendingCred) {
            await linkWithCredential(result.user, pendingCred);
          }
          navigate('/dashboard', { replace: true });
        } catch (linkErr) {
          // If the user closed the popup during account linking, don't show a confusing error
          if (linkErr.code === 'auth/popup-closed-by-user') {
            setError('Sign-in was cancelled. Please try again.');
          } else {
            setError(friendlyError(linkErr.code));
          }
          setIsLoading(false);
        }
      } else {
        setError(friendlyError(err.code));
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => handleSocialLogin(googleProvider);
  const handleGithubLogin = () => handleSocialLogin(githubProvider);

  const inputClasses =
    'w-full px-4 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyber-accent/60 focus:ring-2 focus:ring-cyber-accent/20 transition-all duration-300 backdrop-blur-sm';

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-transparent z-10">
      {/* Animated Background Elements */}
      <FloatingParticles />
      <CyberGrid />
      <ScanLine />

      {/* Large glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyber-accent/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyber-neon/6 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        {/* Card glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-accent/20 via-emerald-600/20 to-cyber-neon/20 rounded-3xl blur-xl opacity-60" />

        <div className="relative bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-grift font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon via-emerald-400 to-cyber-accent">
                CyberPulse
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              {isLogin
                ? 'Access the threat intelligence command center'
                : 'Create your secure analyst account'}
            </p>
          </motion.div>

          {/* Toggle Login/Register */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1 border border-white/5">
            {['Login', 'Register'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(idx === 0);
                  setError('');
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  (idx === 0 ? isLogin : !isLogin)
                    ? 'bg-gradient-to-r from-cyber-accent/30 to-emerald-600/30 text-white border border-cyber-accent/30 shadow-lg shadow-cyber-accent/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id={`tab-${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group mb-4">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClasses}
                      id="login-name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                id="login-email"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputClasses + ' pr-12'}
                id="login-password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyber-neon transition-colors"
                id="toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password (Register only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={inputClasses}
                      id="login-confirm-password"
                      autoComplete="new-password"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password (login only) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-cyber-neon/70 hover:text-cyber-neon transition-colors"
                  id="forgot-password-btn"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(94, 210, 156, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 via-cyber-accent to-emerald-600 bg-[length:200%_auto] text-white font-bold rounded-xl text-base shadow-xl shadow-cyber-accent/20 transition-all duration-500 hover:bg-right disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              id="login-submit-btn"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {isLoading ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>{isLogin ? 'Authenticating...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <>
                  <span>{isLogin ? 'Access Dashboard' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              id="login-github-btn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              id="login-google-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-slate-500 mt-6">
            By continuing, you agree to CyberPulse&apos;s{' '}
            <span className="text-cyber-neon/70 hover:text-cyber-neon cursor-pointer transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-cyber-neon/70 hover:text-cyber-neon cursor-pointer transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>
      </motion.div>

      {/* Status bar at the bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-0 left-0 right-0 py-2 px-6 flex justify-between items-center text-[11px] text-slate-600 z-30 border-t border-white/5 bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>System Secure</span>
        </div>
        <span>Encrypted Connection • TLS 1.3</span>
        <span>v2.4.1</span>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Camera, Lock, Bell,
  Eye, EyeOff, Save, CheckCircle, Activity, Clock,
  AlertTriangle, Search, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

// --- Section Wrapper ---
function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="liquid-glass p-6 md:p-8 rounded-xl border border-white/10 backdrop-blur-xl"
    >
      <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-white mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-cyber-accent shadow-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

// --- Toast Notification ---
function Toast({ message, visible, onClose }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-green-500/20 border border-green-500/40 backdrop-blur-xl rounded-xl text-green-400 text-sm font-medium shadow-2xl"
          onAnimationComplete={() => setTimeout(onClose, 2500)}
        >
          <CheckCircle className="w-5 h-5" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Shared input style ---
const inputClass =
  'bg-transparent border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 w-full transition duration-300 text-white placeholder-slate-400';

// Helper: generate a colour-consistent gradient avatar from initials
function InitialAvatar({ name, email, size = 'w-36 h-36' }) {
  const letter = (name || email || 'U')[0].toUpperCase();
  return (
    <div
      className={`${size} rounded-2xl border-2 border-cyber-accent/30 shadow-neon flex items-center justify-center bg-gradient-to-br from-emerald-700 to-cyber-accent text-white font-extrabold text-5xl select-none`}
    >
      {letter}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // --- Profile State — seeded from Firebase user ---
  const roleKey = user?.uid ? `profile_role_${user.uid}` : null;
  const [profile, setProfile] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    role: (roleKey && localStorage.getItem(roleKey)) || 'Security Analyst',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || null);

  // Re-sync whenever the Firebase user object changes (e.g. after updateProfile)
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
      setAvatarPreview(user.photoURL || null);
    }
  }, [user]);

  // --- Settings State ---
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyDigest: true,
    newCVE: false,
    emailNotifs: true,
  });

  // --- Activity State (simulated) ---
  const lastLoginDate = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : new Date(Date.now() - 3600000).toLocaleString();

  const [activity] = useState({
    threatsViewed: 247,
    cvesAnalyzed: 89,
    lastLogin: lastLoginDate,
    recentCVEs: [
      { id: 'CVE-2026-1234', severity: 'CRITICAL', date: '2026-04-24' },
      { id: 'CVE-2026-0987', severity: 'HIGH', date: '2026-04-23' },
      { id: 'CVE-2026-0543', severity: 'MEDIUM', date: '2026-04-22' },
      { id: 'CVE-2026-0321', severity: 'LOW', date: '2026-04-21' },
      { id: 'CVE-2026-0112', severity: 'HIGH', date: '2026-04-20' },
    ],
  });

  const showToast = (msg) => setToast({ visible: true, message: msg });
  const hideToast = () => setToast({ visible: false, message: '' });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  // Persist name to Firebase + role to localStorage
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (auth.currentUser && profile.name !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: profile.name });
      }
      if (roleKey) localStorage.setItem(roleKey, profile.role);
      showToast('Profile updated successfully');
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast('Passwords do not match!');
      return;
    }
    setPasswords({ old: '', new: '', confirm: '' });
    showToast('Password changed successfully');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const severityColor = (s) => {
    const map = { CRITICAL: 'text-red-400 bg-red-500/15', HIGH: 'text-orange-400 bg-orange-500/15', MEDIUM: 'text-yellow-400 bg-yellow-500/15', LOW: 'text-green-400 bg-green-500/15' };
    return map[s] || 'text-slate-400 bg-slate-500/15';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Lock },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences</p>
        </div>
        <button onClick={handleLogout} id="profile-logout-btn" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>

      {/* Tab Selector */}
      <div className="flex gap-2 p-1 liquid-glass rounded-xl border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-600/30 to-cyber-accent/30 text-white border border-cyber-accent/30 shadow-lg shadow-cyber-accent/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            id={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ========== PROFILE TAB ========== */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Avatar Card */}
          <div className="liquid-glass p-6 rounded-xl border border-white/10 text-center relative h-fit">
            <div className="flex flex-col items-center gap-5 relative z-10">
              <div className="relative group flex items-center justify-center">
                <div className="absolute w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative z-10">
                  {avatarPreview ? (
                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyber-accent/30 shadow-neon">
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <InitialAvatar name={profile.name} email={profile.email} />
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity cursor-pointer z-20">
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-white text-lg">
                  {profile.name || profile.email?.split('@')[0] || 'Analyst'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyber-accent/15 text-cyber-neon border border-cyber-accent/20">
                  <Shield className="w-3.5 h-3.5" /> {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Edit Form */}
          <div className="lg:col-span-2">
            <Section title="Basic Information" icon={User} delay={0.1}>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} id="profile-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Email Address</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} id="profile-email" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Role</label>
                  <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className={inputClass + ' cursor-pointer'} id="profile-role">
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="Threat Researcher">Threat Researcher</option>
                    <option value="SOC Manager">SOC Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="CISO">CISO</option>
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} id="save-profile-btn"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 shadow-lg shadow-primary/20 font-bold transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </Section>
          </div>
        </div>
      )}

      {/* ========== SETTINGS TAB ========== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Change Password */}
          <Section title="Change Password" icon={Lock} delay={0}>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'Current Password', key: 'old', show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                { label: 'New Password', key: 'new', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                { label: 'Confirm New Password', key: 'confirm', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{field.label}</label>
                  <div className="relative">
                    <input type={field.show ? 'text' : 'password'} value={passwords[field.key]}
                      onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                      className={inputClass + ' pr-12'} id={`pw-${field.key}`} />
                    <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyber-neon transition-colors">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} id="change-pw-btn"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 shadow-lg shadow-primary/20 font-bold transition duration-300">
                <Lock className="w-4 h-4" /> Update Password
              </motion.button>
            </form>
          </Section>

          {/* Notifications & Theme */}
          <div className="space-y-8">
            <Section title="Notifications" icon={Bell} delay={0.1}>
              <div className="space-y-4">
                {[
                  { key: 'criticalAlerts', label: 'Critical Threat Alerts', desc: 'Get notified on critical CVEs immediately' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of weekly threat activity' },
                  { key: 'newCVE', label: 'New CVE Published', desc: 'Alert when new vulnerabilities are published' },
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive alerts via email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
                    </div>
                    <button onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`w-12 h-7 rounded-full transition-all duration-300 relative ${notifications[item.key] ? 'bg-gradient-to-r from-emerald-600 to-cyber-accent' : 'bg-slate-300 dark:bg-slate-600'}`}
                      id={`toggle-${item.key}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${notifications[item.key] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Theme section removed for unified dark aesthetic */}
          </div>
        </div>
      )}

      {/* ========== ACTIVITY TAB ========== */}
      {activeTab === 'activity' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Threats Viewed', value: activity.threatsViewed, icon: Search, color: 'from-emerald-500 to-teal-600' },
              { label: 'CVEs Analyzed', value: activity.cvesAnalyzed, icon: Shield, color: 'from-emerald-500 to-cyber-accent' },
              { label: 'Last Login', value: activity.lastLogin, icon: Clock, color: 'from-emerald-500 to-green-600', small: true },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="liquid-glass p-6 rounded-xl border border-white/10 flex items-center justify-between group hover:scale-[1.02] transition duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                  <p className={`${stat.small ? 'text-lg' : 'text-3xl'} font-bold mt-2 text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-cyber-neon transition-colors`}>{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent CVEs Table */}
          <Section title="Recent CVEs Analyzed" icon={AlertTriangle} delay={0.2}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                    <th className="pb-3 font-semibold">CVE ID</th>
                    <th className="pb-3 font-semibold">Severity</th>
                    <th className="pb-3 font-semibold">Date Analyzed</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.recentCVEs.map((cve, i) => (
                    <motion.tr key={cve.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-800 dark:text-white">{cve.id}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${severityColor(cve.severity)}`}>{cve.severity}</span>
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{cve.date}</td>
                      <td className="py-4 text-right">
                        <button className="text-cyber-neon/70 hover:text-cyber-neon transition-colors text-xs font-medium flex items-center gap-1 ml-auto">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
    </div>
  );
}

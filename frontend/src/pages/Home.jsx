import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative overflow-hidden">
      {/* Background Glowing Orb wrapper */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-neon">
          Threat Intelligence <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-400 dark:from-cyber-accent dark:to-cyber-neon drop-shadow-md">
            Simplified
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          AI-powered cybersecurity insights in seconds. Identify, analyze, and mitigate vulnerabilities faster than ever with CyberPulse.
        </p>

        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(184, 41, 255, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-600 dark:to-cyber-accent text-white font-bold rounded-full text-lg shadow-xl dark:shadow-neon transition-all"
          >
            Open Dashboard
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <motion.div 
      className="liquid-glass p-6 rounded-xl border border-white/10 hover:scale-[1.02] transition duration-300 relative overflow-hidden flex items-center justify-between group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-cyber-neon transition-colors">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  );
}

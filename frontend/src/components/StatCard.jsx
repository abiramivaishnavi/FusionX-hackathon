import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass-card-hover p-6 flex items-center justify-between group"
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-cyber-neon transition-colors">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  );
}

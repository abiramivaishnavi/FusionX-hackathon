import React from 'react';
import { motion } from 'framer-motion';

const severityColors = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  UNKNOWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export default function ThreatCard({ threat, onClick }) {
  const sevColor = severityColors[threat.severity?.toUpperCase()] || severityColors.UNKNOWN;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onClick(threat)}
      className="glass-card-hover p-5 cursor-pointer flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-cyber-neon transition-colors">
            {threat.id}
          </h4>
          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${sevColor}`}>
            {threat.severity}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {threat.description}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>{threat.date !== 'Unknown' ? new Date(threat.date).toLocaleDateString() : 'Unknown Date'}</span>
        <span className="group-hover:text-amber-500">View Summary ➔</span>
      </div>
    </motion.div>
  );
}

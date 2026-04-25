import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';

const severityColors = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  UNKNOWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

const severityBorder = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-yellow-500',
  LOW: 'border-l-green-500',
  UNKNOWN: 'border-l-slate-500',
};

export default function ThreatCard({ threat }) {
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.includes(threat.id);
  
  const sevColor = severityColors[threat.severity?.toUpperCase()] || severityColors.UNKNOWN;
  const leftBorder = severityBorder[threat.severity?.toUpperCase()] || severityBorder.UNKNOWN;

  return (
    <motion.div 
      className={`liquid-glass p-5 rounded-xl border border-white/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(94,210,156,0.15)] transition duration-300 flex flex-col justify-between group h-full border-l-4 ${leftBorder}`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-cyber-neon transition-colors">
              {threat.id}
            </h4>
            <span className={`px-2 py-1 rounded-md text-[10px] w-fit uppercase font-bold border ${sevColor}`}>
              {threat.severity}
            </span>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(threat.id);
            }}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-transparent text-slate-500 hover:bg-white/5 hover:text-white'}`}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-2">
          {threat.description}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>{threat.date !== 'Unknown' ? new Date(threat.date).toLocaleDateString() : 'Unknown Date'}</span>
      </div>
      <button 
        type="button"
        onClick={() => navigate(`/cve/${threat.id}`)}
        className="text-primary hover:underline text-sm mt-3 text-left w-fit"
      >
        View Details &rarr;
      </button>
    </motion.div>
  );
}

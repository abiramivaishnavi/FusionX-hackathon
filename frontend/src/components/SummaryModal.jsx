import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SummaryModal({ threatId, isOpen, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && threatId) {
      setSummary(null);
      setError(null);
      setLoading(true);
      
      axios.get(`http://localhost:5000/api/summary/${threatId}`)
        .then(res => setSummary(res.data.summary))
        .catch(err => setError(err.response?.data?.error || err.message))
        .finally(() => setLoading(false));
    }
  }, [threatId, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg p-6 glass-card bg-white/90 dark:bg-[#1a153a]/90 shadow-2xl dark:shadow-neon-strong border border-white/20"
          >
            <div className="flex justify-between items-center mb-6 border-b border-black/10 dark:border-white/10 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="text-indigo-500 dark:text-cyber-neon bg-indigo-500/10 dark:bg-cyber-neon/10 px-2 py-1 rounded">AI Summary</span> {threatId}
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-500 dark:text-white" />
              </button>
            </div>
            
            <div className="min-h-[150px] flex flex-col justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-cyber-neon" />
                  <p className="animate-pulse">Analyzing vulnerability...</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl">
                  <p className="font-bold flex items-center gap-2 mb-1">⚠️ Analysis Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {summary && (
                <div className="prose dark:prose-invert prose-p:leading-relaxed prose-sm max-w-none text-slate-700 dark:text-slate-200 whitespace-pre-line" dangerouslySetInnerHTML={{__html: summary.replace(/\n/g, '<br />')}}>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

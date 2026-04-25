import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Zap, Bot } from 'lucide-react';
import axios from 'axios';

export default function SummaryModal({ threatId, isOpen, onClose }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && threatId) {
      setSummaryData(null);
      setError(null);
      setLoading(true);
      
      const startTime = performance.now();
      axios.get(`http://localhost:5000/api/summary/${threatId}`)
        .then(res => {
          setSummaryData({
            text: res.data.summary,
            cached: res.data.cached,
            duration: Math.round(performance.now() - startTime)
          });
        })
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] sm:w-[90%] max-w-lg p-6 liquid-glass rounded-xl border border-white/10 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6 border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="text-emerald-500 dark:text-cyber-neon bg-emerald-500/10 dark:bg-cyber-neon/10 px-2 py-1 rounded text-sm">AI Summary</span> 
                  {threatId}
                </h2>
                {summaryData && (
                  <div className="flex items-center gap-3 text-xs">
                    {summaryData.cached ? (
                      <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                        <Zap size={14} /> Cached
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#b829ff] bg-[#b829ff]/10 px-2 py-1 rounded-md border border-[#b829ff]/20">
                        <Bot size={14} /> Generated
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">{summaryData.duration}ms</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors self-start">
                <X className="w-5 h-5 text-slate-500 dark:text-white" />
              </button>
            </div>
            
            <div className="min-h-[150px] flex flex-col justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 dark:text-cyber-neon" />
                  <p className="animate-pulse">Analyzing vulnerability...</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl">
                  <p className="font-bold flex items-center gap-2 mb-1">⚠️ Analysis Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {summaryData && (
                <div className="prose dark:prose-invert prose-p:leading-relaxed prose-sm max-w-none text-slate-700 dark:text-slate-200 whitespace-pre-line" dangerouslySetInnerHTML={{__html: summaryData.text.replace(/\n/g, '<br />')}}>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

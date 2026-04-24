import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  UNKNOWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

const severityBorder: Record<string, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-yellow-500',
  LOW: 'border-l-green-500',
  UNKNOWN: 'border-l-slate-500',
};

function RecommendationCard({ threat }: { threat: any }) {
  const navigate = useNavigate();
  const sevColor = severityColors[threat.severity?.toUpperCase()] || severityColors.UNKNOWN;
  const leftBorder = severityBorder[threat.severity?.toUpperCase()] || severityBorder.UNKNOWN;

  return (
    <motion.div 
      className={`liquid-glass p-5 rounded-xl border border-white/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(94,210,156,0.15)] transition duration-300 flex flex-col justify-between group h-full border-l-4 ${leftBorder}`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-cyber-neon transition-colors">
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
      <button 
        onClick={() => navigate(`/recommendation/${threat.id}`)}
        className="text-primary hover:underline text-sm mt-5 text-left font-medium"
      >
        Get Solution &rarr;
      </button>
    </motion.div>
  );
}

export default function Recommendations() {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/threats')
      .then((res) => {
        setThreats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 dark:text-cyber-neon" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading vulnerabilities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-10">
      <div>
        <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3 mb-6">
          <Shield className="text-primary" /> AI Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threats.map((threat) => (
            <RecommendationCard key={threat.id} threat={threat} />
          ))}
        </div>
      </div>
    </div>
  );
}

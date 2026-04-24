import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, AlertCircle, Activity, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatCard from '../components/ThreatCard';
import SummaryModal from '../components/SummaryModal';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedThreat, setSelectedThreat] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/stats'),
      axios.get('http://localhost:5000/api/threats')
    ]).then(([statsRes, threatsRes]) => {
      setStats(statsRes.data);
      setThreats(threatsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 dark:text-cyber-neon" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Syncing threat intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-10">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Analyzed" 
          value={stats?.total || 0} 
          icon={Shield} 
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600" 
        />
        <StatCard 
          title="Critical / High" 
          value={(stats?.breakdown?.critical || 0) + (stats?.breakdown?.high || 0)} 
          icon={AlertTriangle} 
          colorClass="bg-gradient-to-br from-red-500 to-orange-500" 
        />
        <StatCard 
          title="Medium Risk" 
          value={stats?.breakdown?.medium || 0} 
          icon={AlertCircle} 
          colorClass="bg-gradient-to-br from-amber-400 to-yellow-600" 
        />
        <StatCard 
          title="Low Severity" 
          value={stats?.breakdown?.low || 0} 
          icon={Activity} 
          colorClass="bg-gradient-to-br from-emerald-400 to-green-600" 
        />
      </div>

      {/* Threats Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
          <Shield className="text-indigo-500 dark:text-cyber-neon" /> Recent Vulnerabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threats.map(threat => (
            <ThreatCard key={threat.id} threat={threat} onClick={(t) => setSelectedThreat(t)} />
          ))}
        </div>
      </div>

      <SummaryModal 
        isOpen={!!selectedThreat} 
        threatId={selectedThreat?.id} 
        onClose={() => setSelectedThreat(null)} 
      />
    </div>
  );
}

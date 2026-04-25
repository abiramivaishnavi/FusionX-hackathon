import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, AlertCircle, Activity, Loader2, Download, Filter, Search, X } from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatCard from '../components/ThreatCard';
import { useBookmarks } from '../hooks/useBookmarks';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { bookmarks } = useBookmarks();
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED
  
  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    severities: [],
    minScore: 0,
    maxScore: 10,
    dateFrom: '',
    dateTo: ''
  });

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
      toast.error('Failed to sync threat intel');
      setLoading(false);
    });
  }, []);

  const handleExport = (format) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    window.location.href = `http://localhost:5000/api/export?format=${format}`;
  };

  const toggleSeverity = (sev) => {
    setFilters(prev => ({
      ...prev,
      severities: prev.severities.includes(sev)
        ? prev.severities.filter(s => s !== sev)
        : [...prev.severities, sev]
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      severities: [],
      minScore: 0,
      maxScore: 10,
      dateFrom: '',
      dateTo: ''
    });
  };

  // Filter Logic (AND combination)
  const filteredThreats = useMemo(() => {
    let result = threats;

    if (activeTab === 'SAVED') {
      result = result.filter(t => bookmarks.includes(t.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description?.toLowerCase().includes(q) || 
        t.id.toLowerCase().includes(q)
      );
    }

    if (filters.severities.length > 0) {
      result = result.filter(t => filters.severities.includes(t.severity.toUpperCase()));
    }

    // Score Filter
    result = result.filter(t => {
      const score = parseFloat(t.score) || 0;
      return score >= filters.minScore && score <= filters.maxScore;
    });

    if (filters.dateFrom) {
      const fromD = new Date(filters.dateFrom);
      result = result.filter(t => t.date !== 'Unknown' && new Date(t.date) >= fromD);
    }
    
    if (filters.dateTo) {
      const toD = new Date(filters.dateTo);
      result = result.filter(t => t.date !== 'Unknown' && new Date(t.date) <= toD);
    }

    return result;
  }, [threats, activeTab, bookmarks, searchQuery, filters]);

  const activeFiltersCount = filters.severities.length + (filters.minScore > 0 ? 1 : 0) + (filters.maxScore < 10 ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 dark:text-cyber-neon" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Syncing threat intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-10">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#13131a', color: '#fff', border: '1px solid #2a2a35' }, duration: 4000 }} />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Analyzed" value={stats?.total || 0} icon={Shield} colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Critical / High" value={(stats?.breakdown?.critical || 0) + (stats?.breakdown?.high || 0)} icon={AlertTriangle} colorClass="bg-gradient-to-br from-red-600 to-red-900" />
        <StatCard title="Medium Risk" value={stats?.breakdown?.medium || 0} icon={AlertCircle} colorClass="bg-gradient-to-br from-yellow-600 to-amber-800" />
        <StatCard title="Low Severity" value={stats?.breakdown?.low || 0} icon={Activity} colorClass="bg-gradient-to-br from-green-600 to-emerald-900" />
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
              <Shield className="text-primary" /> Vulnerabilities
            </h2>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 ml-auto lg:ml-4">
              <button onClick={() => setActiveTab('ALL')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'ALL' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}>All</button>
              <button onClick={() => setActiveTab('SAVED')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'SAVED' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}>Saved {bookmarks.length > 0 && <span className="bg-black/20 px-1.5 rounded-full text-xs">{bookmarks.length}</span>}</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search CVEs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
             </div>
             
             <button onClick={() => setShowFilters(!showFilters)} className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-semibold ${showFilters || activeFiltersCount > 0 ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
               <Filter className="w-4 h-4" /> Filters
               {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">{activeFiltersCount}</span>}
             </button>

             <div className="relative group ml-auto">
               <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-slate-300 text-sm font-semibold transition-colors">
                 <Download className="w-4 h-4" /> Export
               </button>
               <div className="absolute right-0 top-full mt-2 w-40 bg-[#0f0b1a] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                 <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors">JSON Format</button>
                 <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors">CSV Format</button>
               </div>
             </div>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="liquid-glass p-5 rounded-xl border border-white/10 mb-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Filter size={18} className="text-primary" /> Advanced Filters</h3>
              <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1"><X size={14} /> Clear All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Severities */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Severity Levels</label>
                <div className="flex flex-wrap gap-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].map(s => (
                    <button key={s} onClick={() => toggleSeverity(s)} className={`px-2 py-1 flex items-center gap-1.5 rounded border text-xs font-semibold uppercase transition-colors ${filters.severities.includes(s) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'}`}>
                      <div className={`w-2 h-2 rounded-full ${s === 'CRITICAL' ? 'bg-red-500' : s === 'HIGH' ? 'bg-orange-500' : s === 'MEDIUM' ? 'bg-yellow-500' : s === 'LOW' ? 'bg-green-500' : 'bg-slate-500'}`} /> {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* CVSS Score */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">CVSS Score Range</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="0" max="10" step="0.1" value={filters.minScore} onChange={e => setFilters({...filters, minScore: parseFloat(e.target.value)||0})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white" />
                  <span className="text-slate-500">to</span>
                  <input type="number" min="0" max="10" step="0.1" value={filters.maxScore} onChange={e => setFilters({...filters, maxScore: parseFloat(e.target.value)||10})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white" />
                </div>
              </div>

              {/* Date Published */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Date Published</label>
                <div className="flex items-center gap-3">
                  <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white [color-scheme:dark]" />
                  <span className="text-slate-500">to</span>
                  <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredThreats.length} {filteredThreats.length === 1 ? 'result' : 'results'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThreats.length === 0 ? (
            <div className="col-span-full flex flex-col justify-center items-center py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p>No vulnerabilities found matching your criteria.</p>
              <button onClick={resetFilters} className="text-primary hover:underline mt-2">Reset Filters</button>
            </div>
          ) : (
             filteredThreats.map(threat => (
               <ThreatCard key={threat.id} threat={threat} />
             ))
          )}
        </div>
      </div>
    </div>
  );
}

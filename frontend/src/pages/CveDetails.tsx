import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const severityColors = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  UNKNOWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export default function CveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [threat, setThreat] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    // Fetch CVE Details from threats endpoint
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/threats');
        const found = res.data.find((t) => t.id === id);
        if (found) {
          setThreat(found);
        } else {
          setError("CVE not found in recent threats.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch CVE data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    // Fetch AI Summary
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const res = await axios.get(`http://localhost:5000/api/summary/${id}`);
        setSummary(res.data.summary);
      } catch (err) {
        setSummaryError(err.response?.data?.error || err.message || "Failed to generate AI summary.");
      } finally {
        setSummaryLoading(false);
      }
    };

    if (id) {
      fetchSummary();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading CVE details...</p>
      </div>
    );
  }

  if (error || !threat) {
    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-10 flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-6 rounded-xl max-w-lg text-center">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sevColor = severityColors[threat.severity?.toUpperCase()] || severityColors.UNKNOWN;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10 relative z-10">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top: Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
            {threat.id}
          </h1>
          <span className={`px-4 py-1.5 rounded-md text-sm md:text-base font-bold border uppercase tracking-wider ${sevColor}`}>
            {threat.severity} Severity
          </span>
        </div>

        {/* Section 1: Description */}
        <section className="liquid-glass border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b border-white/5 pb-2">Description</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {threat.description}
          </p>
        </section>

        {/* Section 2: AI Summary */}
        <section className="bg-primary/10 border border-primary/30 rounded-xl p-6 shadow-[0_0_30px_rgba(94,210,156,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ShieldAlert className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2 relative z-10">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm tracking-widest font-bold">AI</span>
            Generated Summary
          </h2>
          
          <div className="relative z-10 min-h-[100px]">
            {summaryLoading ? (
               <div className="flex flex-col items-center justify-center gap-3 py-6">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-primary/70 animate-pulse text-sm">Analyzing vulnerability data...</p>
               </div>
            ) : summaryError ? (
               <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                 Failed to load AI summary: {summaryError}
               </div>
            ) : (
              <div 
                className="prose dark:prose-invert prose-p:leading-relaxed max-w-none text-slate-700 dark:text-slate-200 text-base" 
                dangerouslySetInnerHTML={{__html: summary?.replace(/\n/g, '<br />')}}
              />
            )}
          </div>
        </section>

        {/* Section 3: Technical Details */}
        <section className="liquid-glass border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b border-white/5 pb-2">Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Published Date</h3>
              <p className="text-slate-700 dark:text-slate-200 font-medium">
                {threat.date !== 'Unknown' ? new Date(threat.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Affected Systems</h3>
              <p className="text-slate-700 dark:text-slate-200 font-medium">
                See References / NVD Data
              </p>
            </div>

            <div className="md:col-span-2 mt-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">References</h3>
              {threat.references && threat.references.length > 0 ? (
                <ul className="space-y-2">
                  {threat.references.map((ref, i) => (
                    <li key={i}>
                      <a 
                        href={ref} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-sm"
                      >
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No references provided.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

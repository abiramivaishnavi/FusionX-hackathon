import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, ShieldAlert, Cpu } from 'lucide-react';

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  UNKNOWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

// ← ADD THIS FUNCTION
async function generateSolution(cve: any) {
  const response = await fetch("http://localhost:5000/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cve })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }
  return data.solution || "No AI response available";
}


export default function RecommendationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [threat, setThreat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [solution, setSolution] = useState<string | null>(null);
  const [solutionLoading, setSolutionLoading] = useState(true);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/threats');
        const found = res.data.find((t: any) => t.id === id);
        if (found) {
          setThreat(found);
        } else {
          setError("CVE not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch CVE data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (threat) {
      setSolutionLoading(true);
      generateSolution(threat)
        .then(sol => setSolution(sol))
        .catch(err => setSolutionError(err.message))
        .finally(() => setSolutionLoading(false));
    }
  }, [threat]);

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
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/recommendations')}
            className="mt-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors font-medium"
          >
            Back to Recommendations
          </button>
        </div>
      </div>
    );
  }

  const sevColor = severityColors[threat.severity?.toUpperCase()] || severityColors.UNKNOWN;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10 relative z-10">
      <button
        onClick={() => navigate('/recommendations')}
        className={`flex items-center gap-2 text-muted-foreground transition-colors mb-8 font-medium ${solutionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}`}
        disabled={solutionLoading}
      >
        <ArrowLeft className="w-4 h-4" /> &larr; Back to Recommendations
      </button>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
            {threat.id} Recommendations
          </h1>
          <span className={`px-4 py-1.5 rounded-md text-sm md:text-base font-bold border uppercase tracking-wider ${sevColor}`}>
            {threat.severity} Severity
          </span>
        </div>

        {/* Description Card */}
        <section className="liquid-glass border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b border-white/5 pb-2">Vulnerability Description</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {threat.description}
          </p>
        </section>

        {/* AI Recommendations Section */}
        <section className="bg-primary/10 border border-primary/30 rounded-xl p-6 mt-6 shadow-[0_0_30px_rgba(94,210,156,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Cpu className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-3 relative z-10">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm tracking-widest font-bold">AI</span>
            Solution Generated
          </h2>

          <div className="relative z-10 min-h-[200px]">
            {solutionLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-primary font-medium animate-pulse">Generating expert solution via Hugging Face...</p>
                <div className="w-full max-w-md h-2 bg-primary/20 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : solutionError ? (
              <div className="p-5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2 font-semibold">
                  <ShieldAlert className="w-5 h-5" />
                  Failed to generate AI solution
                </div>
                <p className="text-sm opacity-90">{solutionError}</p>
                <div className="mt-4 pt-4 border-t border-red-500/20">
                  <p className="text-sm font-medium">Rule-based suggestions:</p>
                  <ul className="list-disc list-inside mt-2 text-sm opacity-80 space-y-1">
                    <li>Check vendor patches immediately.</li>
                    <li>Isolate affected systems from public networks.</li>
                    <li>Monitor logs for indicators of compromise.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div
                className="prose dark:prose-invert prose-p:leading-relaxed max-w-none text-slate-700 dark:text-slate-200 text-lg"
                dangerouslySetInnerHTML={{ __html: solution?.replace(/\n/g, '<br />') || '' }}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

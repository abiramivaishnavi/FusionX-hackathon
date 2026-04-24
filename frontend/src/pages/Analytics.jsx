import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [trendData, setTrendData] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/trends'),
      axios.get('http://localhost:5000/api/stats')
    ]).then(([trendsRes, statsRes]) => {
      // Parse trends
      const rawTrends = trendsRes.data;
      const parsedTrends = Object.keys(rawTrends).sort().map(date => ({
        date,
        Critical: rawTrends[date].CRITICAL || 0,
        High: rawTrends[date].HIGH || 0,
        Medium: rawTrends[date].MEDIUM || 0,
        Low: rawTrends[date].LOW || 0
      }));
      setTrendData(parsedTrends);

      // Parse stats for bar chart
      const bData = statsRes.data.breakdown;
      setStatsData([
        { name: 'Critical', count: bData.critical || 0, fill: '#ef4444' },
        { name: 'High', count: bData.high || 0, fill: '#f97316' },
        { name: 'Medium', count: bData.medium || 0, fill: '#eab308' },
        { name: 'Low', count: bData.low || 0, fill: '#22c55e' },
      ]);
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
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Processing analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-10 animate-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
        <TrendingUp className="text-indigo-500 dark:text-cyber-neon w-10 h-10" /> 
        Threat Analytics
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Trend Area Chart */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-6 drop-shadow-sm">Vulnerability Discovery Trends</h3>
          <div className="flex-1 w-full min-h-0 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="date" stroke="#8b5cf6" />
                <YAxis stroke="#8b5cf6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', borderColor: '#b829ff', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ color: '#fff', fontSize: '14px' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Critical" stroke="#ef4444" fillOpacity={1} fill="url(#colorCritical)" />
                <Area type="monotone" dataKey="High" stroke="#f97316" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="Medium" stroke="#eab308" fillOpacity={0.6} fill="#eab308" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Bar Chart */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-6 drop-shadow-sm">Aggregate Severity Distribution</h3>
          <div className="flex-1 w-full min-h-0 text-xs text-slate-200 dark:text-white">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#8b5cf6" />
                <YAxis stroke="#8b5cf6" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', borderColor: '#b829ff', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ fontSize: '14px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

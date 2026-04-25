import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// ── Types ────────────────────────────────────────────────────────────────────
interface Threat {
  id: string;
  from: [number, number];
  to: [number, number];
  ip: string;
  country: string;
  type: string;
}

interface TooltipState {
  threat: Threat;
  x: number;
  y: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const THREAT_TYPES = ['DDoS', 'RCE', 'Brute Force', 'SQL Injection', 'XSS', 'Malware'];
const COUNTRIES = ['USA', 'China', 'Russia', 'Brazil', 'Germany', 'UK', 'India', 'France', 'Japan'];

const GEO_URL = '/world-countries.json'; // served from public/ — no network roundtrip

// ── Helpers ──────────────────────────────────────────────────────────────────
const randCoord = (): [number, number] => [
  (Math.random() - 0.5) * 340,
  (Math.random() - 0.5) * 160,
];

const randIP = () =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');

const randItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const makeRandomThreat = (): Threat => ({
  id: Math.random().toString(36).slice(2, 10),
  from: randCoord(),
  to: randCoord(),
  ip: randIP(),
  country: randItem(COUNTRIES),
  type: randItem(THREAT_TYPES),
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function ThreatMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [geoData, setGeoData] = useState<any>(null);
  const [threats, setThreats] = useState<Threat[]>([makeRandomThreat()]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // ── Observe container width ───────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setDimensions({ width: w, height: 400 });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Fetch TopoJSON ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo) => {
        // world-atlas@2 uses 'countries' as the object key
        const key = topo.objects.countries ? 'countries' : Object.keys(topo.objects)[0];
        const geo = topojson.feature(topo, topo.objects[key]) as any;
        setGeoData(geo);
      })
      .catch(console.error);
  }, []);

  // ── Real-time threat simulation ───────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setThreats((prev) => [...prev.slice(-7), makeRandomThreat()]);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // ── Derived projection + path ──────────────────────────────────────────────
  const { width, height } = dimensions;
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 6.5)
    .translate([width / 2, height / 2]);
  const pathGen = d3.geoPath().projection(projection);

  const project = (coord: [number, number]) => projection(coord) ?? [0, 0];

  return (
    <div className="relative liquid-glass p-6 rounded-xl border border-white/10 mb-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Live</span>
        </span>
        <h2 className="text-xl font-bold text-white">Threat Map</h2>
        <span className="ml-auto text-xs text-slate-500">{threats.length} active threats</span>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden bg-[#070d1a]"
        style={{ height: 400 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="threat-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FFC6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3A7BBF" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Countries */}
          {geoData
            ? geoData.features.map((feat: any) => (
                <path
                  key={feat.id ?? feat.properties?.name}
                  d={pathGen(feat) ?? ''}
                  fill="#0f172a"
                  stroke="#1e3a5f"
                  strokeWidth={0.5}
                />
              ))
            : null}

          {/* Attack lines */}
          {threats.map((t) => {
            const [x1, y1] = project(t.from);
            const [x2, y2] = project(t.to);
            return (
              <line
                key={`line-${t.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#threat-line-grad)"
                strokeWidth={1.5}
                strokeLinecap="round"
                filter="url(#glow)"
                className="threat-line-pulse"
              />
            );
          })}

          {/* Target markers */}
          {threats.map((t) => {
            const [cx, cy] = project(t.to);
            return (
              <g
                key={`marker-${t.id}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) =>
                  setTooltip({ threat: t, x: e.clientX, y: e.clientY })
                }
                onMouseMove={(e) =>
                  setTooltip({ threat: t, x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Outer pulse ring */}
                <circle cx={cx} cy={cy} r={10} fill="none" stroke="#EF4444" strokeWidth={1.5}>
                  <animate attributeName="r" from="6" to="18" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
                {/* Core dot */}
                <circle cx={cx} cy={cy} r={4} fill="#EF4444" filter="url(#glow)" />
              </g>
            );
          })}

          {/* Source markers (dim) */}
          {threats.map((t) => {
            const [cx, cy] = project(t.from);
            return (
              <circle
                key={`src-${t.id}`}
                cx={cx}
                cy={cy}
                r={2.5}
                fill="#3A7BBF"
                opacity={0.6}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ top: tooltip.y + 14, left: tooltip.x + 14 }}
          >
            <div className="bg-black/85 text-white text-xs px-3 py-2 rounded-lg border border-white/10 shadow-xl backdrop-blur-sm min-w-[150px]">
              <div className="font-bold text-red-400 mb-1.5 text-sm">{tooltip.threat.type}</div>
              <div className="text-slate-300 flex items-center gap-1.5">
                <span className="text-slate-500">IP</span> {tooltip.threat.ip}
              </div>
              <div className="text-slate-300 flex items-center gap-1.5">
                <span className="text-slate-500">Origin</span> {tooltip.threat.country}
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton while map loads */}
        {!geoData && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#070d1a]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              <p className="text-slate-500 text-xs">Loading threat map…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

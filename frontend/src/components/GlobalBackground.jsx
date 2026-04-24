import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

/* ═══════════════════════════════════════════
   HLS Background Video Component
   ═══════════════════════════════════════════ */
function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.6 }}
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════
   Central Glow SVG
   ═══════════════════════════════════════════ */
function CentralGlow() {
  return (
    <svg
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none z-[1] glow-pulse"
      viewBox="0 0 900 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glowBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
        </filter>
      </defs>
      <ellipse
        cx="450"
        cy="180"
        rx="380"
        ry="120"
        fill="url(#glowGrad)"
        filter="url(#glowBlur)"
      />
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5ed29c" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#1a7a5a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#070b0a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Grid Lines (desktop only)
   ═══════════════════════════════════════════ */
function GridLines() {
  return (
    <div className="hidden lg:block">
      <div className="grid-line" style={{ left: '25%' }} />
      <div className="grid-line" style={{ left: '50%' }} />
      <div className="grid-line" style={{ left: '75%' }} />
    </div>
  );
}

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: '#070b0a' }}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(58,123,191,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(0,255,198,0.1),transparent_40%)]" />
      {/* ── Video Background ── */}
      <div className="hero-video-wrap absolute inset-0 z-0">
        <HeroVideo />
      </div>

      {/* ── Left Gradient Overlay ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to right, #070b0a 0%, #070b0acc 25%, transparent 60%)',
        }}
      />

      {/* ── Bottom Gradient Overlay ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to top, #070b0a 0%, #070b0a99 20%, transparent 50%)',
        }}
      />

      {/* ── Central Glow ── */}
      <CentralGlow />

      {/* ── Grid Lines ── */}
      <GridLines />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import Hls from 'hls.js';






/* ═══════════════════════════════════════════
   MAIN HOME / HERO SECTION
   ═══════════════════════════════════════════ */
export default function Home() {
  return (
    <section
      id="hero-section"
      className="relative w-full min-h-screen overflow-hidden flex flex-col bg-transparent z-10"
    >




      {/* ── Hero Content ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-20 max-w-7xl mx-auto w-full">


        {/* Eyebrow */}
        <p
          className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase mb-4 animate-fade-in-up-delay-2"
          style={{ color: '#5ed29c' }}
        >
          Career-Ready Curriculum
        </p>

        {/* Main Headline */}
        <h1
          className="font-halfre font-extrabold uppercase tracking-tight leading-[1.05] mb-6 animate-fade-in-up-delay-2
                     text-[40px] sm:text-[52px] md:text-[60px] lg:text-[72px] text-white"
        >
          TURN THREAT DATA<br className="hidden sm:block" /> INTO CLARITY
        </h1>

        {/* Description */}
        <p className="font-inter text-[14px] text-white/70 max-w-[512px] leading-relaxed mb-10 animate-fade-in-up-delay-3">
          A customizable, API-powered threat intelligence platform
          that aggregates signals from multiple sources in real time.
          Filter noise, prioritize risks, and generate actionable security briefs — instantly.
        </p>

        {/* Primary CTA */}
        <div className="animate-fade-in-up-delay-4">
          <Link to="/dashboard">
            <button
              id="hero-cta-btn"
              className="group inline-flex items-center gap-2 rounded-full font-inter font-bold text-[14px] uppercase tracking-wider
                         px-7 py-3.5 transition-all duration-300
                         hover:shadow-[0_0_30px_rgba(94,210,156,0.35)] hover:scale-[1.03] active:scale-[0.97]"
              style={{ backgroundColor: '#5ed29c', color: '#070b0a' }}
            >
              Get Started
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Bottom Decorative Bar ── */}
      <div className="relative z-10 px-6 md:px-10 lg:px-20 pb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-white/20 text-[11px] font-inter">
          <span>© 2025 CyberPulse</span>
          <span className="hidden sm:inline">Turn threat data into clarity.</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-codenest-green inline-block animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </section>
  );
}

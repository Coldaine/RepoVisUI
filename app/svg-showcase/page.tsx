'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import { ArrowLeft, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { sounds } from '@/lib/audio';
import Link from 'next/link';

// Premium Easing Curves
const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT_PREMIUM = [0.65, 0, 0.35, 1] as const;
const SPRING_TACTILE = { type: "spring", stiffness: 400, damping: 25 } as const;

// ----------------------------------------------------------------------
// Trick 1: The "Gooey" Metabal Filter
// Demonstrates how SVG filters (feGaussianBlur + feColorMatrix) can melt 
// discrete vector shapes into liquid combinations.
// ----------------------------------------------------------------------
const GooeyFilterDemo = () => {
  return (
    <div className="relative w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 18 -7" 
              result="goo" 
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      <div className="relative w-full h-full" style={{ filter: 'url(#goo)' }}>
        <motion.div
          animate={{ x: [-60, 60, -60], y: [-30, 30, -30] }}
          transition={{ duration: 6, repeat: Infinity, ease: EASE_IN_OUT_PREMIUM }}
          className="absolute top-1/2 left-1/2 w-28 h-28 bg-primary rounded-full mix-blend-screen -ml-14 -mt-14 opacity-80"
        />
        <motion.div
          animate={{ x: [60, -60, 60], y: [30, -30, 30] }}
          transition={{ duration: 5, repeat: Infinity, ease: EASE_IN_OUT_PREMIUM }}
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent rounded-full mix-blend-screen -ml-16 -mt-16 opacity-70"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: EASE_IN_OUT_PREMIUM }}
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full mix-blend-screen -ml-12 -mt-12 opacity-60"
        />
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-white/50 font-mono flex gap-2">
        <Info className="w-4 h-4 shrink-0" />
        <p><strong>Limit:</strong> SVG Filters are rasterized on the GPU. Extremely large filtered areas or complex filter chains cause severe paint latency.</p>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// Trick 2: Path Tracing & Length 
// Using stroke-dasharray and stroke-dashoffset to draw geometry.
// ----------------------------------------------------------------------
const PathTracingDemo = () => {
  return (
    <div className="relative w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
       <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-[0_0_15px_rgba(255,51,102,0.5)]">
        <motion.path
          d="M 100, 10 
             C 150, 10 190, 50 190, 100 
             C 190, 150 150, 190 100, 190 
             C 50, 190 10, 150 10, 100 
             C 10, 50 50, 10 100, 10 Z
             M 100, 40 L 160, 150 L 40, 150 Z"
          fill="transparent"
          strokeWidth="2"
          stroke="#ff3366"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, repeat: Infinity, ease: EASE_PREMIUM, repeatType: "loop", repeatDelay: 1 }}
        />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 text-xs text-white/50 font-mono flex gap-2">
        <Info className="w-4 h-4 shrink-0" />
        <p><strong>Limit:</strong> Highly complex paths (thousands of bezier curves) with animated dash-offsets force the browser to constantly recalculate bounding boxes.</p>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// Trick 3: Dynamic Masking
// SVG <clipPath> allows text to punch a hole through to moving layers.
// ----------------------------------------------------------------------
const MaskingDemo = () => {
  return (
    <div className="relative w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
      <svg className="absolute w-0 h-0">
        <clipPath id="text-mask">
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="text-7xl md:text-8xl font-black uppercase tracking-tighter"
          >
            REPOVIS
          </text>
        </clipPath>
      </svg>

      {/* Layer that gets masked */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ clipPath: 'url(#text-mask)', WebkitClipPath: 'url(#text-mask)' }}
      >
        <motion.div 
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: EASE_IN_OUT_PREMIUM }}
          className="w-[200%] h-full bg-gradient-to-r from-primary via-accent to-[#ff3366]"
          style={{ backgroundSize: '200% 200%' }}
        />
        {/* Animated grid lines behind the text mask */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-white/50 font-mono flex gap-2">
        <Info className="w-4 h-4 shrink-0" />
        <p><strong>Trick:</strong> Text remains perfectly selectable (if pointer events enabled) and scalable while masking complex web gradients or even videos.</p>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// Trick 4: The DOM Stress Test (Many Nodes)
// Generates many SVG nodes to demonstrate the real limitation of SVG vs Canvas.
// ----------------------------------------------------------------------
const DomStressTest = () => {
  const [count, setCount] = useState(250);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate particles in useMemo to maintain purity
  const particles = useMemo(() => {
    /* eslint-disable react-hooks/purity */
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      cx: Math.random() * 800,
      cy: Math.random() * 400,
      r: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * -10
    }));
    /* eslint-enable react-hooks/purity */
  }, [count]);

  return (
    <div className="relative w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/5 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 z-10 flex gap-2 items-center bg-black/50 px-3 py-1.5 rounded border border-white/10">
        <span className="text-xs font-mono text-white">Nodes: {count}</span>
        <input 
          type="range" 
          min="10" 
          max="2000" 
          step="10"
          value={count} 
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-24 accent-primary"
        />
      </div>

      <svg ref={svgRef} viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-50">
        {particles.map(p => (
          <motion.circle
            key={p.id}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#00e5ff"
            initial={{ opacity: 0.1, y: 0 }}
            animate={{ opacity: [0.1, 0.8, 0.1], y: -50 }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </svg>
      
      <div className="absolute bottom-4 left-4 right-4 text-xs text-warning/80 font-mono flex gap-2 bg-background-dark/80 p-2 rounded backdrop-blur">
        <AlertTriangle className="w-4 h-4 shrink-0 text-warning" />
        <p><strong>The Ultimate Limit:</strong> Browsers treat every SVG element as a DOM node. Push this slider past 1,000 and the browser will struggle to manage layout and paint. For 10,000+ items, you *must* use Canvas/WebGL instead of SVG.</p>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// Page Main Structure
// ----------------------------------------------------------------------
export default function SvgShowcase() {
  return (
    <div className="min-h-screen bg-background-dark text-text-main font-sans overflow-x-hidden selection:bg-primary/30">
      {/* Global Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_2px,2px_100%] z-[100] opacity-30" />

      <div className="w-full max-w-7xl mx-auto min-h-screen px-6 py-12 relative z-10 flex flex-col">
        
        {/* Header */}
        <header className="mb-12 border-b border-white/5 pb-8">
          <Link href="/">
            <motion.div 
              onMouseEnter={() => sounds.tick()}
              onClick={() => sounds.whoosh()}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_TACTILE}
              className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-mono mb-8 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </motion.div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20" style={{ boxShadow: '0 0 20px rgba(184,41,255,0.2)' }}>
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter font-display uppercase italic">The Vector Lab</h1>
              <p className="text-muted mt-2 max-w-2xl">
                A technical showcase of advanced scalable vector graphic (SVG) capabilities, tricks, and hard limits. 
                Before reaching for WebGL or Canvas, SVG often provides perfect fidelity, declarative accessibility, and DOM-level interactivity.
              </p>
            </div>
          </div>
        </header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
          
          {/* Card 1 */}
          <motion.div 
            onMouseEnter={() => sounds.tick()}
            whileHover={{ y: -8 }}
            transition={SPRING_TACTILE}
            className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl"
          >
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
              Liquid Metrics (Gooey Filters)
            </h2>
            <GooeyFilterDemo />
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              By stacking `feGaussianBlur` and a high-contrast `feColorMatrix`, distinct elements melt together when they overlap. This is perfect for visualizing closely coupled modules merging into a monolith.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            onMouseEnter={() => sounds.tick()}
            whileHover={{ y: -8 }}
            transition={SPRING_TACTILE}
            className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl"
          >
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366] shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
              Architectural Tracing (Dash Offsets)
            </h2>
            <PathTracingDemo />
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              Animating the `stroke-dashoffset` property creates the illusion of a line drawing itself. Excellent for revealing hidden data dependencies or tracing the execution path of a complex request.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            onMouseEnter={() => sounds.tick()}
            whileHover={{ y: -8 }}
            transition={SPRING_TACTILE}
            className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl"
          >
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(184,41,255,0.5)]" />
              Dynamic Masks (clipPath)
            </h2>
            <MaskingDemo />
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              SVG `&lt;clipPath&gt;` allows you to cut shapes out of other DOM elements. Unlike standard CSS clips, SVG allows clipping against live text or complex curves while retaining accessibility.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            onMouseEnter={() => sounds.tick()}
            whileHover={{ y: -8 }}
            transition={SPRING_TACTILE}
            className="bg-surface/50 backdrop-blur-xl border border-warning/20 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl shadow-warning/5"
          >
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-warning">
              <AlertTriangle className="w-5 h-5" />
              The DOM Node Boundary (Stress Test)
            </h2>
            <DomStressTest />
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              SVGs are retained mode graphics. The browser tracks every circle and path in the DOM. This is their absolute limit. When visualizing 10,000+ files in a massive monorepo, SVG collapses and Canvas/WebGL takes over.
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
}

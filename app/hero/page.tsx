"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Activity, Play, Terminal, Box, Globe, Square, Aperture } from 'lucide-react';
import { estimateComputePower } from './actions';

// --- Shared Data ---
const TOTAL_FLOPS = 395.3;
const MOOSEGOOSE_HARDWARE = [
  { name: "2x RTX PRO 6000 Blackwell", flops: 250.0, type: "gpu", color: "#65a30d", details: "GB202 · 24,064 CUDA" },
  { name: "GeForce RTX 5090", flops: 104.8, type: "gpu", color: "#a3e635", details: "GB202 · 21,760 CUDA · 2025" },
  { name: "GeForce RTX 3090", flops: 35.6, type: "gpu", color: "#4d7c0f", details: "GA102 · 10,496 CUDA · 2020" },
  { name: "Threadripper 7985WX", flops: 2.5, type: "cpu", color: "#e11d48", details: "Zen 4 · 64C/128T · AVX-512" },
  { name: "Core i9-14900KF", flops: 2.0, type: "cpu", color: "#2563eb", details: "Raptor Lake-R · 24C/32T" },
  { name: "Old i7 Box", flops: 0.4, type: "cpu", color: "#1d4ed8", details: "Haswell-era · 4C/8T" }
];

// --- Variant 1: The Receipt ---
const VariantReceipt = () => {
  return (
    <div id="variant-1" className="snap-center relative h-screen shrink-0 bg-[#0c0c0c] flex items-center justify-center overflow-hidden px-4 py-20 md:py-0 text-[#e5e5e5] font-mono selection:bg-orange-500/30">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* Left: The Literal Receipt */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.2em] text-[#a1a1aa] uppercase">Visualization 01 · The Receipt</h3>
            <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight">One desk.<br/>Itemized.</h2>
            <p className="text-sm font-sans text-[#a1a1aa] max-w-sm">Every chip in the office, every TFLOPS it spits out, and what it would have cost to buy that much compute when nation-states were the only ones who could.</p>
          </div>

          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 font-mono text-xs w-full max-w-sm mx-auto lg:mx-0 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent opacity-50" />
            <div className="text-center space-y-2 mb-6">
              <h4 className="font-bold text-lg tracking-widest uppercase">Moosegoose</h4>
              <p className="text-[#a1a1aa]">COMPUTE ITEMIZATION · 2026</p>
              <p className="text-[#a1a1aa]">--------- desk #1 ---------</p>
            </div>
            
            <div className="flex justify-between text-[#71717a] border-b border-dashed border-[#3f3f46] pb-2 mb-2">
              <span>ITEM</span>
              <span>FP32 TFLOPS</span>
            </div>
            
            <div className="space-y-3 mb-6">
              {MOOSEGOOSE_HARDWARE.map(hw => (
                <div key={hw.name} className="flex justify-between">
                  <span className={hw.type === 'gpu' ? 'text-[#f97316]' : 'text-white'}>{hw.name.replace('2x ', '2x ')}</span>
                  <span>{hw.flops.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#3f3f46] pt-4 space-y-2 mb-6">
              <div className="flex justify-between font-bold">
                <span>SUBTOTAL FP32</span>
                <span className="text-white">395.30 TF</span>
              </div>
              <div className="flex justify-between text-[#a1a1aa]">
                <span>WALL POWER</span>
                <span>~2,823 W</span>
              </div>
            </div>

            <div className="text-center space-y-2 text-[#a1a1aa]">
              <p>-- AS A SUPERCOMPUTER --</p>
              <div className="flex justify-between">
                <span>= world&apos;s #1, year</span>
                <span className="text-[#f97316] font-bold">2004</span>
              </div>
              <div className="flex justify-between">
                <span>= entire Top500 sum</span>
                <span className="text-[#2dd4bf] font-bold">2001</span>
              </div>
            </div>

            <div className="mt-8 text-center border-t border-dashed border-[#3f3f46] pt-4">
               <svg className="w-full h-12 opacity-80" viewBox="0 0 200 40" preserveAspectRatio="none">
                 <path d="M10 0v40M15 0v40M25 0v40M30 0v40M45 0v40M55 0v40M60 0v40M75 0v40M80 0v40M95 0v40M105 0v40M115 0v40M125 0v40M130 0v40M145 0v40M150 0v40M165 0v40M175 0v40M180 0v40M190 0v40" stroke="white" strokeWidth="3"/>
                 <path d="M12 0v40M20 0v40M35 0v40M40 0v40M50 0v40M65 0v40M70 0v40M85 0v40M90 0v40M100 0v40M110 0v40M120 0v40M135 0v40M140 0v40M155 0v40M160 0v40M170 0v40M185 0v40M195 0v40" stroke="white" strokeWidth="1"/>
               </svg>
               <p className="mt-2 text-[10px] text-[#71717a]">MG · 395300 GF · 32</p>
            </div>
          </div>
        </div>

        {/* Right: The Callouts */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
          <motion.div initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="border border-[#f97316]/30 bg-[#1a120c] rounded-2xl p-8 backdrop-blur-sm">
            <h4 className="text-[#f97316] text-xs font-bold tracking-widest uppercase mb-4">The Headline</h4>
            <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
              The compute under my desk would have been the <span className="text-[#f97316]">world&apos;s #1 supercomputer in 2004.</span>
            </h2>
            <p className="text-[#a1a1aa] font-sans md:text-lg">Specifically, it crushes the legendary Earth Simulator at 35.9 TFLOPS — a machine that took up a purpose-built warehouse, drew ~20 MW, and cost Japan ~$350M.</p>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="border border-[#2dd4bf]/30 bg-[#0c1616] rounded-2xl p-8 backdrop-blur-sm">
            <h4 className="text-[#2dd4bf] text-xs font-bold tracking-widest uppercase mb-4">The Wilder One</h4>
            <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
              And in <span className="text-[#2dd4bf]">2001</span>, this same desk would have outperformed the entire Top500 list <span className="text-[#2dd4bf]">combined.</span>
            </h2>
            <p className="text-[#a1a1aa] font-sans md:text-lg">Every government lab, every oil major&apos;s seismic cluster, every hedge fund&apos;s trading rig — all 500 summed together — produced 134.00 TFLOPS. My desk does 395.30 TFLOPS.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- Variant 2: The Stack ---
const VariantStack = () => {
  return (
    <div id="variant-2" className="snap-center relative h-screen shrink-0 bg-[#050505] flex flex-col justify-center overflow-hidden px-6 lg:px-20 text-white font-sans selection:bg-green-500/30">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-screen pt-32 pb-20">
        
        {/* Left: Stack Specs */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12 z-10">
          <div>
            <h4 className="text-[#a1a1aa] uppercase tracking-widest text-xs mb-4 font-mono">Visualization 02 · Stacked Structure</h4>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              395 <span className="text-2xl md:text-4xl text-[#a1a1aa] font-medium tracking-normal">TFLOPS · FP32</span>
            </h1>
            <p className="mt-6 text-[#a1a1aa] text-lg max-w-md leading-relaxed">
              Seven chips, 2,823 watts, one office. Each block represents a physical piece of silicon. The array is scaled proportionately to raw FLOPS output.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs hidden md:block">
            {MOOSEGOOSE_HARDWARE.map((hw, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={hw.name} className="flex justify-between items-center group">
                 <div className="flex gap-4 items-center">
                   <div className="w-3 h-3" style={{ backgroundColor: hw.color }} />
                   <div>
                     <p className="text-white font-bold text-sm tracking-tight">{hw.name}</p>
                     <p className="text-[#71717a]">{hw.details}</p>
                   </div>
                 </div>
                 <div className="font-bold text-white tracking-widest">{hw.flops.toFixed(1)} TF</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: The Stacked Bar SVGs */}
        <div className="lg:col-span-7 relative h-full flex items-end justify-center lg:justify-end pb-12 overflow-visible">
          <div className="relative w-full max-w-md h-[60vh] lg:h-[80vh] flex flex-col justify-end group cursor-crosshair">
            
            {/* Historical Baseline markers floating behind */}
            <div className="absolute inset-x-[-100px] bottom-[34%] border-t border-dashed border-[#a1a1aa]/50 pointer-events-none z-0">
               <span className="absolute -top-5 right-0 text-[#a1a1aa] font-mono text-[10px]">#1 in 2001: ASCI White (7.2 TFLOPS)</span>
            </div>
            
            {/* The Stack */}
            <div className="relative z-10 w-full flex flex-col shadow-[0_0_100px_rgba(101,163,13,0.1)]">
              {MOOSEGOOSE_HARDWARE.map((hw, i) => {
                // Determine height % based on flops
                const heightPercent = (hw.flops / TOTAL_FLOPS) * 100;
                return (
                  <motion.div 
                    initial={{ scaleY: 0 }} 
                    whileInView={{ scaleY: 1 }} 
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (MOOSEGOOSE_HARDWARE.length - i) * 0.1, ease: 'easeOut' }}
                    key={hw.name} 
                    className="w-full origin-bottom relative flex justify-center items-center border-t border-black/20 hover:brightness-125 transition-all"
                    style={{ height: `${Math.max(heightPercent, 1)}%`, backgroundColor: hw.color, minHeight: '12px' }}
                  >
                    {heightPercent > 8 && (
                      <span className="text-black/60 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest truncate px-4">{hw.name}</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
            
            {/* X Axis Floor */}
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 blur-sm" />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Variant 3: Real Estate (Area Footprints) ---
const VariantRealEstate = () => {
  const systems = [
    { name: "Cray-1", year: "1976", flops: "160.0 MFLOPS", desc: "horseshoe-shaped", area: 70 },
    { name: "ASCI Red", year: "1997", flops: "1.3 TFLOPS", desc: "85 cabinets, Sandia", area: 1600 },
    { name: "Earth Simulator", year: "2002", flops: "35.9 TFLOPS", desc: "purpose-built building", area: 17000 },
    { name: "Roadrunner", year: "2008", flops: "1.03 PFLOPS", desc: "278 racks, Los Alamos", area: 6000 },
    { name: "MY CLOSET", year: "2026", flops: "395.3 TFLOPS", desc: "7 chips, one tower", area: 6, isDesk: true }
  ];

  // Scale: sqrt(area) to get side length, mapped to logical pixels
  const maxArea = 17000;
  const maxPixelSize = 160; 
  const scaleRatio = maxPixelSize / Math.sqrt(maxArea);

  return (
    <div id="variant-3" className="snap-center relative h-screen shrink-0 bg-[#f4f4f5] text-[#18181b] flex flex-col justify-center px-4 md:px-12 font-sans overflow-hidden py-12 md:py-0">
      <div className="max-w-7xl mx-auto w-full z-10 flex flex-col h-full justify-center">
        
        <div className="mb-12 md:mb-24 space-y-4">
          <h4 className="text-[#71717a] uppercase tracking-widest text-[10px] font-bold">Visualization 03 · Supercomputing Real Estate</h4>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl">
            They built warehouses for less compute than I have under my desk.
          </h2>
          <p className="text-[#52525b] text-sm md:text-lg max-w-2xl">
            Below: each machine drawn as a footprint, sized roughly to its physical floor area. <br/>
            Each one&apos;s compute, in TFLOPS, in monospace. My closet rig: <span className="font-bold text-black">395</span>.
          </p>
        </div>

        {/* Floorplan Array */}
        <div className="flex bg-[#e4e4e7]/50 p-4 md:p-8 rounded-xl overflow-x-auto snap-x pb-8">
          <div className="flex items-end gap-8 md:gap-16 min-w-max">
            {systems.map((sys, i) => {
              const sideLength = Math.sqrt(sys.area) * scaleRatio;
              return (
                <div key={sys.name} className="flex flex-col snap-end relative">
                  
                  {/* Square graphic representing floor area */}
                  <div className="h-[200px] flex items-end mb-4 relative">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`border-[1.5px] relative overflow-hidden backdrop-blur-sm shadow-sm ${sys.isDesk ? 'border-[#dc2626] bg-[#fef2f2] shadow-[#dc2626]/20' : 'border-[#52525b] bg-[url("https://transparenttextures.com/patterns/diagonal-stripes.png")] bg-white/50'}`}
                      style={{ width: `${Math.max(sideLength, 8)}px`, height: `${Math.max(sideLength, 8)}px` }}
                    >
                      {/* Show text inside if big enough */}
                      {sideLength > 80 && (
                        <span className="absolute top-2 left-2 text-[10px] text-[#71717a] font-mono">~{sys.area} ft²</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Descriptive Text */}
                  <div className={`pt-4 border-t-2 w-48 ${sys.isDesk ? 'border-[#dc2626]' : 'border-[#52525b]'}`}>
                    <p className={`text-xs font-bold mb-1 ${sys.isDesk ? 'text-[#dc2626]' : 'text-[#71717a]'}`}>{sys.year}</p>
                    <h4 className={`text-xl font-bold mb-2 ${sys.isDesk ? 'text-[#dc2626]' : 'text-black'}`}>{sys.name}</h4>
                    <p className="font-mono text-xs text-[#52525b] mb-1">{sys.flops}</p>
                    <p className="text-[10px] text-[#71717a] h-8">{sys.desc}</p>
                  </div>
                  
                  {/* The Multiplier Badge */}
                  <div className={`mt-4 px-3 py-1.5 text-center text-[10px] font-bold tracking-widest font-mono ${sys.isDesk ? 'bg-[#18181b] text-white' : 'bg-[#fcd34d] text-black'}`}>
                    {sys.isDesk ? 'YOU = 1.0x' : `YOU = ${(parseFloat('395.3') / (sys.flops.includes('MFLOPS') ? parseFloat(sys.flops)/1000000 : sys.flops.includes('PFLOPS') ? parseFloat(sys.flops)*1000 : parseFloat(sys.flops))).toLocaleString(undefined, {maximumFractionDigits: 0})}x`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Variant 4: Singularity / Galaxy ---
const VariantGalaxy = () => {
  // Generate random particles (pseudo-random for purity)
  const particles = useMemo(() => Array.from({length: 395}).map((_, i) => {
    const pseudoRand1 = ((i * 137) % 100) / 100;
    const pseudoRand2 = ((i * 149) % 100) / 100;
    const pseudoRand3 = ((i * 163) % 100) / 100;
    const pseudoRand4 = ((i * 179) % 100) / 100;
    
    const angle = pseudoRand1 * Math.PI * 2;
    const radius = pseudoRand2 * pseudoRand3 * 45 + 5; // concentrated near center
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      scale: pseudoRand4 * 0.5 + 0.5,
      color: pseudoRand1 > 0.8 ? '#3b82f6' : (pseudoRand2 > 0.9 ? '#ef4444' : '#a3e635'),
      delay: pseudoRand3 * 2
    };
  }), []);

  return (
    <div id="variant-4" className="snap-center relative h-screen shrink-0 bg-[#020108] border-t border-white/5 overflow-hidden font-sans flex items-center justify-center select-none">
      
      {/* Background concentric reference rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[100vmin] h-[100vmin]">
          <circle cx="50" cy="50" r="20" fill="none" stroke="#374151" strokeWidth="0.1" strokeDasharray="1 1" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#374151" strokeWidth="0.1" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#374151" strokeWidth="0.1" strokeDasharray="1 4" />
        </svg>
      </div>

      {/* The Particle Field (1 dot = 1 TFLOP) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120vmin] h-[120vmin] relative motion-safe:animate-[spin_240s_linear_infinite]">
          {particles.map((p, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               whileInView={{ opacity: 1, scale: p.scale }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: p.delay }}
               className="absolute w-1.5 h-1.5 rounded-sm shadow-[0_0_8px_currentColor]"
               style={{ 
                 left: `${p.x}%`, top: `${p.y}%`, 
                 backgroundColor: p.color, color: p.color
               }}
             />
          ))}
        </div>
      </div>

      {/* Hero Typography floating over */}
      <div className="relative z-10 text-center mix-blend-screen pointer-events-none px-4">
        <h4 className="text-[#a1a1aa] font-mono text-[10px] md:text-xs tracking-[0.5em] uppercase mb-4">Visualization 04 · The Particle Galaxy</h4>
        <h1 className="text-8xl md:text-[180px] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          395
        </h1>
        <p className="text-[#a1a1aa] font-sans tracking-[0.6em] md:tracking-[1em] text-sm md:text-xl uppercase mt-2 drop-shadow-md">Teraflops</p>
        
        <div className="mt-16 inline-flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
           <div className="w-2 h-2 bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
           <span className="text-[#a1a1aa] font-mono text-xs uppercase tracking-widest">1 Particle = 1 TFLOP Output</span>
        </div>
      </div>

      {/* Labels positioned mathematically */}
      <div className="hidden lg:block absolute bottom-12 left-12 max-w-sm">
        <h3 className="text-xl font-bold text-white font-serif italic mb-2">The Punchline _________</h3>
        <p className="text-2xl text-white font-bold leading-tight">
          Equal to every supercomputer on Earth combined <span className="italic text-[#fcd34d]">in 2003.</span>
        </p>
      </div>

    </div>
  );
};

// --- Variant 5: Telemetry / Interactive ---
const VariantTelemetry = () => {
  const [input, setInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if(!input) return;
    setIsEvaluating(true);
    setResult(null);
    const res = await estimateComputePower(input);
    if(res.success) {
      setResult(res.text as string);
    } else {
      setResult("ERR_LLM_TIMEOUT // Please re-evaluate target array constraints.");
    }
    setIsEvaluating(false);
  };

  return (
    <div id="variant-5" className="snap-center relative h-screen shrink-0 bg-[#001000] flex flex-col items-center justify-center px-4 md:px-8 border-t border-[#005500] font-mono overflow-hidden">
      
      {/* CRT Scanline overlay effect */}
      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[url('https://transparenttextures.com/patterns/px_by_Greige.png')]" />
      
      <div className="w-full max-w-4xl z-10 p-2 md:p-8 border border-[#00ff00]/30 bg-[#000500] rounded-sm shadow-[0_0_60px_rgba(0,255,0,0.1)] relative">
         <div className="flex justify-between items-center border-b border-[#00ff00]/30 pb-4 mb-8">
           <div className="flex gap-2 items-center">
             <div className="w-3 h-3 bg-[#00ff00] animate-pulse" />
             <span className="text-[#00ff00] text-xs md:text-sm tracking-widest font-bold">SYS.TEST.ORCHESTRATOR</span>
           </div>
           <span className="text-[#00aa00] text-[10px] md:text-xs tracking-widest">VIS_05.MISSION_CONTROL</span>
         </div>
         
         <div className="space-y-6">
           <p className="text-[#00cc00] text-sm md:text-lg max-w-2xl leading-relaxed">
             &gt; INITIATE LOCAL HARDWARE QUERY...<br/>
             &gt; ENTER SYSTEM CONFIGURATION BELOW TO EXTRAPOLATE HISTORICAL TFLOP PARITY.
           </p>
           
           <div className="flex flex-col md:flex-row gap-0 group">
              <span className="p-4 bg-[#001a00] text-[#00ff00] border border-[#00ff00]/50 border-r-0 md:border-b border-b-0 hidden md:block">
                $
              </span>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. RTX 4090 + 13900k..."
                className="flex-1 bg-[#001a00] border border-[#00ff00]/50 md:border-l-0 text-[#00ff00] px-4 py-4 focus:outline-none focus:bg-[#002a00] placeholder:text-[#005500] font-mono text-sm transition-colors rounded-none"
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
              />
              <button 
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="bg-[#00ff00] hover:bg-[#00cc00] text-black px-8 py-4 font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none mt-2 md:mt-0"
              >
                {isEvaluating ? 'PROCESSING...' : 'EXECUTE'}
              </button>
           </div>

           <AnimatePresence>
             {result && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="overflow-hidden"
               >
                 <div className="bg-[#001000] border border-[#00ff00]/30 p-6 text-left mt-4 font-mono text-sm leading-relaxed text-[#00ff00] whitespace-pre-wrap relative">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00ff00]/50 animate-[scan_2s_linear_infinite]" />
                   {result}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>

         <div className="mt-8 pt-4 border-t border-[#00ff00]/30 text-[#008800] text-[10px] flex justify-between">
           <span>MOOSEGOOSE ACTUARIAL PROTOCOLS [V2.0]</span>
           <span>STATUS: ONLINE</span>
         </div>
      </div>
    </div>
  );
};


export default function ComputeHeroPage() {
  const [activeSection, setActiveSection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Intersection observer to track current active section
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && id.startsWith('variant-')) {
            setActiveSection(parseInt(id.split('-')[1]));
          }
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('[id^="variant-"]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-tour logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const next = activeSection >= 5 ? 1 : activeSection + 1;
        document.getElementById(`variant-${next}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSection]);

  const scrollToSection = (i: number) => {
    setIsPlaying(false);
    document.getElementById(`variant-${i}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 1, title: 'Receipt', subtitle: 'Itemized breakdown', icon: Terminal },
    { id: 2, title: 'Stacked', subtitle: 'Hardware volumes', icon: Box },
    { id: 3, title: 'Real Estate', subtitle: 'Global footprints', icon: Square },
    { id: 4, title: 'Galaxy', subtitle: '1 dot = 1 GFLOP', icon: Aperture },
    { id: 5, title: 'Telemetry', subtitle: 'Test your rig', icon: Activity },
  ];

  return (
    <main className="w-full h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-black relative">
      
      {/* Top Deck Navigation (Inspiration Image 1 Vibe) */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 md:pt-8 px-4 flex justify-center pointer-events-none">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-lg border border-[#27272a] rounded-full p-2 flex gap-1 md:gap-2 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full transition-all whitespace-nowrap min-w-max ${activeSection === item.id ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:bg-[#27272a] text-[#a1a1aa]'}`}
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
              <div className="text-left hidden md:block">
                <p className={`text-[10px] uppercase tracking-widest font-bold ${activeSection === item.id ? 'text-black/50' : 'text-[#71717a]'}`}>0{item.id} · {item.title}</p>
                <p className={`text-xs ${activeSection === item.id ? 'text-black font-semibold' : 'text-white'}`}>{item.subtitle}</p>
              </div>
              <div className="text-left block md:hidden">
                 <p className="text-xs font-bold">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Play/Pause Auto Tour Button */}
      <div className="fixed bottom-6 right-6 z-50">
         <button 
           onClick={() => setIsPlaying(!isPlaying)}
           className={`backdrop-blur-md rounded-full px-4 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-xl ${isPlaying ? 'bg-white text-black border border-white' : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'}`}
         >
           {isPlaying ? (
             <>
                <div className="flex gap-1 items-end h-3">
                  <div className="w-1 h-3 bg-black animate-[pulse_0.8s_ease-in-out_infinite]" />
                  <div className="w-1 h-2 bg-black animate-[pulse_1.2s_ease-in-out_infinite]" />
                  <div className="w-1 h-3 bg-black animate-[pulse_1.0s_ease-in-out_infinite]" />
                </div>
                Playing
             </>
           ) : (
             <>
               <Play className="w-3 h-3" /> Auto Tour
             </>
           )}
         </button>
      </div>
      
      <VariantReceipt />
      <VariantStack />
      <VariantRealEstate />
      <VariantGalaxy />
      <VariantTelemetry />
    </main>
  );
}

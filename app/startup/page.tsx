"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Network, Play, RefreshCw, Volume2, ShieldAlert, Aperture } from 'lucide-react';

/** 
 * SYNTHETIC SOUND ENGINE
 * Uses Web Audio API to procedurally generate sound effects without loading assets.
 * Must be initialized from a user interaction (click).
 */
class SyntheticAudioEngine {
  ctx: AudioContext | null = null;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Quick mechanical beep
  playBeep(freq: number = 800, duration: number = 0.05, type: OscillatorType = 'square', delay: number = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  // Harmonic chord chime (for modern sleek boot)
  playChime(frequencies: number[], duration: number = 3.0, delay: number = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    masterGain.connect(ctx.destination);

    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(masterGain);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
  }

  // Deep rumble / sub drop
  playSubDrop(duration: number = 2.0, delay: number = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + delay + duration);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + delay + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  // Data processing flutter (rapid changing freq)
  playDataFlutter(duration: number = 1.0, delay: number = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    
    // Create random-ish frequency steps (doing this procedurally to stay pure in React)
    let timeOffset = 0;
    while(timeOffset < duration) {
       // Using pseudo-random math mapping to time to keep purely mathematical
       const freq = 400 + (Math.sin(timeOffset * 1000) * Math.cos(timeOffset * 400) * 800);
       osc.frequency.setValueAtTime(Math.abs(freq), this.ctx.currentTime + delay + timeOffset);
       timeOffset += 0.05;
    }
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + delay + 0.05);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }
}

const engine = new SyntheticAudioEngine();

// --- Variant 1: BIOS Post Sequence ---
const BiosBoot = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const hasStarted = useRef(false);

  const bootSequence = useMemo(() => [
    "Moosegoose ACPI BIOS Revision 8.0.22",
    "Copyright (C) 2026, Moosegoose Consulting",
    "Main Processor : Threadripper 7985WX @ 5.1GHz",
    "Memory Testing : 262144M OK",
    "NVME Device 0  : 8TB PCIe 5.0 (Health: 100%)",
    "Initializing PCIe Lanes...",
    "Detecting GPUs... OK",
    "[0] RTX PRO 6000 Blackwell 48GB",
    "[1] RTX PRO 6000 Blackwell 48GB",
    "[2] RTX 5090 32GB",
    "[3] RTX 3090 24GB",
    "Verifying Cluster Tensor Allocations...",
    "Total TFLOPS (FP32) : 395.3",
    "WARNING: Power draw peaking 2,823 W",
    "Loading OS Kernel..."
  ], []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    engine.init();
    
    let delay = 0;
    bootSequence.forEach((line, i) => {
      delay += (i === 0 ? 500 : 150 + (i * 27 % 200)); // Pseudo-random spacing
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        engine.playBeep(1200 + (i%3)*200, 0.02, 'square'); // Clicky sounds
      }, delay);
    });

    setTimeout(() => {
      // Success double beep
      engine.playBeep(2000, 0.1, 'square');
      setTimeout(() => engine.playBeep(2400, 0.15, 'square'), 150);
    }, delay + 400);

    setTimeout(() => {
      onComplete();
    }, delay + 1200);

  }, [bootSequence, onComplete]);

  return (
    <div className="w-full h-full bg-black text-[#a3e635] font-mono text-sm p-8 flex flex-col justify-end">
      <div className="space-y-1">
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <span className="opacity-50 min-w-[60px] text-xs">[{((i+1)*0.013).toFixed(3)}]</span>
            <span>{l}</span>
          </motion.div>
        ))}
        {lines.length < bootSequence.length && (
          <div className="animate-pulse">_</div>
        )}
      </div>
    </div>
  );
};

// --- Variant 2: Neural Uplink (Cyberpunk) ---
const NeuralBoot = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [glitch, setGlitch] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    engine.init();
    engine.playSubDrop(4.0); // Ambient rumble starts
    
    let current = 0;
    const interval = setInterval(() => {
       current += 3;
       if (current >= 100) {
         current = 100;
         clearInterval(interval);
         // Final locked sound
         engine.playBeep(800, 0.1, 'sawtooth');
         engine.playBeep(1200, 0.3, 'sawtooth', 0.1);
         setTimeout(() => onComplete(), 1000);
       }
       setProgress(current);
       // Glitch string
       if (current % 12 === 0) {
         const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
         let g = "";
         for(let k=0; k<16; k++) g += chars.charAt(Math.floor((current * k * 7) % chars.length));
         setGlitch(g);
         engine.playDataFlutter(0.1);
       }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-[#050014] text-[#c084fc] font-sans p-8 flex flex-col items-center justify-center relative overflow-hidden">
       {/* Background ambient net */}
       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_#9333ea,_transparent_70%)]" />
       
       <motion.div 
         className="relative z-10 w-full max-w-xl border border-[#9333ea]/30 bg-black/50 p-8 backdrop-blur-md flex flex-col items-center"
         animate={{ x: [0, (progress%3===0 ? 2 : -2), 0] }}
         transition={{ duration: 0.1, repeat: Infinity }}
       >
         <ShieldAlert className="w-12 h-12 text-[#d8b4fe] mb-6" />
         <div className="text-xs font-bold tracking-[0.5em] text-[#d8b4fe] uppercase mb-4 text-center">
            Establishing Actuarial Neural Uplink
         </div>
         <div className="w-full h-2 bg-[#9333ea]/20 relative overflow-hidden mb-2">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#d8b4fe] shadow-[0_0_15px_#c084fc]"
              style={{ width: `${progress}%` }}
            />
         </div>
         <div className="flex justify-between w-full text-[10px] font-mono mt-2">
            <span className="text-[#9333ea]">{progress < 100 ? 'HANDSHAKE_PENDING' : 'LINK_ESTABLISHED'}</span>
            <span className="text-white">{progress}%</span>
         </div>
         <div className="mt-8 font-mono text-xs opacity-50 h-4 tracking-widest break-all text-center">
           {glitch}
         </div>
       </motion.div>
    </div>
  );
};


// --- Variant 3: Sleek Omni-OS (Corporate Modern) ---
const SleekBoot = ({ onComplete }: { onComplete: () => void }) => {
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    engine.init();
    
    // Play a beautiful major 7th chord chime fade in
    setTimeout(() => {
      engine.playChime([261.63, 329.63, 392.00, 493.88], 4.0); // C maj 7
    }, 1000);

    setTimeout(() => {
      onComplete();
    }, 4500);

  }, [onComplete]);

  return (
    <div className="w-full h-full bg-[#eceef2] flex items-center justify-center font-sans">
       <motion.div 
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
         className="flex flex-col items-center"
       >
          <div className="relative w-32 h-32 flex items-center justify-center">
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1.5, opacity: 0 }}
               transition={{ duration: 3, ease: 'easeOut', delay: 1 }}
               className="absolute w-full h-full bg-blue-500 rounded-full blur-xl"
             />
             <motion.div 
               initial={{ rotate: -90 }}
               animate={{ rotate: 0 }}
               transition={{ duration: 2, ease: "circOut", delay: 1 }}
               className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-xl flex items-center justify-center relative z-10 text-white"
             >
                <span className="font-bold text-xl drop-shadow-md">mg</span>
             </motion.div>
          </div>
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 2.5 }}
             className="mt-8 text-center"
          >
             <h3 className="text-slate-800 font-bold tracking-widest uppercase text-sm">Moosegoose Engine</h3>
             <p className="text-slate-400 text-xs mt-2">Computing topology recognized.</p>
          </motion.div>
       </motion.div>
    </div>
  );
};


// --- WORKSHOP WRAPPER ---
export default function StartupWorkshopPage() {
  const [activeVariant, setActiveVariant] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Before user clicks, we show a stage requiring interaction so Web Audio is unlocked
  
  const variants = [
    { id: 1, name: "UNIX BIOS POST", desc: "Retro command line boot. Harsh square sweeps.", icon: Terminal },
    { id: 2, name: "NEURAL UPLINK", desc: "Cyberpunk cluster activation. Glitch data noise.", icon: Network },
    { id: 3, name: "OMNI-OS", desc: "Sleek, modern AI startup. Harmonic chime sweep.", icon: Aperture }
  ];

  const handleStart = (id: number) => {
    setIsDone(false);
    setActiveVariant(id);
  };

  const reset = () => {
    setIsDone(false);
    setActiveVariant(null);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* Sidebar Controls */}
      <div className="w-80 bg-[#121212] border-r border-white/5 flex flex-col shrink-0">
         <div className="p-6 border-b border-white/5">
            <h1 className="text-lg font-bold">Boot Sequence Workshop</h1>
            <p className="text-[#a1a1aa] text-xs mt-2 leading-relaxed">
              Test environment for synthesized audio & visual loading states. Requires user click to unlock Web Audio API.
            </p>
         </div>

         <div className="p-4 space-y-2 flex-grow overflow-y-auto">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => handleStart(v.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${activeVariant === v.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-2 rounded-lg bg-black/50 border ${activeVariant === v.id ? 'border-emerald-500' : 'border-white/10'}`}>
                    <v.icon className={`w-4 h-4 ${activeVariant === v.id ? 'text-emerald-400' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{v.name}</h3>
                    <p className="text-[10px] text-[#71717a] mt-1">{v.desc}</p>
                  </div>
                </div>
              </button>
            ))}
         </div>

         <div className="p-6 border-t border-white/5 flex gap-2">
            <Volume2 className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs text-[#a1a1aa]">Procedural Synthesizer Enabled</span>
         </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 relative bg-black/50">
        
        {/* Waiting for selection logic */}
        <AnimatePresence mode="wait">
           {activeVariant === null ? (
              <motion.div 
                key="waiting"
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                 <Play className="w-16 h-16 text-white/20 mb-6" />
                 <h2 className="text-xl font-bold">Select a sequence to initiate</h2>
                 <p className="text-[#a1a1aa] text-sm mt-2">Browser security requires a click to begin audio synthesis.</p>
              </motion.div>
           ) : isDone ? (
              <motion.div 
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]"
              >
                 <Cpu className="w-16 h-16 text-emerald-500 mb-6" />
                 <h2 className="text-xl font-bold">System Online</h2>
                 <button 
                   onClick={() => handleStart(activeVariant)}
                   className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-bold tracking-widest uppercase"
                 >
                    <RefreshCw className="w-4 h-4" /> Replay Sequence
                 </button>
                 <button 
                   onClick={reset}
                   className="mt-4 text-xs text-[#a1a1aa] hover:text-white"
                 >
                   Return to Selection
                 </button>
              </motion.div>
           ) : (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                 {activeVariant === 1 && <BiosBoot onComplete={() => setIsDone(true)} />}
                 {activeVariant === 2 && <NeuralBoot onComplete={() => setIsDone(true)} />}
                 {activeVariant === 3 && <SleekBoot onComplete={() => setIsDone(true)} />}
              </motion.div>
           )}
        </AnimatePresence>
      </div>

    </div>
  );
}

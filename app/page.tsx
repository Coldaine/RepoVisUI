"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useSpring, useTransform, MotionConfig, useAnimationFrame } from 'motion/react';
import { MOCK_EXHIBITS, ExhibitArtifact, EXHIBIT_ICONS } from '@/lib/exhibits';
import { cn } from '@/lib/utils';
import { sounds } from '@/lib/audio';
import { 
  Terminal, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Cpu, 
  Activity, 
  Search,
  ArrowLeft,
  ScrollText,
  CheckCircle2,
  AlertTriangle,
  Target,
  Radar,
  Network,
  LayoutGrid,
  Sparkles,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  X,
  Copy,
  Server
} from 'lucide-react';
import Link from 'next/link';
import * as d3 from 'd3';
import { logger } from '@/lib/logger';

// Premium Easing Curves
const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT_PREMIUM = [0.65, 0, 0.35, 1] as const;
const SPRING_TACTILE = { type: "spring", stiffness: 400, damping: 25 } as const;
const SPRING_EXPAND = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };
const SPRING_QUICK = { type: "spring", stiffness: 500, damping: 40 } as const;
const SPRING_SMOOTH = { type: "spring", stiffness: 200, damping: 25 } as const;
const SPRING_MODAL_ITEM = { type: "spring", stiffness: 350, damping: 30 } as const;

// --- Sub-components for specific exhibit types ---

const ContextSubCard = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={SPRING_EXPAND}
          className="absolute top-4 right-4 bottom-4 w-80 bg-background-dark/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)' }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/50">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]" title={title}>{title}</h4>
              {subtitle && <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FocusDeep = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedContext, setSelectedContext] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 400;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Prepare nodes
    const centerNode = { id: data.center.name, type: 'center', radius: 30, ...data.center };
    const satelliteNodes = data.satellites.map((s: any) => ({
      id: s.name,
      type: 'satellite',
      radius: 6 + (s.coEditScore * 6),
      ...s
    }));
    
    const nodes = [centerNode, ...satelliteNodes];
    
    // Prepare links (center to satellites)
    const links = satelliteNodes.map((s: any) => ({
      source: centerNode.id,
      target: s.id,
      distance: 250 - (s.coEditScore * 180) // High score = small distance
    }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d: any) => d.distance))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 5))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Group for trails (rendered behind nodes)
    const trailGroup = svg.append("g").attr("class", "trails");

    // Custom force to make satellites orbit
    simulation.on("tick", () => {
      nodes.forEach(node => {
        if (node.type === 'satellite') {
          // Tangential force for orbit
          const dx = node.x - centerNode.x;
          const dy = node.y - centerNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            // Orbit speed proportional to coupling strength (0.5 to 2.0)
            const speed = 0.5 + (node.coEditScore * 1.5); 
            node.vx += (-dy / dist) * speed;
            node.vy += (dx / dist) * speed;
          }
          
          // Record history for trails
          node.history = node.history || [];
          node.history.push({x: node.x, y: node.y});
          if (node.history.length > 30) node.history.shift();
        } else {
            // Keep center strictly in the middle
            node.x = width / 2;
            node.y = height / 2;
        }
      });

      // Draw trails
      const trailData = nodes.filter(n => n.type === 'satellite' && n.history && n.history.length > 1);
      
      trailGroup.selectAll("path")
        .data(trailData, (d: any) => d.id)
        .join("path")
        .attr("d", (d: any) => {
           const line = d3.line<any>().x(p => p.x).y(p => p.y).curve(d3.curveBasis);
           return line(d.history);
        })
        .attr("fill", "none")
        .attr("stroke", (d: any) => {
           const intensity = Math.floor(d.coEditScore * 255);
           return `rgba(0, ${intensity}, 255, 0.3)`;
        })
        .attr("stroke-width", 2)
        .style("opacity", 0.6);

      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const link = svg.append("g")
      .attr("stroke", "rgba(0, 229, 255, 0.1)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(links)
      .join("line");

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on("mouseenter", (event, d) => {
        sounds.tick();
        if (d.type === 'satellite') {
          setHoveredNode(d);
        }
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        sounds.blip();
        setSelectedContext(d);
      });

    // Center node pulsing circle
    nodeGroup.filter((d: any) => d.type === 'center')
      .append("circle")
      .attr("r", (d: any) => d.radius)
      .attr("fill", "rgba(0, 229, 255, 0.1)")
      .attr("stroke", "rgba(0, 229, 255, 0.8)")
      .attr("stroke-width", 2)
      .style("animation", `pulse ${2 / Math.max(1, data.center.commitFrequency)}s infinite alternate`);

    // Center node text
    nodeGroup.filter((d: any) => d.type === 'center')
      .append("text")
      .text((d: any) => d.name.split('/').pop())
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("pointer-events", "none");

    // Satellite nodes
    nodeGroup.filter((d: any) => d.type === 'satellite')
      .append("circle")
      .attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => {
        // Color based on coEditScore (from blue to bright cyan)
        const intensity = Math.floor(d.coEditScore * 255);
        return `rgb(0, ${intensity}, 255)`;
      })
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1);

    // Add CSS for pulsing
    const styleId = 'focus-deep-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            100% { transform: scale(1.05); opacity: 1; }
        }
        `;
        document.head.appendChild(style);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden" style={{ background: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%)' }}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" />
      
      <AnimatePresence>
        {hoveredNode ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 0.9, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            whileHover={{ scale: 1.02, opacity: 1 }}
            transition={SPRING_MODAL_ITEM}
            className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/detail"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-50 bg-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Gravitational Node
            </h4>
            <h5 className="text-xs font-bold text-white mb-2 font-mono truncate">{hoveredNode.name}</h5>
            
            <div className="flex justify-between items-end mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Coupling Score</span>
              <span className="text-primary font-mono text-xl font-bold">{(hoveredNode.coEditScore * 100).toFixed(0)}%</span>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Recent Traces</div>
              {hoveredNode.logEntries.slice(0, 3).map((log: string, i: number) => (
                <div key={i} className="text-[10px] font-mono text-white/70 leading-tight flex gap-2">
                  <span className="text-primary/40">[{i+1}]</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-8 text-white/50 font-mono text-xs uppercase tracking-widest pointer-events-none"
          >
            {data.satellites.length} files orbiting, {data.satellites.filter((s:any) => s.coEditScore > 0.8).length} tightly coupled.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Sub-Card for Progressive Disclosure */}
      <ContextSubCard
        isOpen={!!selectedContext}
        onClose={() => setSelectedContext(null)}
        title={selectedContext?.id || "Node Context"}
        subtitle={selectedContext?.type === 'center' ? "Archstone Node" : "Satellite Dependency"}
      >
        {selectedContext && (
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted mb-2 border-b border-white/5 pb-1">Vitals</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-white/5 p-3 rounded-lg">
                  <div className="text-[10px] text-muted mb-1">Co-Edit Score</div>
                  <div className="text-lg font-mono text-primary animate-pulse">{selectedContext.coEditScore ? (selectedContext.coEditScore * 100).toFixed(1) : 'N/A'}%</div>
                </div>
                <div className="bg-surface border border-white/5 p-3 rounded-lg">
                  <div className="text-[10px] text-muted mb-1">Commits</div>
                  <div className="text-lg font-mono text-white">{selectedContext.commitFrequency || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            {selectedContext.logEntries && selectedContext.logEntries.length > 0 && (
              <div>
                <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted mb-2 border-b border-white/5 pb-1">Commit Traces</h5>
                <ul className="space-y-2">
                  {selectedContext.logEntries.map((log: string, idx: number) => (
                    <li key={idx} className="text-xs text-white/80 bg-white/5 p-2 rounded line-clamp-2 border-l-2 border-primary/50 relative">
                     <span className="text-[9px] text-muted font-mono absolute -top-1.5 -right-1.5 bg-background-dark px-1 rounded-sm border border-white/10">#{idx+1}</span>
                     {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </ContextSubCard>
    </div>
  );
};

const DriftDeep = ({ data }: { data: any }) => (
  <div className="relative w-full min-h-[500px] flex flex-col justify-between overflow-hidden p-6 gap-8">
    
    {/* Ambient background grid / fault line */}
    <div className="absolute inset-0 pointer-events-none opacity-20">
       <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-error to-transparent rotate-[15deg] scale-150 origin-center mix-blend-screen" />
       <div className="absolute top-0 bottom-0 left-[48%] w-px bg-error/30 -rotate-[5deg] scale-150 origin-center blur-[2px]" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 flex-1 items-center">
      
      {/* Baseline (Left) */}
      <motion.div 
        initial={{ opacity: 0, x: -50, rotateY: 10 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ delay: 0.1, ...SPRING_EXPAND }}
        className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] relative group overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <ScrollText className="w-5 h-5 text-muted" />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Baseline Policy</h4>
            <div className="text-sm font-mono text-white/50">{data.sourceFile || "DOCUMENTATION"}</div>
          </div>
        </div>
        <p className="text-base font-mono text-white/90 leading-relaxed italic border-l-2 border-white/20 pl-4 py-2">
          &quot;{data.docSnippet}&quot;
        </p>
      </motion.div>

      {/* Violation (Right) */}
      <motion.div 
        initial={{ opacity: 0, x: 50, rotateY: -10 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ delay: 0.2, ...SPRING_EXPAND }}
        className="bg-error/5 backdrop-blur-xl p-8 rounded-2xl border border-error/30 shadow-[0_20px_40px_rgba(255,51,102,0.1),inset_0_1px_1px_rgba(255,51,102,0.2)] relative group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-error" />
        
        {/* Fake "glitch" elements */}
        <motion.div 
           animate={{ opacity: [0, 1, 0, 0.5, 0] }}
           transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'anticipate' }}
           className="absolute -inset-1 bg-error/10 mix-blend-overlay pointer-events-none"
        />

        <div className="flex items-center gap-3 mb-6 border-b border-error/10 pb-4 relative z-10">
          <Terminal className="w-5 h-5 text-error animate-pulse" />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-error">Current State</h4>
            <div className="text-sm font-mono text-error/60">{data.targetFile || "IMPLEMENTATION"}</div>
          </div>
        </div>
        <div className="bg-background-dark/80 rounded-lg p-4 font-mono text-xs text-error shadow-inner border border-error/10 relative z-10 overflow-x-auto custom-scrollbar">
          <code>
            {data.codeSnippet.split('\n').map((line: string, i: number) => (
              <div key={i} className="flex hover:bg-error/10 transition-colors">
                <span className="w-6 shrink-0 text-error/30 select-none">{i + 1}</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </div>
      </motion.div>

    </div>

    {/* Center diagnostic connector */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-20">
       <motion.div 
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ delay: 0.4, type: 'spring', bounce: 0.6 }}
         className="w-12 h-12 rounded-full bg-background-dark border-2 border-error flex items-center justify-center shadow-[0_0_30px_rgba(255,51,102,0.5)]"
       >
         <Zap className="w-5 h-5 text-error" />
       </motion.div>
       <motion.div 
         initial={{ height: 0, opacity: 0 }}
         animate={{ height: 60, opacity: 1 }}
         transition={{ delay: 0.6 }}
         className="w-px bg-error/50 my-2" 
       />
       <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.8 }}
         className="bg-error/10 border border-error/30 text-error px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase backdrop-blur-md"
       >
         Sync Gap Detected
       </motion.div>
    </div>

    <div className="relative z-20 flex justify-end">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-8 py-4 bg-error text-background-dark font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-error/90 transition-colors shadow-[0_0_20px_rgba(255,51,102,0.3)] flex items-center gap-2"
        onClick={() => sounds.blip()}
      >
        <span>Enforce Baseline</span>
        <ArrowLeft className="w-4 h-4" />
      </motion.button>
    </div>
  </div>
);

const RelationshipsDeep = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define arrow markers for links
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "rgba(255,255,255,0.3)")
      .style("stroke", "none");

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => (d.significance || 5) * 3 + 10));

    // Draw links as curved paths
    const link = svg.append("g")
      .selectAll("path")
      .data(data.links)
      .join("path")
      .attr("stroke", "rgba(255, 255, 255, 0.15)")
      .attr("stroke-width", (d: any) => d.strength || 1)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)")
      .style("transition", "opacity 0.3s ease");

    // Animated dots flowing along paths
    const flowDots = svg.append("g")
      .selectAll("circle")
      .data(data.links)
      .join("circle")
      .attr("r", 2)
      .attr("fill", "#fff")
      .style("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.8))")
      .style("transition", "opacity 0.3s ease");

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .style("transition", "opacity 0.3s ease")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseenter", (event: any, d: any) => {
        setHoveredNode(d);
        
        // Find connected node IDs
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        data.links.forEach((l: any) => {
          if (l.source.id === d.id) connectedNodeIds.add(l.target.id);
          if (l.target.id === d.id) connectedNodeIds.add(l.source.id);
        });

        // Dim non-connected nodes and scale up connected ones
        node.style("opacity", (n: any) => connectedNodeIds.has(n.id) ? 1 : 0.15);
        node.select(".inner-node").style("transform", (n: any) => connectedNodeIds.has(n.id) ? "scale(1.3)" : "scale(1)");

        // Dim non-connected links
        link.style("opacity", (l: any) => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.05);
        flowDots.style("opacity", (l: any) => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0);
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        
        // Restore all nodes and links
        node.style("opacity", 1);
        node.select(".inner-node").style("transform", "scale(1)");
        link.style("opacity", 1);
        flowDots.style("opacity", 1);
      });

    // Inner group for scaling
    const innerNode = node.append("g")
      .attr("class", "inner-node")
      .style("transition", "transform 0.3s ease")
      .style("transform-origin", "0 0");

    // Draw different shapes based on node type
    innerNode.each(function(d: any) {
      const g = d3.select(this);
      const size = (d.significance || 5) * 3;
      const color = d.type === 'pr' ? "#f5a623" : d.type === 'issue' ? "#ff3366" : "#00e5ff";

      if (d.type === 'pr') {
        g.append("circle").attr("r", size).attr("fill", color);
      } else if (d.type === 'issue') {
        g.append("rect")
          .attr("width", size * 1.5)
          .attr("height", size * 1.5)
          .attr("x", -size * 0.75)
          .attr("y", -size * 0.75)
          .attr("transform", "rotate(45)")
          .attr("fill", color);
      } else {
        g.append("rect")
          .attr("width", size * 1.8)
          .attr("height", size * 1.2)
          .attr("x", -size * 0.9)
          .attr("y", -size * 0.6)
          .attr("rx", 4)
          .attr("fill", color);
      }
    });

    innerNode.append("text")
      .text((d: any) => d.id)
      .attr("dy", (d: any) => ((d.significance || 5) * 3) + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        if (len === 0) return `M${d.source.x},${d.source.y}`;

        // Midpoint
        const mx = (d.source.x + d.target.x) / 2;
        const my = (d.source.y + d.target.y) / 2;
        
        // Normal vector
        const nx = -dy / len;
        const ny = dx / len;
        
        // Curvature based on time (older = more curved)
        const timeFactor = d.time || 20; 
        const curvature = timeFactor * 1.5;
        
        // Control point
        const cx = mx + nx * curvature;
        const cy = my + ny * curvature;
        
        return `M${d.source.x},${d.source.y} Q${cx},${cy} ${d.target.x},${d.target.y}`;
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Animate flow dots
    let t = 0;
    let animationFrameId: number;
    const animateFlow = () => {
      t += 0.01;
      flowDots.attr("transform", function(d: any, i: number) {
        // Find the corresponding path element
        const pathNode = link.nodes()[i] as SVGPathElement;
        if (!pathNode || !pathNode.getTotalLength) return "";
        const length = pathNode.getTotalLength();
        if (length === 0) return "";
        // Speed based on strength
        const speed = (d.strength || 1) * 0.5;
        const p = pathNode.getPointAtLength((t * speed * length) % length);
        return `translate(${p.x},${p.y})`;
      });
      animationFrameId = requestAnimationFrame(animateFlow);
    };
    animateFlow();

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
      cancelAnimationFrame(animationFrameId);
    };
  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden bg-background-dark/80 border border-muted/10">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      
      {/* Legend */}
      <div className="absolute top-8 left-8 flex flex-col gap-3 bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f5a623]" />
          <span className="text-xs font-mono text-muted">Pull Request</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rotate-45 bg-[#ff3366]" />
          <span className="text-xs font-mono text-muted">Issue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm bg-[#00e5ff]" />
          <span className="text-xs font-mono text-muted">File/Struct</span>
        </div>
      </div>

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 0.9, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            whileHover={{ scale: 1.02, opacity: 1 }}
            transition={SPRING_MODAL_ITEM}
            className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/detail"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-50 bg-accent" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 flex items-center gap-2">
              <Network className="w-3.5 h-3.5" /> Relation Logic
            </h4>
            <h5 className="text-xs font-bold text-white mb-1 font-mono truncate">{hoveredNode.id}</h5>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted mb-4 font-black">{hoveredNode.type}</div>
            
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">Significance</span>
              <span className="text-accent font-mono font-bold">{(hoveredNode.significance || 5) * 10}</span>
            </div>
            <p className="mt-4 text-[10px] text-white/50 font-mono leading-relaxed italic">
              Connections: {data.links.filter((l:any) => l.source.id === hoveredNode.id || l.target.id === hoveredNode.id).length} Active
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Annotations */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-8 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ delay: 1 }}
          className="max-w-[180px]"
        >
          <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Temporal Curvature</div>
          <p className="text-[10px] text-white/60 leading-tight">Arcs represent time since last interaction. Deeper curves indicate older relationships.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ delay: 1.5 }}
          className="max-w-[180px]"
        >
          <div className="text-[9px] font-black uppercase tracking-widest text-accent mb-1">Flow Direction</div>
          <p className="text-[10px] text-white/60 leading-tight">Animated pulses indicate the direction of dependency or resolution flow.</p>
        </motion.div>
      </div>
    </div>
  );
};

const TimelineDeep = ({ data }: { data: any }) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <div className="relative w-full h-full min-h-[400px] flex gap-12">
      <div className="space-y-6 relative pl-8 flex-1">
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-accent to-transparent" />
        {data.events.map((e: any, i: number) => (
          <motion.div 
            key={e.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_SMOOTH, delay: i * 0.1 }}
            className="relative cursor-pointer group"
            onClick={() => { sounds.blip(); setSelectedEvent(e); }}
          >
            <div className={cn(
              "absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 z-10 transition-colors",
              selectedEvent?.id === e.id ? "bg-primary border-white" : "bg-background-dark border-primary group-hover:bg-primary/20"
            )} />
            <div className={cn(
              "p-4 rounded-xl border transition-all duration-300",
              selectedEvent?.id === e.id ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(0,229,255,0.1)] scale-[1.02]" : "bg-surface border-muted/10 hover:border-primary/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">{e.type}</span>
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                  e.impact === 'high' ? "bg-error/20 text-error" : 
                  e.impact === 'medium' ? "bg-warning/20 text-warning" : "bg-accent/20 text-accent"
                )}>
                  {e.impact} Impact
                </span>
              </div>
              <h5 className="text-sm font-bold text-text-main">{e.title}</h5>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progressive Disclosure SubCard inside the layout flow */}
      <ContextSubCard
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Timeline Sequence"}
        subtitle={`${selectedEvent?.type} • ${selectedEvent?.impact} Impact`}
      >
        {selectedEvent && (
          <div className="space-y-6">
            <p className="text-xs text-white/80 leading-relaxed">
              {selectedEvent.description || "This event was pulled from chronological anomaly logs. Extensive metrics tracking is currently hidden to preserve top-level view clarity."}
            </p>
            <div className="bg-black/50 rounded-lg p-4 border border-white/5 font-mono text-[10px] text-green-400/80">
               {`> EXECUTING QUERY...\n> RECOVERING TRACE LOGS...\n> SYS ID: ${selectedEvent.id}\n> STATUS: NOMINAL`}
            </div>
            {selectedEvent.impact === "high" && (
              <div className="text-[9px] uppercase tracking-[0.2em] text-error font-black border border-error/20 bg-error/5 p-2 rounded text-center">
                Requires Secondary Verification
              </div>
            )}
          </div>
        )}
      </ContextSubCard>
    </div>
  );
};

const ChurnDeep = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.children) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create hierarchy and treemap layout
    const root = d3.hierarchy(data)
      .sum((d: any) => d.size)
      .sort((a: any, b: any) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    // Color scale for thermal effect (blue -> yellow -> red -> white)
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, 1]);

    const cell = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (d: any) => colorScale(d.data.temp))
      .attr("stroke", "rgba(0,0,0,0.5)")
      .attr("stroke-width", 1)
      .on("mouseenter", (event, d) => setHoveredCell(d.data))
      .on("mouseleave", () => setHoveredCell(null));

    // Add labels for larger cells
    cell.append("text")
      .filter((d: any) => (d.x1 - d.x0) > 50 && (d.y1 - d.y0) > 20)
      .attr("x", 4)
      .attr("y", 14)
      .text((d: any) => d.data.name)
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("fill", (d: any) => d.data.temp > 0.7 ? "#000" : "#fff")
      .style("pointer-events", "none");

    // Add subtle pulsing to hot cells
    const hotCells = cell.filter((d: any) => d.data.temp > 0.8).select("rect");
    
    const pulse = () => {
      hotCells.transition()
        .duration(1000)
        .attr("fill", (d: any) => d3.color(colorScale(d.data.temp))?.brighter(0.5).toString() || "#fff")
        .transition()
        .duration(1000)
        .attr("fill", (d: any) => colorScale(d.data.temp))
        .on("end", pulse);
    };
    pulse();

  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden bg-background-dark/80 border border-muted/10">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      
      {/* Legend */}
      <div className="absolute top-8 left-8 flex flex-col gap-2 bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">Churn Temp</span>
        <div className="w-32 h-3 rounded bg-gradient-to-r from-[#000004] via-[#bc3754] to-[#fcffa4]" />
        <div className="flex justify-between text-[8px] font-mono text-muted">
          <span>Cold</span>
          <span>Hot</span>
        </div>
      </div>

      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 0.9, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            whileHover={{ scale: 1.02, opacity: 1 }}
            transition={SPRING_MODAL_ITEM}
            className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/detail"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-50 bg-error" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-error mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Churn Hotspot
            </h4>
            <h5 className="text-xs font-bold text-white mb-1 font-mono truncate">{hoveredCell.name}</h5>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted mb-4 font-black">{hoveredCell.type}</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                <span className="text-muted">Stability Index</span>
                <span className={cn("font-bold", hoveredCell.temp > 0.8 ? "text-error" : "text-primary")}>{(1 - hoveredCell.temp).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                <span className="text-muted">Commits (Recent)</span>
                <span className="text-white font-bold">{hoveredCell.commits}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                <span className="text-muted">Primary Author</span>
                <span className="text-primary truncate ml-2">{hoveredCell.author.split('@')[0]}</span>
              </div>
            </div>
            <div className="mt-4 p-2 bg-error/10 border border-error/20 rounded text-[9px] text-error font-bold uppercase tracking-widest text-center">
              Re-Review Recommended
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SnapshotDeep = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredModule, setHoveredModule] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define grid layout for modules
    const cols = 2;
    const padding = 60;
    const blockWidth = (width - padding * (cols + 1)) / cols;
    const blockHeight = 150;

    const modules = data.modules.map((m: any, i: number) => ({
      ...m,
      x: padding + (i % cols) * (blockWidth + padding),
      y: padding + Math.floor(i / cols) * (blockHeight + padding),
      width: blockWidth,
      height: blockHeight
    }));

    // Draw grid background
    const gridGroup = svg.append("g").attr("class", "grid-lines");
    for (let x = 0; x <= width; x += 40) {
      gridGroup.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", height).attr("stroke", "rgba(255,255,255,0.03)").attr("stroke-width", 1);
    }
    for (let y = 0; y <= height; y += 40) {
      gridGroup.append("line").attr("x1", 0).attr("y1", y).attr("x2", width).attr("y2", y).attr("stroke", "rgba(255,255,255,0.03)").attr("stroke-width", 1);
    }

    // Draw connections between modules (mocked for visual effect)
    const links = [
      { source: modules[0], target: modules[1] },
      { source: modules[0], target: modules[2] },
      { source: modules[1], target: modules[3] }
    ];

    const linkGen = d3.linkHorizontal()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    svg.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", (d: any) => {
        const sourcePoint = { x: d.source.x + d.source.width / 2, y: d.source.y + d.source.height / 2 };
        const targetPoint = { x: d.target.x + d.target.width / 2, y: d.target.y + d.target.height / 2 };
        return linkGen({ source: sourcePoint, target: targetPoint } as any);
      })
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 229, 255, 0.3)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("animation", "dash 20s linear infinite");

    // Add CSS for animated dashes and breathing
    const styleId = 'snapshot-deep-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        @keyframes dash {
            to { stroke-dashoffset: -1000; }
        }
        @keyframes breathe {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        `;
        document.head.appendChild(style);
    }

    // Draw modules
    const moduleGroup = svg.append("g")
      .selectAll("g")
      .data(modules)
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .on("mouseenter", (event, d) => setHoveredModule(d))
      .on("mouseleave", () => setHoveredModule(null));

    // Module background (breathing)
    moduleGroup.append("rect")
      .attr("width", (d: any) => d.width)
      .attr("height", (d: any) => d.height)
      .attr("fill", "rgba(20, 20, 25, 0.9)")
      .attr("stroke", (d: any) => d.churn === 'high' ? "rgba(255, 51, 102, 0.5)" : d.churn === 'medium' ? "rgba(245, 166, 35, 0.5)" : "rgba(0, 229, 255, 0.5)")
      .attr("stroke-width", 2)
      .attr("rx", 8)
      .style("transform-origin", (d: any) => `${d.width/2}px ${d.height/2}px`)
      .style("animation", (d: any) => d.churn === 'high' ? "breathe 2s infinite ease-in-out" : "none");

    // Module title
    moduleGroup.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .text((d: any) => d.name)
      .attr("fill", "#fff")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif");

    // Module details
    moduleGroup.append("text")
      .attr("x", 20)
      .attr("y", 60)
      .text((d: any) => `${d.files} Files`)
      .attr("fill", "rgba(255,255,255,0.6)")
      .attr("font-size", "12px")
      .attr("font-family", "monospace");

    // Health indicator
    moduleGroup.append("circle")
      .attr("cx", (d: any) => d.width - 30)
      .attr("cy", 30)
      .attr("r", 6)
      .attr("fill", (d: any) => d.churn === 'high' ? "#ff3366" : d.churn === 'medium' ? "#f5a623" : "#00e5ff");

  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden bg-[#0a0a0c] border border-muted/10">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      
      <div className="absolute top-8 left-8">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest">System Architecture Blueprint</h4>
      </div>

      <AnimatePresence>
        {hoveredModule && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 0.9, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            whileHover={{ scale: 1.02, opacity: 1 }}
            transition={SPRING_MODAL_ITEM}
            className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/detail"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-50 bg-mint" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffaa] mb-3 flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5" /> Module Blueprint
            </h4>
            <h5 className="text-xs font-bold text-white mb-1 font-mono truncate">{hoveredModule.name}</h5>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted mb-4 font-black">Architectural Tier</div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="text-[9px] text-muted mb-1 uppercase tracking-widest font-black">Files</div>
                <div className="text-lg font-mono text-white font-bold">{hoveredModule.files}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="text-[9px] text-muted mb-1 uppercase tracking-widest font-black">Activity</div>
                <div className={cn("text-lg font-mono font-bold uppercase", hoveredModule.churn === 'high' ? "text-error" : "text-[#00ffaa]")}>
                  {hoveredModule.churn}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DigestDeep = ({ data }: { data: any }) => (
  <div className="grid grid-cols-2 gap-4">
    {data.features.map((f: any, i: number) => (
      <div 
        key={f.title} 
        className={cn(
          "p-5 rounded-2xl border border-muted/10 flex flex-col justify-between",
          i === 0 ? "col-span-2 bg-primary/5 border-primary/20" : "bg-surface"
        )}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-bold text-text-main">{f.title}</h5>
            {f.status === 'done' && <CheckCircle2 className="w-4 h-4 text-accent" />}
          </div>
          <div className="h-1 w-full bg-background-dark rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${f.weight * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
        <span className="text-[9px] font-mono text-muted/60 uppercase tracking-widest mt-4">{f.status}</span>
      </div>
    ))}
  </div>
);

const ConventionDeep = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Mock data for migration flow
    const flowData = {
      nodes: [
        { id: "Manual Error Impl", group: "old" },
        { id: "thiserror Crate", group: "new" },
        { id: "src/db", group: "module" },
        { id: "src/api", group: "module" },
        { id: "src/core", group: "module" }
      ],
      links: [
        { source: "Manual Error Impl", target: "src/db", value: 20 },
        { source: "src/api", target: "thiserror Crate", value: 45 },
        { source: "src/core", target: "thiserror Crate", value: 35 }
      ]
    };

    // Simple custom Sankey-like layout since d3-sankey isn't standard
    const nodeWidth = 20;
    const nodePadding = 40;
    
    // Position nodes
    const nodes = flowData.nodes.map(n => {
      let x = 0, y = 0, height = 0;
      if (n.group === "old") { x = 50; y = 150; height = 100; }
      if (n.group === "new") { x = width - 50 - nodeWidth; y = 100; height = 200; }
      if (n.group === "module") {
        x = width / 2;
        if (n.id === "src/db") { y = 50; height = 60; }
        if (n.id === "src/api") { y = 150; height = 100; }
        if (n.id === "src/core") { y = 290; height = 80; }
      }
      return { ...n, x, y, width: nodeWidth, height };
    });

    // Draw links
    const linkGen = d3.linkHorizontal()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    svg.append("g")
      .selectAll("path")
      .data(flowData.links)
      .join("path")
      .attr("d", (d: any) => {
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return null;
        
        const sourcePoint = { x: sourceNode.x + sourceNode.width, y: sourceNode.y + sourceNode.height / 2 };
        const targetPoint = { x: targetNode.x, y: targetNode.y + targetNode.height / 2 };
        
        return linkGen({ source: sourcePoint, target: targetPoint } as any);
      })
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.source === "Manual Error Impl" ? "rgba(255, 51, 102, 0.3)" : "rgba(0, 229, 255, 0.3)")
      .attr("stroke-width", (d: any) => d.value)
      .style("opacity", 0.7);

    // Draw nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeGroup.append("rect")
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.group === "old" ? "#ff3366" : d.group === "new" ? "#00e5ff" : "#f5a623")
      .attr("rx", 4);

    nodeGroup.append("text")
      .attr("x", d => d.group === "new" ? -10 : d.width + 10)
      .attr("y", d => d.height / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.group === "new" ? "end" : "start")
      .text(d => d.id)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("font-family", "monospace");

  }, [data]);

  return (
    <div className="space-y-6">
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-background-dark/80 border border-muted/10">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" />
        <div className="absolute top-4 left-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Migration Flow</h4>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-error/5 p-6 rounded-2xl border border-error/20">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-error mb-4">Legacy Pattern</h5>
          <code className="text-[11px] font-mono text-error/80 block">{data.before}</code>
        </div>
        <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">Target Pattern</h5>
          <code className="text-[11px] font-mono text-accent/80 block">{data.after}</code>
        </div>
      </div>
    </div>
  );
};

const NextDeep = ({ data }: { data: any }) => {
  const [hoveredBlip, setHoveredBlip] = useState<any>(null);

  return (
    <div className="relative w-full h-[600px] bg-[#0a0a0c] rounded-xl overflow-hidden border border-muted/10 flex items-center justify-center">
      {/* Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((r) => (
          <div 
            key={r}
            className="absolute border border-primary/10 rounded-full"
            style={{ width: `${r * 100}%`, height: `${r * 100}%` }}
          />
        ))}
        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-primary/10" />
        <div className="absolute h-full w-[1px] bg-primary/10" />
      </div>

      {/* Radar Sweep */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full origin-center"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 229, 255, 0.2) 360deg)`
        }}
      />

      {/* Blips */}
      {data.blips.map((b: any, i: number) => {
        const angle = (i * 137.5) * (Math.PI / 180); // Golden angle distribution
        const radius = b.distance * 45; // Max 45% to keep within bounds
        const top = 50 + Math.sin(angle) * radius;
        const left = 50 + Math.cos(angle) * radius;

        return (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="absolute flex flex-col items-center gap-2 cursor-pointer group"
            style={{ top: `${top}%`, left: `${left}%` }}
            onMouseEnter={() => setHoveredBlip(b)}
            onMouseLeave={() => setHoveredBlip(null)}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(0,229,255,0.8)]" />
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="absolute inset-0 border border-primary rounded-full"
              />
            </div>
            <span className="text-[10px] font-mono text-text-main/80 whitespace-nowrap bg-background-dark/80 px-2 py-1 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              {b.title}
            </span>
          </motion.div>
        );
      })}

      {/* Detail Panel */}
      <AnimatePresence>
        {hoveredBlip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 0.9, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            whileHover={{ scale: 1.02, opacity: 1 }}
            transition={SPRING_MODAL_ITEM}
            className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/detail"
          >
            <div className="absolute top-0 left-0 w-1 h-full opacity-50 bg-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
              <Radar className="w-3.5 h-3.5" /> Forecast Blip
            </h4>
            <h5 className="text-xs font-bold text-white mb-1 font-mono truncate">{hoveredBlip.title}</h5>
            
            <div className="space-y-4 my-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted block mb-1 font-black">Urgency Vector</span>
                <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-primary shadow-[0_0_10px_rgba(0,229,255,0.5)]" style={{ width: `${(1 - hoveredBlip.distance) * 100}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed font-mono bg-white/5 p-3 rounded border border-white/5">
                Target established via predictive AST analysis. Distance factor indicates probable drift over the next 3 cycles.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-8">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <Radar className="w-4 h-4" /> Predictive Radar
        </h4>
      </div>
    </div>
  );
};

const DependencyDeep = ({ data }: { data: any }) => (
  <div className="space-y-4">
    {data.nodes.map((n: any, i: number) => (
      <motion.div 
        key={n.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SPRING_SMOOTH, delay: i * 0.1 }}
        className="flex items-center gap-4"
      >
        <div className={cn(
          "w-3 h-3 rounded-full",
          n.status === 'current' ? "bg-accent shadow-[0_0_10px_rgba(0,229,255,0.5)]" : 
          n.status === 'enabled' ? "bg-primary" : "bg-muted/20"
        )} />
        <div className="bg-surface p-4 rounded-xl border border-muted/10 flex-1 flex items-center justify-between">
          <span className="text-sm font-bold text-text-main">{n.name}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted">{n.status}</span>
        </div>
      </motion.div>
    ))}
  </div>
);

const ReleaseDeep = ({ data }: { data: any }) => (
  <div className="space-y-6">
    <div className="relative">
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20" />
      {data.highlights.map((h: any, i: number) => (
        <motion.div 
          key={h.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_SMOOTH, delay: i * 0.1 }}
          className="mb-8 last:mb-0"
        >
          <h5 className="text-md font-bold text-primary mb-2">{h.title}</h5>
          <p className="text-sm text-text-main/70 leading-relaxed">{h.description}</p>
        </motion.div>
      ))}
    </div>
    <button className="w-full py-4 bg-primary/10 border border-primary/40 text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-colors">
      View Full Changelog
    </button>
  </div>
);

const ProportionDeep = ({ data }: { data: any }) => {
  const filterPercentage = Math.round(((data?.droppedByFilter || 0) / Math.max(1, data?.totalIngested || 1)) * 100);
  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Knowledge Base Pipeline Ratio</h4>
          <p className="text-xs text-muted uppercase tracking-widest">{data?.totalIngested} Documents Processed</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-warning">{filterPercentage}%</div>
          <p className="text-[10px] text-muted uppercase tracking-widest">Rejection Rate</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="h-16 flex rounded-xl overflow-hidden bg-white/5 border border-white/10">
           <motion.div 
             initial={{ width: 0 }} 
             animate={{ width: `${100 - filterPercentage}%` }} 
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="h-full border-r relative overflow-hidden group flex items-center justify-center font-black text-xs"
             style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: 'rgba(0, 229, 255, 0.5)', color: '#00e5ff' }}
           >
              LLM INGEST
           </motion.div>
           <motion.div 
             initial={{ width: 0 }} 
             animate={{ width: `${filterPercentage}%` }} 
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="h-full border-l relative overflow-hidden group flex items-center justify-center font-black text-xs"
             style={{ backgroundColor: 'rgba(245, 166, 35, 0.2)', borderColor: 'rgba(245, 166, 35, 0.5)', color: '#f5a623' }}
           >
             STATIC BLOCK
           </motion.div>
        </div>
      </div>
    </div>
  );
};

const BarChartDeep = ({ data }: { data: any }) => (
  <div className="flex flex-col h-full space-y-6">
     {data?.workflows?.map((w: any, i: number) => {
       const wColor = w.mergeRate > 0.8 ? '#00ffaa' : w.mergeRate > 0.6 ? '#f5a623' : '#ff3366';
       return (
         <div key={w.name} className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
               <span className="text-white/80">{w.name}</span>
               <span style={{ color: wColor }}>{Math.round(w.mergeRate * 100)}% SUCCESS</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${w.mergeRate * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-r-full"
                  style={{ backgroundColor: wColor }}
               />
            </div>
         </div>
       );
     })}
  </div>
);

const PolicyBadgeDeep = ({ data }: { data: any }) => (
  <div className="flex flex-col items-center justify-center h-full gap-8 mt-8">
     <motion.div 
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-[4px] relative overflow-hidden ${data?.isSecure ? 'border-[#00ffaa] bg-[#00ffaa]/10' : 'border-[#ff3366] bg-[#ff3366]/10'}`}
       style={{ boxShadow: `0 0 50px ${data?.isSecure ? 'rgba(0,255,170,0.3)' : 'rgba(255,51,102,0.3)'}` }}
     >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        {data?.isSecure ? <CheckCircle2 className="w-16 h-16 text-[#00ffaa] relative z-10 mb-2" /> : <AlertTriangle className="w-16 h-16 text-[#ff3366] relative z-10 mb-2" />}
        <span className="relative z-10 font-bold text-white tracking-widest text-lg">{data?.isSecure ? 'SECURE' : 'BREACH'}</span>
     </motion.div>
     
     <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-xs shadow-2xl">
        <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
           <span className="text-muted">Current Posture</span>
           <span className="text-white text-right">{data?.posture}</span>
        </div>
        <div className="flex justify-between">
           <span className="text-muted">Last Scanned</span>
           <span className="text-white">Just now</span>
        </div>
     </div>
  </div>
);

const TimelineLogDeep = ({ data }: { data: any }) => (
  <div className="flex flex-col gap-4 relative pl-8">
     <div className="absolute left-[8px] top-4 bottom-4 w-[2px] bg-white/10" />
     {data?.events?.map((ev: any, i: number) => {
       const eColor = ev.impact === 'high' ? '#ff3366' : ev.impact === 'medium' ? '#f5a623' : '#00e5ff';
       return (
         <motion.div 
           key={i} 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: i * 0.1 }}
           className="relative bg-white/5 rounded-xl border border-white/10 p-4"
         >
            <div 
              className="absolute -left-[32px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#0d0d14]"
              style={{ backgroundColor: eColor }}
            />
            <div className="flex justify-between items-start mb-2">
               <h4 className="text-sm font-bold text-white">{ev.action}</h4>
               <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: `${eColor}30`, color: eColor }}>+ {ev.intervalHours}h</span>
            </div>
            <p className="text-xs text-muted">Interval chronologically logged with precision backoff.</p>
         </motion.div>
       )
     })}
  </div>
);

const NetworkStableDeep = ({ data }: { data: any }) => (
  <div className="relative w-full h-[400px] bg-black/20 border border-white/10 rounded-xl overflow-hidden p-4">
     <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {data?.links?.map((link: any, i: number) => {
           const source = data?.nodes?.find((n:any) => n.id === link.source);
           const target = data?.nodes?.find((n:any) => n.id === link.target);
           if (!source || !target) return null;
           return (
             <motion.line 
               key={i}
               initial={{ strokeDasharray: 100, strokeDashoffset: 100 }}
               animate={{ strokeDashoffset: 0 }}
               transition={{ duration: 1.5 }}
               x1={`${source.x * 100}%`} y1={`${source.y * 100}%`} 
               x2={`${target.x * 100}%`} y2={`${target.y * 100}%`}
               stroke="rgba(255,255,255,0.15)" strokeWidth="1"
             />
           )
        })}
        {data?.nodes?.map((n:any, i: number) => (
           <motion.circle
             key={n.id}
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.5 + (i * 0.05), type: 'spring' }}
             cx={`${n.x * 100}%`} cy={`${n.y * 100}%`}
             r={n.status === 'core' ? 8 : 4}
             fill={n.status === 'core' ? '#b000ff' : '#00e5ff'}
           />
        ))}
     </svg>
     <div className="absolute bottom-4 left-4 right-4 flex justify-around p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] uppercase tracking-widest text-muted">
       <span>Topology Enforced</span>
       <span>Nodes: {data?.nodes?.length}</span>
       <span>Edges: {data?.links?.length}</span>
     </div>
  </div>
);

// --- Main Exhibit Component ---

const TYPE_COLORS: Record<string, string> = {
  focus: '#00e5ff', // Cyan
  drift: '#ff0055', // Neon Pink
  relationships: '#b000ff', // Purple
  timeline: '#ffaa00', // Amber
  churn: '#ff3300', // Orange
  snapshot: '#00ffaa', // Mint
  digest: '#0088ff', // Blue
  convention: '#ffff00', // Yellow
  next: '#ff00ff', // Magenta
  dependency: '#00ff00', // Green
  release: '#ffffff', // White
  proportion: '#00e5ff',
  'bar-chart': '#ffaa00',
  'policy-badge': '#00ffaa',
  'timeline-log': '#ff00ff',
  'network-stable': '#b000ff',
};

// Extract top 3 metrics from artifact data for the macro view strip
const extractMetrics = (type: string, data: any): { label: string; value: string | number; state?: 'neutral'|'warning'|'critical' }[] => {
  switch (type) {
    case 'proportion': return [
      { label: 'Ingested', value: data?.totalIngested || 0, state: 'neutral' },
      { label: 'Dropped', value: data?.droppedByFilter || 0, state: 'warning' },
      { label: 'Filter %', value: Math.round(((data?.droppedByFilter || 0) / Math.max(1, data?.totalIngested || 1)) * 100) + '%', state: 'critical' }
    ];
    case 'bar-chart': {
      const avgMerge = (data?.workflows?.reduce((sum:number, w:any) => sum + w.mergeRate, 0) / Math.max(1, data?.workflows?.length || 1));
      const lowestMerge = Math.min(...(data?.workflows?.map((w:any) => w.mergeRate) || [0]));
      return [
        { label: 'Workflows', value: data?.workflows?.length || 0, state: 'neutral' },
        { label: 'Avg Merge', value: Math.round(avgMerge * 100) + '%', state: avgMerge < 0.7 ? 'warning' : 'neutral' },
        { label: 'Lowest', value: Math.round(lowestMerge * 100) + '%', state: lowestMerge < 0.5 ? 'critical' : 'warning' }
      ];
    }
    case 'policy-badge': return [
      { label: 'State', value: data?.isSecure ? 'SECURE' : 'AT RISK', state: data?.isSecure ? 'neutral' : 'critical' },
      { label: 'Posture', value: data?.posture || 'Unknown', state: 'neutral' },
      { label: 'Mode', value: 'Strict', state: 'neutral' }
    ];
    case 'timeline-log': return [
      { label: 'Tasks', value: data?.events?.length || 0, state: 'neutral' },
      { label: 'Min Intvl', value: (data?.events?.[0]?.intervalHours || 0) + 'h', state: 'neutral' },
      { label: 'Max Intvl', value: (data?.events?.[data?.events?.length-1]?.intervalHours || 0) + 'h', state: (data?.events?.[data?.events?.length-1]?.intervalHours > 24) ? 'warning' : 'neutral' }
    ];
    case 'network-stable': return [
      { label: 'Nodes', value: data?.nodes?.length || 0 },
      { label: 'Links', value: data?.links?.length || 0 },
      { label: 'Status', value: 'Stable' }
    ];
    case 'focus': return [
      { label: 'Commits', value: data?.center?.commitFrequency || 0 },
      { label: 'Coupled', value: data?.satellites?.length || 0 },
      { label: 'MaxScore', value: data?.satellites?.[0]?.coEditScore?.toFixed(2) || '0.0' }
    ];
    case 'drift': return [
      { label: 'Severity', value: data?.severity?.toUpperCase() || 'N/A' },
      { label: 'Doc Len', value: data?.docSnippet?.length || 0 },
      { label: 'Code Len', value: data?.codeSnippet?.length || 0 }
    ];
    case 'relationships': return [
      { label: 'Nodes', value: data?.nodes?.length || 0 },
      { label: 'Links', value: data?.links?.length || 0 },
      { label: 'Max Sig', value: Math.max(...(data?.nodes?.map((n:any) => n.significance) || [0])) }
    ];
    case 'timeline': return [
      { label: 'Events', value: data?.events?.length || 0 },
      { label: 'High Impact', value: data?.events?.filter((e:any) => e.impact==='high').length || 0 },
      { label: 'Latest', value: data?.events?.[data?.events?.length-1]?.impact?.substring(0,3).toUpperCase() || 'N/A' }
    ];
    case 'churn': return [
      { label: 'Hot files', value: data?.children?.length || 0 },
      { label: 'Top Temp', value: data?.children?.[0]?.temp?.toFixed(2) || '0.0' },
      { label: 'Total C.', value: data?.children?.reduce((sum:number, c:any) => sum + (c.commits || 0), 0) || 0 }
    ];
    case 'snapshot': return [
      { label: 'Modules', value: data?.modules?.length || 0 },
      { label: 'Total Files', value: data?.modules?.reduce((sum:number, m:any) => sum + (m.files || 0), 0) || 0 },
      { label: 'Top Churn', value: data?.modules?.[0]?.churn?.toUpperCase() || 'N/A' }
    ];
    case 'digest': return [
      { label: 'Features', value: data?.features?.length || 0 },
      { label: 'Done', value: data?.features?.filter((f:any) => f.status==='done').length || 0 },
      { label: 'Max Wt', value: Math.max(...(data?.features?.map((f:any) => f.weight) || [0])).toFixed(1) }
    ];
    case 'convention': return [
      { label: 'Pattern', value: data?.pattern?.substring(0,8) || '' },
      { label: 'Old Vol', value: data?.before?.length || 0 },
      { label: 'New Vol', value: data?.after?.length || 0 }
    ];
    case 'next': return [
      { label: 'Blips', value: data?.blips?.length || 0 },
      { label: 'Closest', value: Math.min(...(data?.blips?.map((b:any) => b.distance) || [0])).toFixed(2) },
      { label: 'Furthest', value: Math.max(...(data?.blips?.map((b:any) => b.distance) || [0])).toFixed(2) }
    ];
    case 'dependency': return [
      { label: 'Nodes', value: data?.nodes?.length || 0 },
      { label: 'Legacy', value: data?.nodes?.filter((n:any) => n.status==='legacy').length || 0 },
      { label: 'Current', value: data?.nodes?.filter((n:any) => n.status==='current').length || 0 }
    ];
    case 'release': return [
      { label: 'Highlights', value: data?.highlights?.length || 0 },
      { label: 'v1.0 Size', value: data?.highlights?.[0]?.description?.length || 0 },
      { label: 'Total Vol', value: data?.highlights?.reduce((s:number, h:any) => s + (h.description?.length||0), 0) || 0 }
    ];
    default: return [
      { label: 'Status', value: 'Active' },
      { label: 'Ping', value: '12ms' },
      { label: 'Load', value: '14%' }
    ];
  }
};

const MiniVis = ({ type, color, data, id }: { type: string, color: string, data: any, id: string }) => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useAnimationFrame((t) => {
    if (type !== 'snapshot' && type !== 'convention') return;
    setTime(t / 1000);
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) return null;

  if (type === 'proportion') {
    // This chart answers the question: Of all documents ingested, what % were dropped by the static filter?
    const total = Math.max(1, data?.totalIngested || 1);
    const droppedPct = ((data?.droppedByFilter || 0) / total) * 100;
    const llmPct = 100 - droppedPct;
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 opacity-90 mix-blend-screen">
        <div className="w-full h-8 flex overflow-hidden rounded-md border border-white/10" title={`Dropped: ${droppedPct.toFixed(1)}%, Sent to LLM: ${llmPct.toFixed(1)}%`}>
          <div className="h-full bg-white/20 flex items-center justify-start px-2 overflow-hidden transition-all duration-1000" style={{ width: `${droppedPct}%` }}>
            <span className="text-[10px] font-mono tracking-widest text-white/50 truncate">STATIC_FILTER:{Math.round(droppedPct)}%</span>
          </div>
          <div className="h-full border-l border-white/20 flex items-center justify-end px-2 overflow-hidden transition-all duration-1000" style={{ width: `${llmPct}%`, backgroundColor: color }}>
            <span className="text-[10px] font-mono tracking-widest text-black/80 font-bold truncate">{Math.round(llmPct)}%:LLM_CALL</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'bar-chart') {
    // This chart answers the question: What is the merge rate for each automated workflow?
    const workflows = data?.workflows || [];
    return (
      <div className="absolute inset-0 flex items-end justify-center gap-[4px] p-4 pb-0 opacity-90 mix-blend-screen">
        {workflows.map((w: any, idx: number) => {
          const heightPct = Math.max(5, (w.mergeRate || 0) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end group cursor-crosshair">
              <div 
                className="w-full rounded-t-[2px] transition-all duration-500 relative" 
                style={{ height: `${heightPct}%`, backgroundColor: color }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded" style={{ color }}>
                  {Math.round((w.mergeRate || 0) * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'policy-badge') {
    // This chart answers the question: Is the Devcontainer running under a strict whitelist network policy?
    const isSecure = data?.isSecure || false;
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90 mix-blend-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${isSecure ? 'border-[#00ffaa] text-[#00ffaa] bg-[#00ffaa]/10' : 'border-[#ff0055] text-[#ff0055] bg-[#ff0055]/10'}`}>
              {isSecure ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
          </div>
          <div className="text-[11px] font-mono tracking-widest font-bold uppercase" style={{ color: isSecure ? '#00ffaa' : '#ff0055' }}>
            {data?.posture || 'Unknown'}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'timeline-log') {
    // This chart answers the question: What are the true relative time intervals between scheduled agent tasks?
    const events = data?.events || [];
    const maxInterval = Math.max(...events.map((e: any) => e.intervalHours || 1), 1);
    
    // Log scale base to make 1h and 168h visible on the same screen
    return (
      <div className="absolute inset-0 flex items-center opacity-90 mix-blend-screen px-4">
        <div className="relative w-full h-12 border-b border-white/20">
          {events.map((e: any, idx: number) => {
            // Mapping [1, 168] to [0, 100]% using Math.log10
            const lMin = Math.log10(1);
            const lMax = Math.log10(maxInterval + 1);
            const lCur = Math.log10((e.intervalHours || 1));
            const leftPct = ((lCur - lMin) / (lMax - lMin)) * 100;
            return (
              <div key={idx} className="absolute bottom-0 flex flex-col items-center group" style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}>
                <div className="text-[8px] font-mono text-white/50 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute -top-4">{e.title}</div>
                <div className="w-0.5 h-3 rounded-t-full relative" style={{ backgroundColor: color }}>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="text-[8px] font-mono font-bold mt-1" style={{ color }}>{e.intervalHours}h</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'network-stable') {
    // This chart answers the question: What is the deterministic sequence and topology of the agent pipeline?
    const nodes = data?.nodes || [];
    const links = data?.links || [];
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible">
          {links.map((l: any, i: number) => {
            const sourceNode = nodes.find((n: any) => n.id === l.source);
            const targetNode = nodes.find((n: any) => n.id === l.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <line key={i} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            );
          })}
          {nodes.map((n: any, i: number) => (
            <g key={i} transform={`translate(${n.x},${n.y})`}>
              <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#111" stroke={color} strokeWidth="1" />
              <text y="10" x="0" textAnchor="middle" fontSize="6" fill="white" opacity="0.8" className="font-mono">{n.id}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (type === 'focus') {
    // 2-SECOND RULE: Tells you how many files are coupled (outer dots) and how closely (proximity). Orbit speed maps to commit frequency.
    const speed = Math.max(1, 10 - (data?.center?.commitFrequency || 5));
    const satellites = data?.satellites || [];
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="4" fill={color} />
          {satellites.map((s: any, i: number) => {
            const angle = (i / satellites.length) * Math.PI * 2;
            const dist = 10 + (1 - s.coEditScore) * 35; // Closer to center = better coEditScore
            const x = 50 + Math.cos(angle) * dist;
            const y = 50 + Math.sin(angle) * dist;
            return (
              <g key={i}>
                <line x1="50" y1="50" x2={x} y2={y} stroke={color} strokeWidth="0.5" opacity={0.3} />
                <motion.circle cx={x} cy={y} r={s.coEditScore * 4 + 1} fill={color} 
                  animate={{ transformOrigin: "50px 50px", rotate: 360 }}
                  transition={{ duration: speed * (dist/20), repeat: Infinity, ease: 'linear' }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  
  if (type === 'drift') {
    // 2-SECOND RULE: Visualizes divergence. Distance between paths maps to difference in Code vs Doc length.
    const diff = Math.abs((data?.docSnippet?.length || 0) - (data?.codeSnippet?.length || 0));
    const gap = Math.min(40, diff / 2);
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-full h-[80%]">
          <motion.path d={`M 10 50 Q 50 ${50 - gap} 90 50`} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 2" opacity="0.6" animate={{ strokeDashoffset: -20 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
          <path d={`M 10 50 Q 50 ${50 + gap} 90 50`} fill="none" stroke={color} strokeWidth="2" />
          <motion.line x1="50" y1={50 - gap/2} x2="50" y2={50 + gap/2} stroke={color} strokeWidth="0.5" opacity="0.4" animate={{ opacity: [0.1, 0.6, 0.1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
        </svg>
      </div>
    );
  }

  if (type === 'relationships') {
    // 2-SECOND RULE: Node sizes map exactly to 'significance', links to 'strength' from the artifact.
    const nodes = data?.nodes || [];
    const links = data?.links || [];
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%]">
          {links.map((l: any, i: number) => {
            const startNode = nodes.findIndex((n: any) => n.id === l.source);
            const endNode = nodes.findIndex((n: any) => n.id === l.target);
            if (startNode === -1 || endNode === -1) return null;
            const sAngle = (startNode / nodes.length) * Math.PI * 2;
            const eAngle = (endNode / nodes.length) * Math.PI * 2;
            return (
              <line key={i}
                x1={50 + Math.cos(sAngle) * 35} y1={50 + Math.sin(sAngle) * 35}
                x2={50 + Math.cos(eAngle) * 35} y2={50 + Math.sin(eAngle) * 35}
                stroke={color} strokeWidth={l.strength || 1} opacity="0.4"
              />
            );
          })}
          {nodes.map((n: any, i: number) => {
            const angle = (i / nodes.length) * Math.PI * 2;
            return <motion.circle key={i} cx={50 + Math.cos(angle) * 35} cy={50 + Math.sin(angle) * 35} r={n.significance || 2} fill={color} animate={{ r: [n.significance || 2, (n.significance || 2) * 1.5, n.significance || 2] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
          })}
        </svg>
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90 px-8">
        <div className="relative w-full h-[60px] flex items-center justify-between">
          <div className="absolute left-0 right-0 h-[2px] opacity-40 top-1/2 -translate-y-1/2" style={{ backgroundColor: color }} />
          {[20, -30, 20, -15, 30].map((h, i) => (
             <div key={i} className="relative flex flex-col items-center">
               <motion.div 
                 className="w-[2px] opacity-80" 
                 style={{ backgroundColor: color, height: Math.abs(h), position: 'absolute', [h > 0 ? 'bottom' : 'top']: '50%' }}
                 initial={{ scaleY: 0 }}
                 animate={{ scaleY: 1 }}
                 transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
               />
               <motion.div 
                 className="w-4 h-[4px] absolute" 
                 style={{ backgroundColor: color, [h > 0 ? 'bottom' : 'top']: `calc(50% + ${Math.abs(h)}px)` }}
                 initial={{ opacity: 0, scaleX: 0 }}
                 animate={{ opacity: 1, scaleX: 1 }}
                 transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
               />
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'churn') {
    // 2-SECOND RULE: Bar height = commits. Opacity = temp.
    const children = data?.children || [];
    const maxCommits = Math.max(...children.map((c: any) => c.commits || 1), 1);
    return (
      <div className="absolute inset-0 flex items-end justify-center gap-[2px] opacity-90 mix-blend-screen p-4 pb-0">
        {children.map((c: any, i: number) => {
          const heightPct = Math.max(5, ((c.commits || 0) / maxCommits) * 100);
          return (
            <div key={i} className="flex-1 rounded-t-[1px]"
              style={{
                height: `${heightPct}%`,
                backgroundColor: color,
                opacity: Math.max(0.2, c.temp || 0.5)
              }} 
            />
          )
        })}
      </div>
    );
  }

  if (type === 'snapshot') {
    const cx = 100;
    const cy = 115;
    const scaleX = 24;
    const scaleY = 12;
    const dx = 14;
    const dy = 7;

    const blocks = [
      { x: -1, y: -1, h: 22, colorShift: 0, label: "GATE" },
      { x: 0, y: -1, h: 32, colorShift: 1, label: "AUTH" },
      { x: 1, y: -1, h: 18, colorShift: 2, label: "MEM" },
      { x: -1, y: 0, h: 35, colorShift: 3, label: "QUE" },
      { x: 0, y: 0, h: 50, colorShift: 4, label: "CORE" },
      { x: 1, y: 0, h: 28, colorShift: 5, label: "DB" },
      { x: -1, y: 1, h: 14, colorShift: 6, label: "W1" },
      { x: 0, y: 1, h: 20, colorShift: 7, label: "W2" },
      { x: 1, y: 1, h: 10, colorShift: 8, label: "LOG" }
    ];

    // Painters algorithm: sort back to front
    const sortedBlocks = [...blocks].sort((a, b) => (a.x + a.y) - (b.x + b.y));

    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-95 overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] overflow-visible">
          {/* Base Grid Plane Lines */}
          <g opacity="0.15">
            {[-1.5, -0.5, 0.5, 1.5].map((val) => {
              const x1 = cx + (val - 1.5) * scaleX;
              const y1 = cy + (val + 1.5) * scaleY;
              const x2 = cx + (val + 1.5) * scaleX;
              const y2 = cy + (val - 1.5) * scaleY;

              const x3 = cx + (1.5 - val) * scaleX;
              const y3 = cy + (1.5 + val) * scaleY;
              const x4 = cx + (-1.5 - val) * scaleX;
              const y4 = cy + (-1.5 + val) * scaleY;
              return (
                <g key={val}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.75" />
                  <line x1={x3} y1={y3} x2={x4} y2={y4} stroke={color} strokeWidth="0.75" />
                </g>
              );
            })}
          </g>

          {/* Isometric Blocks */}
          {sortedBlocks.map((b, idxVal) => {
            const px = cx + (b.x - b.y) * scaleX;
            const py = cy + (b.x + b.y) * scaleY;
            const h = Math.max(6, b.h + Math.sin(time * 2.8 + b.colorShift * 0.7) * 14);

            const topD = `M ${px} ${py - h - dy} L ${px + dx} ${py - h} L ${px} ${py - h + dy} L ${px - dx} ${py - h} Z`;
            const leftD = `M ${px - dx} ${py - h} L ${px} ${py - h + dy} L ${px} ${py + dy} L ${px - dx} ${py} Z`;
            const rightD = `M ${px} ${py - h + dy} L ${px + dx} ${py - h} L ${px + dx} ${py} L ${px} ${py + dy} Z`;

            return (
              <g key={idxVal} className="group cursor-pointer">
                {/* 3D Shadows */}
                <path 
                  d={`M ${px} ${py + dy} L ${px + dx} ${py} L ${px} ${py - dy} L ${px - dx} ${py} Z`}
                  fill="black"
                  opacity="0.35"
                  className="transition-all duration-300"
                />

                {/* Left Face */}
                <path 
                  d={leftD} 
                  fill={color} 
                  opacity="0.65" 
                  stroke={color}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  className="transition-all duration-300 group-hover:brightness-125"
                />

                {/* Right Face */}
                <path 
                  d={rightD} 
                  fill={color} 
                  opacity="0.45" 
                  stroke={color}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  className="transition-all duration-300 group-hover:brightness-125"
                />

                {/* Top Face */}
                <path 
                  d={topD} 
                  fill={color} 
                  opacity="0.9" 
                  stroke="#ffffff"
                  strokeWidth="0.75"
                  strokeOpacity="0.6"
                  className="transition-all duration-300 group-hover:brightness-150"
                  style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
                />

                {/* Floating Micro Labels */}
                <text 
                  x={px} 
                  y={py - h - dy - 4} 
                  textAnchor="middle" 
                  fontSize="5.5" 
                  fill="white" 
                  className="font-mono tracking-widest font-bold fill-white transition-opacity duration-300 opacity-0 group-hover:opacity-100 select-none pointer-events-none"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (type === 'digest') {
    // 2-SECOND RULE: Progress bars showing explicitly 'weight' and 'status'.
    const features = data?.features || [];
    return (
      <div className="absolute inset-0 flex flex-col justify-center gap-3 opacity-90 p-6">
        {features.map((f: any, i: number) => {
          const fillWidth = (f.weight || 0) * 100;
          return (
             <div key={i} className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
               <div className="absolute top-0 bottom-0 left-0" style={{ width: `${fillWidth}%`, backgroundColor: color, opacity: f.status === 'done' ? 1 : 0.4 }} />
             </div>
          )
        })}
      </div>
    );
  }

  if (type === 'convention') {
    const centerY = 50;
    const width = 360;
    const points1 = [];
    const points2 = [];

    for (let i = 0; i <= 90; i++) {
      const x = (i / 90) * width;
      const angle = (x / 120) * Math.PI * 2; // Wavelength 120
      const y1 = centerY + Math.sin(angle) * 18;
      const y2 = centerY + Math.sin(angle + Math.PI) * 12; // 180 degrees offset (dual)
      points1.push(`${x},${y1}`);
      points2.push(`${x},${y2}`);
    }

    const path1 = `M ${points1.join(' L ')}`;
    const path2 = `M ${points2.join(' L ')}`;

    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-95 overflow-hidden mix-blend-screen">
        <svg viewBox="0 0 200 100" className="w-[140%] h-[140%] overflow-visible">
          {/* Back grid line layer for a technical feel */}
          <line x1="0" y1="50" x2="240" y2="50" stroke={`${color}15`} strokeWidth="1" strokeDasharray="3 3" />
          
          <motion.g 
            animate={{ x: [-120, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            {/* Background Sub-Wave (Out of phase, dashed) */}
            <path 
              d={path2} 
              fill="none" 
              stroke={color} 
              strokeWidth="1.25" 
              opacity="0.35" 
              strokeDasharray="4 4" 
            />

            {/* Primary Glowing Wave */}
            <path 
              d={path1} 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round"
              opacity="0.85" 
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />

            {/* Glowing signal spark moving down the primary wave */}
            <motion.path 
              d={path1} 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              strokeDasharray="8 112" // Period of 120
              animate={{ strokeDashoffset: [240, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />

            {/* Glowing signal spark moving down secondary wave */}
            <motion.path 
              d={path2} 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeDasharray="6 114" 
              animate={{ strokeDashoffset: [0, 240] }} // Reverse speed/direction
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              opacity="0.75"
            />
          </motion.g>
        </svg>
      </div>
    );
  }

  if (type === 'next') {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible relative">
          <circle cx="50" cy="50" r="40" fill="none" stroke={`${color}40`} strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="20" fill="none" stroke={`${color}20`} strokeWidth="0.5" />
          
          <motion.g animate={{ rotate: 360, transformOrigin: '50px 50px' }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <path d="M 50 50 L 50 10 A 40 40 0 0 1 80 20 Z" fill={`url(#radar-sweep-${id})`} opacity="0.8" />
            <line x1="50" y1="50" x2="50" y2="10" stroke={color} strokeWidth="1" />
          </motion.g>

          <motion.circle cx="70" cy="30" r="3" fill={color} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
          
          <defs>
            <linearGradient id={`radar-sweep-${id}`} x1="50" y1="50" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === 'dependency') {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90 p-4">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible">
          {/* Top Node */}
          <rect x="35" y="25" width="30" height="10" rx="2" fill={color} />
          {/* Links */}
          <path d="M 50 35 L 50 50 L 25 50 L 25 65" fill="none" stroke={color} strokeWidth="3" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 35 L 50 50 L 75 50 L 75 65" fill="none" stroke={color} strokeWidth="3" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bottom Nodes */}
          <rect x="15" y="65" width="20" height="8" rx="1.5" fill={color} />
          <rect x="65" y="65" width="20" height="8" rx="1.5" fill={color} />
          {/* Animation Glow */}
          <motion.rect x="35" y="25" width="30" height="10" rx="2" fill={color} animate={{ opacity: [0, 0.6, 0], filter: ['blur(0px)', 'blur(8px)', 'blur(0px)'] }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.rect x="15" y="65" width="20" height="8" rx="1.5" fill={color} animate={{ opacity: [0, 0.6, 0], filter: ['blur(0px)', 'blur(5px)', 'blur(0px)'] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
          <motion.rect x="65" y="65" width="20" height="8" rx="1.5" fill={color} animate={{ opacity: [0, 0.6, 0], filter: ['blur(0px)', 'blur(5px)', 'blur(0px)'] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
        </svg>
      </div>
    );
  }

  if (type === 'release') {
    // 2-SECOND RULE: Radius maps to highlight description size.
    const highlights = data?.highlights || [];
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%]">
          {highlights.map((h: any, i: number) => {
            const size = Math.min(45, (h.description?.length || 10) / 2);
            return <motion.circle key={i} cx="50" cy="50" r={size} fill="none" stroke={color} strokeWidth="1" animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8], transformOrigin: '50% 50%' }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />
          })}
          <circle cx="50" cy="50" r="2" fill="#fff" />
        </svg>
      </div>
    );
  }

  // Def fallback
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-80">
      <div className="w-8 h-8 rounded border border-dashed" style={{ borderColor: color, backgroundColor: `${color}20` }} />
    </div>
  );
};

const ExhibitTile = ({ 
  artifact, 
  isDeep, 
  onToggle,
  index = 0
}: { 
  artifact: ExhibitArtifact, 
  isDeep: boolean, 
  onToggle: () => void,
  index?: number
}) => {
  const Icon = EXHIBIT_ICONS[artifact.type] || Terminal;
  const color = TYPE_COLORS[artifact.type] || '#ffffff';

  // Parallax Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  if (isDeep) {
    return (
      <motion.div
        layoutId={`card-${artifact.id}`}
        transition={SPRING_EXPAND}
        className="fixed inset-4 md:inset-12 z-50 bg-background-dark/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        style={{ borderColor: `${color}30` }}
      >
        {/* Header - Staggered Entry */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_QUICK, delay: 0.1 }}
          className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/50 border" style={{ borderColor: `${color}40`, color: color, boxShadow: `0 0 20px ${color}40` }}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight font-display">{artifact.title}</h3>
              <p className="text-xs uppercase tracking-[0.2em] font-black" style={{ color: color }}>Agent: {artifact.agent}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.blip();
              onToggle();
            }} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-white/70" />
          </motion.button>
        </motion.div>
        
        {/* Deep Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
           {/* Floating Agent Narrative */}
           <motion.div 
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 0.9, y: 0, scale: 1 }}
             whileHover={{ scale: 1.02, opacity: 1 }}
             transition={{ ...SPRING_SMOOTH, delay: 0.2 }}
             className="absolute top-8 right-8 max-w-xs bg-background-dark/95 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-auto overflow-hidden group/narrative"
           >
             <div className="absolute top-0 left-0 w-1 h-full opacity-50" style={{ backgroundColor: color }} />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{ color: color }}>
               <ScrollText className="w-3.5 h-3.5" /> Agent Narrative
             </h4>
             <p className="text-xs text-white/90 leading-relaxed font-mono opacity-80 group-hover/narrative:opacity-100 transition-opacity whitespace-pre-wrap">{artifact.narrative}</p>
             <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
               <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black">
                 Status: <span className={artifact.severity === 'critical' ? 'text-error' : 'text-primary'}>{artifact.severity === 'critical' ? 'UNSTABLE' : 'NOMINAL'}</span>
               </p>
               <div className="flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
                  ))}
               </div>
             </div>
           </motion.div>
           
           {/* Specific Deep Dive Content - Staggered Entry */}
           <motion.div
             initial={{ opacity: 0, scale: 0.98, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ ...SPRING_SMOOTH, delay: 0.3 }}
             className="w-full h-full"
           >
             {artifact.type === 'focus' && <FocusDeep data={artifact.data} />}
             {artifact.type === 'drift' && <DriftDeep data={artifact.data} />}
             {artifact.type === 'relationships' && <RelationshipsDeep data={artifact.data} />}
             {artifact.type === 'timeline' && <TimelineDeep data={artifact.data} />}
             {artifact.type === 'churn' && <ChurnDeep data={artifact.data} />}
             {artifact.type === 'snapshot' && <SnapshotDeep data={artifact.data} />}
             {artifact.type === 'digest' && <DigestDeep data={artifact.data} />}
             {artifact.type === 'convention' && <ConventionDeep data={artifact.data} />}
             {artifact.type === 'next' && <NextDeep data={artifact.data} />}
             {artifact.type === 'dependency' && <DependencyDeep data={artifact.data} />}
             {artifact.type === 'release' && <ReleaseDeep data={artifact.data} />}
             {artifact.type === 'proportion' && <ProportionDeep data={artifact.data} />}
             {artifact.type === 'bar-chart' && <BarChartDeep data={artifact.data} />}
             {artifact.type === 'policy-badge' && <PolicyBadgeDeep data={artifact.data} />}
             {artifact.type === 'timeline-log' && <TimelineLogDeep data={artifact.data} />}
             {artifact.type === 'network-stable' && <NetworkStableDeep data={artifact.data} />}
           </motion.div>
        </div>
      </motion.div>
    );
  }

  // Macro State
  const severityBorderColor = artifact.severity === 'critical' ? 'rgba(255, 51, 102, 0.4)' : artifact.severity === 'warning' ? 'rgba(245, 166, 35, 0.4)' : 'rgba(255,255,255,0.1)';
  const severityShadowLayer = artifact.severity === 'critical' ? 'rgba(255, 51, 102, 0.15)' : artifact.severity === 'warning' ? 'rgba(245, 166, 35, 0.15)' : 'rgba(0, 229, 255, 0.05)';
  
  const handleCardClick = () => {
    sounds.whoosh();
    onToggle();
  };

  // Bento Span Logic
  const patterns = [
    "md:col-span-12 lg:col-span-8 row-span-2 h-auto min-h-[624px]", // Hero wide & tall
    "md:col-span-6 lg:col-span-4 row-span-1 h-80", // Standard
    "md:col-span-6 lg:col-span-4 row-span-1 h-80", // Standard
    "md:col-span-6 lg:col-span-4 row-span-1 h-80", // Standard
    "md:col-span-6 lg:col-span-6 row-span-1 h-80", // Wide
    "md:col-span-6 lg:col-span-6 row-span-1 h-80", // Wide
    "md:col-span-12 lg:col-span-8 row-span-1 h-80", // Very wide
    "md:col-span-6 lg:col-span-4 row-span-2 h-auto min-h-[624px]", // Tall
  ];
  const spanClass = isDeep ? "col-span-12 h-screen" : patterns[index % patterns.length];

  return (
    <motion.div
      layoutId={`card-${artifact.id}`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => sounds.tick(artifact.severity as any)}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_EXPAND}
      className={cn("col-span-12 relative group cursor-pointer border rounded-[2rem] flex flex-col w-full", spanClass)}
      style={{ 
        borderColor: 'transparent'
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 bg-[#0d0d14] border rounded-2xl overflow-hidden flex flex-col pointer-events-none transition-all duration-300 group-hover:border-white/10 group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
          style={{ borderColor: severityBorderColor }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/5 shrink-0" style={{ color: color }}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 truncate pt-0.5">
              <h3 className="text-[13px] font-semibold text-white tracking-tight truncate flex items-center gap-2">
                {artifact.title}
              </h3>
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] truncate mt-1">
                {artifact.agent} • {artifact.severity}
              </p>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-start">
            <p className="text-[11px] font-mono text-white/70 leading-relaxed mb-4 line-clamp-3">{artifact.summary}</p>
            
            {/* Strict epistemic visualization area */}
            <div className="bg-[#030308] border border-white/5 rounded-lg p-3 mb-4 shrink-0 flex-1 relative overflow-hidden" style={{ minHeight: '90px' }}>
               <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-2 flex justify-between absolute top-2 left-3 right-3 z-10">
                  <span>Telemetry</span>
               </div>
               <div className="absolute inset-0 pt-8 pb-3 px-3">
                 <MiniVis type={artifact.type} color={color} data={artifact.data} id={artifact.id} />
               </div>
            </div>

            {/* Metric Strip Component logic inside tile */}
            <div className="flex gap-2 mt-auto pb-1">
               {extractMetrics(artifact.type, artifact.data).map((m, i) => {
                 const metricColor = m.state === 'critical' ? '#ff3366' : m.state === 'warning' ? '#f5a623' : color;
                 return (
                   <div key={i} className="flex-1 bg-white/[0.02] rounded-md p-2 text-center border border-white/5 transition-colors" style={{ borderColor: m.state !== 'neutral' && m.state ? `${metricColor}40` : 'rgba(255,255,255,0.05)' }}>
                      <div className="font-mono text-sm font-bold" style={{ color: metricColor }}>{m.value}</div>
                      <div className="font-mono text-[9px] text-muted uppercase mt-0.5 tracking-widest truncate" title={m.label}>{m.label}</div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Audio Debug Panel ---
const AudioDebugPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  
  const prompts = `## Tactical / Cyberpunk
- Hover (Warn): "Very short, dry digital click, high-frequency subtle data processing blip, clean interface sound, zero reverb, microscopic volume."
- Expand: "Clean digital pneumatic air release mixed with high-tech data scatter, swift left to right pan, swift mechanical unfolding UI sound, 0.4 seconds."
- Flip: "Crisp servo motor whir, fast mechanical shutter click, robotic macro lens focusing, digital UI confirmation chime, very short."
- Ambient (Crit): "Dark rumbling drone, intermittent analog static, slow pulsing sub-bass, tense sci-fi reactor core room, subtle alarm rhythm in the distance, moody, highly atmospheric, seamless loop."

## Organic / Glassmorphic
- Hover (Healthy): "Soft marimba mallet gently tapping a thick piece of glass, muted resonance, very subtle and warm, UI interaction sound."
- Expand: "Whoosh of thick paper or playing cards fanning out, soft fabric sliding against wood, organic transition sweep, 0.4 seconds."
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING_EXPAND}
            className="fixed top-0 right-0 bottom-0 w-full md:w-96 bg-background-dark border-l border-white/10 z-[120] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50">
              <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Audio Configurator
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Audio Source Override */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted border-b border-white/5 pb-2">Audio Source Engine</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 bg-primary/20 border border-primary/50 text-white rounded text-xs font-bold tracking-widest">PROCEDURAL API</button>
                  <button className="py-2 bg-surface border border-white/10 text-muted rounded text-xs hover:bg-white/5 transition-colors disabled:opacity-50">AI MODELS (WIP)</button>
                </div>
                <p className="text-[10px] text-muted/70 leading-relaxed italic">Currently utilizing the native Web Audio API Math engines. AI specific WAV/MP3 mapping will be enabled when generation pipeline finishes.</p>
              </div>

              {/* Procedural Triggers */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted border-b border-white/5 pb-2">Diagnostic Triggers</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/80">Hover (Healthy)</span>
                    <button onClick={() => sounds.tick('healthy')} className="px-3 py-1 bg-surface border border-white/10 rounded text-[10px] hover:bg-white/10 transition-colors">Test Ping</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-warning">Hover (Warning)</span>
                    <button onClick={() => sounds.tick('warning')} className="px-3 py-1 bg-surface border border-warning/30 text-warning rounded text-[10px] hover:bg-warning/10 transition-colors">Test Thud</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-error">Hover (Critical)</span>
                    <button onClick={() => sounds.tick('critical')} className="px-3 py-1 bg-surface border border-error/30 text-error rounded text-[10px] hover:bg-error/10 transition-colors">Test Rumble</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/80">Card Expansion</span>
                    <button onClick={() => sounds.whoosh()} className="px-3 py-1 bg-surface border border-white/10 rounded text-[10px] hover:bg-white/10 transition-colors">Test Whoosh</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/80">Card Flip (3D)</span>
                    <button onClick={() => sounds.blip()} className="px-3 py-1 bg-surface border border-white/10 rounded text-[10px] hover:bg-white/10 transition-colors">Test Blip</button>
                  </div>
                </div>
              </div>

              {/* AI Prompts Generator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-muted">AI Generator Prompts</h3>
                  <button onClick={handleCopy} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold">
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[10px] text-muted/70 leading-relaxed italic mb-2">Use these verified prompts in ElevenLabs SFX, Stable Audio, or Suno to generate replacement premium assets.</p>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-y-auto max-h-48 custom-scrollbar">
                  <pre className="text-[9px] text-green-400/80 whitespace-pre-wrap font-mono leading-relaxed">
                    {prompts}
                  </pre>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Agent Control Center (TerminalPanel) ---
const mockTerminalLogs = [
  { id: 1, time: '10:50:33 PM', badge: 'unhooked', badgeColor: 'text-muted bg-white/5 border-white/10', text: 'Create ErrorBanner component and validation helper' },
  { id: 2, time: '10:50:28 PM', badge: 'status_changed', badgeColor: 'text-primary bg-primary/10 border-primary/20', text: '"Create SidePanel component for node detail view" → open (by agent system...)' },
  { id: 3, time: '10:50:22 PM', badge: 'status_changed', badgeColor: 'text-primary bg-primary/10 border-primary/20', text: '"Review: convoy/coldtrace-sidepanel-fileloader-errorbann/5009c9ed/gt/maple/d0e16733" → failed (by agent sy...)' },
  { id: 4, time: '10:50:22 PM', badge: 'unhooked', badgeColor: 'text-muted bg-white/5 border-white/10', text: 'unhooked: "Review: convoy/coldtrace-sidepanel-fileloader-errorbann/5009c9ed/gt/maple/d0e16733"' },
  { id: 5, time: '10:49:10 PM', badge: 'status_changed', badgeColor: 'text-primary bg-primary/10 border-primary/20', text: '"Create FileLoader component extracted from App.tsx" → open (by agent system...)' },
  { id: 6, time: '10:49:10 PM', badge: 'unhooked', badgeColor: 'text-muted bg-white/5 border-white/10', text: 'unhooked: "Create FileLoader component extracted from App.tsx"' },
  { id: 7, time: '10:48:55 PM', badge: 'status_changed', badgeColor: 'text-primary bg-primary/10 border-primary/20', text: '"Create ErrorBanner component and validation helper" → in_progress (by agent 46f7cfbd...)' },
  { id: 8, time: '10:48:46 PM', badge: 'hooked', badgeColor: 'text-accent bg-accent/10 border-accent/20', text: 'hooked: "Create ErrorBanner component"' },
];

const TerminalPanel = () => {
  return (
    <motion.div 
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="h-[300px] shrink-0 border-t border-white/10 bg-[#121315] flex flex-col relative z-[50]"
    >
      {/* Tabs */}
      <div className="h-10 shrink-0 border-b border-white/5 flex items-center px-6 gap-6 bg-[#0f1011]">
        <div className="flex items-center gap-2 pr-6 border-r border-white/5 text-muted">
          <Terminal className="w-4 h-4" />
          <Server className="w-4 h-4 ml-2" />
        </div>
        <button className="h-full border-b-2 border-primary text-primary text-xs font-mono font-bold tracking-widest flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Status
        </button>
        <button className="h-full border-b-2 border-transparent text-muted hover:text-white text-xs font-mono font-bold tracking-widest flex items-center gap-2 transition-colors">
          <Server className="w-3.5 h-3.5" />
          Mayor
        </button>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Left Stats Grid */}
        <div className="w-[450px] shrink-0 border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#161719]">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] flex items-center justify-between">
              Alarm Loop
            </h3>
            <div className="flex items-center gap-8 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-muted/60">Interval</span>
                <span className="text-primary font-bold">active (5s)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted/60">Next fire</span>
                <span className="text-white">now</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Agents (15)</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-mono">
              <div className="flex justify-between items-center"><span className="text-muted/60">Working</span><span className="text-green-400 font-bold">1</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">Idle</span><span className="text-white">14</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">Stalled</span><span className="text-red-400">0</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">Dead</span><span className="text-red-500">0</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Beads</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-mono">
              <div className="flex justify-between items-center"><span className="text-muted/60">Open</span><span className="text-white">7</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">In Progress</span><span className="text-accent font-bold">1</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">In Review</span><span className="text-white">0</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">Failed</span><span className="text-error font-bold">18</span></div>
              <div className="flex justify-between items-center"><span className="text-muted/60">Triage</span><span className="text-white">0</span></div>
            </div>
          </div>
        </div>

        {/* Right Event Log */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#121315]">
           <div className="h-10 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#161719]/50">
             <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Recent Events</h3>
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
               <span className="text-[10px] font-mono text-green-500 tracking-wider">Live</span>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-1.5">
             {mockTerminalLogs.map(log => (
               <div key={log.id} className="flex whitespace-nowrap items-center gap-4 px-3 py-2 rounded-md bg-transparent hover:bg-white/[0.03] transition-colors font-mono text-[11px] group cursor-default">
                 <span className="text-muted/40 w-24 shrink-0 transition-colors group-hover:text-muted/80">{log.time}</span>
                 <span className={`px-2 py-0.5 rounded border leading-none tracking-wide flex shrink-0 items-center justify-center ${log.badgeColor}`}>{log.badge}</span>
                 <span className="text-muted shrink-0 text-white/70 truncate transition-colors group-hover:text-white" title={log.text}>{log.text}</span>
               </div>
             ))}
           </div>
           
           <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#121315] to-transparent pointer-events-none" />
        </div>

      </div>
    </motion.div>
  );
};

// --- Main Page ---

export default function RepoVis() {
  const [deepExhibitId, setDeepExhibitId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isAudioDebugOpen, setIsAudioDebugOpen] = useState(false);
  const [isMotionEnabled, setIsMotionEnabled] = useState(true);

  useEffect(() => {
    logger.info('System', 'Booting RepoVis engine...');
    const timer = setTimeout(() => {
      setIsBooting(false);
      logger.success('System', 'Dashboard ready.');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDeep = (id: string) => {
    if (deepExhibitId === id) {
      logger.info('Navigation', 'Exiting Deep Dive');
    } else {
      logger.info('Navigation', `Entering Deep Dive for artifact: ${id}`);
    }
    setDeepExhibitId(prev => prev === id ? null : id);
  };

  // Sort exhibits by severity (critical -> warning -> healthy)
  const sortedExhibits = useMemo(() => {
    return [...MOCK_EXHIBITS].sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, warning: 1, healthy: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, []);

  // Filter exhibits based on search query
  const filteredExhibits = useMemo(() => {
    return sortedExhibits.filter(exhibit => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const searchString = `${exhibit.title} ${exhibit.summary} ${exhibit.narrative} ${JSON.stringify(exhibit.data)}`.toLowerCase();
      return searchString.includes(query);
    });
  }, [searchQuery, sortedExhibits]);

  useEffect(() => {
    if (searchQuery) {
      logger.trace('Search', `Filtering by: "${searchQuery}" - Found ${filteredExhibits.length} matches`);
    }
  }, [searchQuery, filteredExhibits.length]);

  // Calculate global health (simple mock based on critical count)
  const criticalCount = useMemo(() => MOCK_EXHIBITS.filter(e => e.severity === 'critical').length, []);
  const globalHealthColor = criticalCount > 2 ? 'rgba(255, 51, 102, 0.05)' : criticalCount > 0 ? 'rgba(245, 166, 35, 0.05)' : 'rgba(0, 229, 255, 0.05)';
  const globalSeverity = criticalCount > 2 ? 'critical' : criticalCount > 0 ? 'warning' : 'healthy';

  useEffect(() => {
    if (isAmbientPlaying) {
      sounds.updateAmbient(globalSeverity);
    }
  }, [globalSeverity, isAmbientPlaying]);

  const toggleAmbient = () => {
    sounds.toggleAmbient(globalSeverity);
    setIsAmbientPlaying(sounds.isAmbientEnabled);
  };

  return (
    <MotionConfig reducedMotion={isMotionEnabled ? "never" : "always"}>
      <div className="min-h-screen bg-background-dark text-text-main selection:bg-primary/30 overflow-x-hidden font-sans transition-colors duration-1000" style={{ backgroundColor: globalHealthColor }}>
        {/* Global Scanline Overlay */}
        <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_2px,2px_100%] z-[100] opacity-30" />

      {/* IDE Pane Container -> Now Full Screen Grid */}
      <div className="w-full mx-auto h-screen relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-[60] bg-background-dark/80 backdrop-blur-3xl border-b border-white/5 px-6 py-6 flex items-center justify-between gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 shrink-0 cursor-default"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20" style={{ boxShadow: '0 0 20px rgba(0,229,255,0.2)' }}>
              <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter font-display uppercase italic text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">RepoVis</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] font-black opacity-60">Feed: Active</span>
              </div>
            </div>
          </motion.div>
          
          <div className="flex-1 max-w-md relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter artifact..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 backdrop-blur-md border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-text-main placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { sounds.tick(); setIsMotionEnabled(!isMotionEnabled); }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                isMotionEnabled ? "bg-accent/20 border-accent/40 text-accent shadow-[0_0_15px_rgba(0,229,255,0.3)]" : "bg-surface border-white/10 text-muted"
              )}
              title={isMotionEnabled ? "Motion Active" : "Motion Paused"}
            >
              <motion.div animate={isMotionEnabled ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 2, repeat: isMotionEnabled ? Infinity : 0, ease: "linear" }}>
                <Zap className="w-5 h-5" />
              </motion.div>
            </button>
            <button
              onClick={toggleAmbient}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                isAmbientPlaying ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,229,255,0.3)]" : "bg-surface border-white/10 text-muted hover:bg-white/5"
              )}
              title="Toggle Ambient Diagnostics"
            >
              {isAmbientPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <Link 
              href="/hero"
              onClick={() => sounds.blip()}
            >
              <motion.div
                onMouseEnter={() => sounds.tick()}
                whileHover={{ scale: 1.1, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_TACTILE}
                className="w-10 h-10 rounded-xl bg-surface border border-green-500/20 flex items-center justify-center text-green-500 hover:bg-green-500/10 hover:border-green-500/40 transition-all shadow-lg group relative"
                title="Moosegoose Compute Hero"
              >
                <Server className="w-5 h-5 transition-transform" />
              </motion.div>
            </Link>
            <Link 
              href="/svg-showcase"
              onClick={() => sounds.blip()}
            >
              <motion.div
                onMouseEnter={() => sounds.tick()}
                whileHover={{ scale: 1.1, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_TACTILE}
                className="w-10 h-10 rounded-xl bg-surface border border-accent/20 flex items-center justify-center text-accent hover:bg-accent/10 hover:border-accent/40 transition-all shadow-lg group relative"
              >
                <Sparkles className="w-5 h-5 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse border-2 border-background-dark" />
              </motion.div>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAudioDebugOpen(true)}
              transition={SPRING_TACTILE}
              className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-muted hover:text-white hover:border-white/20 transition-all shadow-lg"
              title="Audio Configuration"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_TACTILE}
              className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-muted hover:text-white hover:border-white/20 transition-all shadow-lg"
              title="Compute Utilization"
            >
              <Cpu className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        {/* Boot Sequence */}
        <AnimatePresence>
          {isBooting && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-background-dark flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full mb-8"
              />
              <h2 className="text-sm font-mono text-primary uppercase tracking-[0.5em] animate-pulse">Initializing Exhibits</h2>
              <p className="text-[10px] font-mono text-muted mt-4 uppercase tracking-widest">Assembling Agent Artifacts...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Feed */}
        <main className={cn(
          "flex-1 px-6 py-8 transition-all duration-700",
          deepExhibitId ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"
        )}>
          <LayoutGroup>
            <div className={cn(
              "grid gap-6 transition-all duration-700",
              deepExhibitId ? "grid-cols-1" : "grid-cols-12 auto-rows-max"
            )}>
              {filteredExhibits.map((artifact, idx) => {
                // If a deep exhibit is active, hide the others
                if (deepExhibitId && deepExhibitId !== artifact.id) return null;
                
                return (
                  <ExhibitTile 
                    key={artifact.id} 
                    artifact={artifact}
                    isDeep={deepExhibitId === artifact.id}
                    onToggle={() => toggleDeep(artifact.id)}
                    index={idx}
                  />
                );
              })}
            </div>
          </LayoutGroup>
        </main>

        <TerminalPanel />

        {/* Deep Dive Overlay Background */}
        <AnimatePresence>
          {deepExhibitId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background-dark/90 backdrop-blur-xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Configurators */}
        <AudioDebugPanel isOpen={isAudioDebugOpen} onClose={() => setIsAudioDebugOpen(false)} />
      </div>
    </div>
  </MotionConfig>
);
}

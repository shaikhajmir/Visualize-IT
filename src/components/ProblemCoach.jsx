import React, { useState } from 'react';
import { BookOpen, AlertCircle, ArrowRight, ExternalLink, Code2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { concepts } from '../data/concepts';

export default function ProblemCoach({ problem, onStartVisualizing }) {
  const [activePrereq, setActivePrereq] = useState(null);

  if (!problem) return null;

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      
      {/* Header Info with Stitched Border and Monospace metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 border-dashed pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-purple-400 bg-purple-950/20 px-2.5 py-0.5 rounded border border-purple-900/35">
              {problem.category}
            </span>
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border ${
              problem.difficulty === 'Easy' 
                ? 'bg-emerald-950/20 text-emerald-350 border-emerald-900/30' 
                : 'bg-amber-950/20 text-amber-350 border-amber-900/30'
            }`}>
              {problem.difficulty}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">{problem.title}</h2>
        </div>
        
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 hover:text-purple-350 transition"
        >
          [View on LeetCode] <ExternalLink size={13} />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Guide Content (Left 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Problem Statement */}
          <div className="bg-zinc-900/10 border border-zinc-850 border-dashed rounded-xl p-5">
            <h3 className="text-xs font-mono font-bold text-zinc-450 uppercase tracking-widest mb-3 flex items-center gap-2">
              <HelpCircle size={15} className="text-purple-400" />
              // Problem Statement
            </h3>
            <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-line font-medium">
              {problem.description}
            </p>
          </div>

          {/* Prerequisite Tags */}
          <div className="bg-zinc-900/10 border border-zinc-850 border-dashed rounded-xl p-5">
            <h3 className="text-xs font-mono font-bold text-zinc-450 uppercase tracking-widest mb-2 flex items-center gap-2">
              <BookOpen size={15} className="text-purple-400" />
              // Prerequisite Concepts
            </h3>
            <p className="text-xs text-zinc-550 mb-4 font-mono">
              Click a keyword below to load its properties and pitfalls:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {problem.prerequisites.map((prereqId) => {
                const concept = concepts[prereqId];
                return (
                  <button
                    key={prereqId}
                    onClick={() => setActivePrereq(prereqId)}
                    className={`flex items-center gap-2 text-xs font-mono font-bold px-3 py-2 rounded-lg border transition cursor-pointer ${
                      activePrereq === prereqId
                        ? 'bg-purple-950/20 border-purple-500/70 text-purple-300 shadow-sm'
                        : 'bg-zinc-900/40 hover:bg-zinc-800/40 text-zinc-400 border-zinc-850'
                    }`}
                  >
                    <span>{concept ? concept.name : prereqId}</span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approaches Explanation */}
          <div className="bg-zinc-900/10 border border-zinc-850 border-dashed rounded-xl p-5 space-y-6">
            
            {/* Naive */}
            <div className="border-b border-zinc-800/60 border-dashed pb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono font-bold text-rose-450 flex items-center gap-2">
                  <AlertCircle size={15} />
                  1. Naive / Brute Force Approach
                </h4>
                <span className="text-[10px] font-mono bg-rose-950/20 text-rose-350 px-2 py-0.5 rounded border border-rose-900/30">
                  {problem.naiveApproach.complexity}
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                {problem.naiveApproach.description}
              </p>
            </div>

            {/* Optimal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={15} />
                  2. Optimal Approach (Recommended)
                </h4>
                <span className="text-[10px] font-mono bg-emerald-950/20 text-emerald-350 px-2 py-0.5 rounded border border-emerald-900/30">
                  {problem.optimalApproach.complexity}
                </span>
              </div>
              <p className="text-zinc-200 text-xs leading-relaxed font-semibold">
                {problem.optimalApproach.description}
              </p>
            </div>

          </div>

          {/* CTA: Open Visualizer */}
          <button
            onClick={onStartVisualizing}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 font-bold font-mono text-xs text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-purple-500/20"
          >
            <Code2 size={16} />
            [Compile & Run Animation Tracer]
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Prerequisite Sidebar/Widget (Right 5 Cols) */}
        <div className="lg:col-span-5">
          {activePrereq ? (
            <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-xl p-5 sticky top-6 animate-fade-in bg-grid-stitch">
              <div className="flex justify-between items-start mb-4 border-b border-zinc-800/60 border-dashed pb-2">
                <h3 className="text-xs font-mono font-bold text-purple-400">
                  // Guide: {concepts[activePrereq].name}
                </h3>
                <button
                  onClick={() => setActivePrereq(null)}
                  className="text-[10px] font-mono text-zinc-550 hover:text-zinc-350 font-bold"
                >
                  [Hide]
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <h4 className="font-bold text-zinc-400 mb-1">// Description:</h4>
                  <p className="text-zinc-350 leading-relaxed font-sans font-medium text-xs">
                    {concepts[activePrereq].description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-400 mb-1.5">// Complexity Metrics:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-zinc-350">
                    {concepts[activePrereq].properties.map((prop, idx) => (
                      <li key={idx} className="font-sans text-xs">{prop}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-amber-300">
                  <h4 className="font-bold mb-1 flex items-center gap-1">
                    ⚠️ Common Pitfall
                  </h4>
                  <p className="leading-relaxed font-sans text-xs">
                    {concepts[activePrereq].pitfalls}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/10 border border-dashed border-zinc-850 rounded-xl p-8 text-center text-zinc-550 text-xs flex flex-col items-center gap-2.5 sticky top-6">
              <BookOpen size={24} className="text-purple-900/30" />
              <div>
                <p className="font-mono font-bold mb-1">[Prerequisites Sidebar]</p>
                <p className="text-zinc-550 max-w-[220px] mx-auto text-[11px] leading-relaxed">
                  Select a prerequisite tag on the left to display dynamic concepts documentation.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

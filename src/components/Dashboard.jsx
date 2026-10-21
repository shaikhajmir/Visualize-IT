import React, { useState } from 'react';
import { Search, Code2, ChevronRight, HelpCircle } from 'lucide-react';
import { problems } from '../data/problems';

export default function Dashboard({ onSelectProblem, onOpenSandbox }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(problems.map(p => p.category))];

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      
      {/* Intro Hero banner with high contrast Zinc borders */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 border-dashed rounded-2xl p-6 lg:p-8 mb-6 shadow-sm relative overflow-hidden bg-grid-stitch">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/20 text-purple-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-4 border border-purple-900/30">
            <span>⚡ Interactive Learning Console</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2.5 text-zinc-50">
            Visualize & Animate Your DSA Solutions
          </h2>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-medium">
            Stuck on a LeetCode problem? Select a challenge to see its required prerequisites, learn the optimal approach, and trace your solution step-by-step with interactive memory layout animations.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenSandbox}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-xs font-bold font-mono rounded-lg transition-all shadow-md hover:-translate-y-0.5 cursor-pointer border border-purple-500/20"
            >
              <Code2 size={14} />
              [Open Custom Sandbox]
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.03] pointer-events-none hidden md:block">
          <Code2 size={240} className="text-white rotate-12 translate-x-12 translate-y-6" />
        </div>
      </div>

      {/* Filter and Search Bar with High Contrast design */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-zinc-900/20 border border-zinc-800/60 border-dashed p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400/80" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-650 focus:ring-1 focus:ring-purple-650 transition"
            placeholder="Search problems..."
          />
        </div>

        {/* Categories list */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-md border transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-950/20 border-purple-500/60 text-purple-400 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800/85 text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800/60 border-dashed pb-2">
          <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest font-mono">
            // Challenges Available ({filteredProblems.length})
          </h3>
        </div>
        
        {filteredProblems.length === 0 ? (
          <div className="h-40 border border-dashed border-zinc-800/60 rounded-xl flex flex-col justify-center items-center text-zinc-550 gap-1.5 bg-zinc-950/20">
            <HelpCircle size={22} className="text-purple-400/40" />
            <p className="text-xs font-mono">No problems match your query or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob)}
                className="group bg-zinc-900/20 border border-zinc-800/60 border-dashed hover:border-purple-500/40 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-zinc-900/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Category and Difficulty tags */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[9px] font-mono tracking-wider font-extrabold text-purple-400 bg-purple-950/15 px-2 py-0.5 rounded border border-purple-900/35">
                      {prob.category}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      prob.difficulty === 'Easy'
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                        : 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-150 mb-2 group-hover:text-purple-400 transition-colors">
                    {prob.title}
                  </h4>
                  
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                    {prob.description.replace(/`/g, '')}
                  </p>
                </div>

                <div className="border-t border-zinc-800/60 border-dashed pt-3.5 flex items-center justify-between">
                  {/* Prereq summary icons/tags */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-zinc-550 font-mono font-semibold">[Prereqs]</span>
                    <div className="flex gap-1">
                      {prob.prerequisites.slice(0, 2).map((pre, pIdx) => (
                        <span key={pIdx} className="text-[9px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                          {pre}
                        </span>
                      ))}
                      {prob.prerequisites.length > 2 && (
                        <span className="text-[9px] text-zinc-550 font-bold self-center">
                          +{prob.prerequisites.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    [Run] <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

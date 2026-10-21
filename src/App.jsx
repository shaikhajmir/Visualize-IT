import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProblemCoach from './components/ProblemCoach';
import Visualizer from './components/Visualizer';
import { Layers, Code2 } from 'lucide-react';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'coach', 'visualizer'
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setView('coach');
  };

  const handleOpenSandbox = () => {
    setSelectedProblem(null);
    setView('visualizer');
  };

  const getTranslateX = () => {
    if (view === 'dashboard') return 'translate3d(0%, 0, 0)';
    if (view === 'coach') return 'translate3d(-33.3333%, 0, 0)';
    if (view === 'visualizer') return 'translate3d(-66.6666%, 0, 0)';
    return 'translate3d(0%, 0, 0)';
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200 bg-grid-stitch">
      {/* Navbar with Stitched Border styling */}
      <header className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-900 border-dashed px-4 lg:px-8 py-3.5 flex justify-between items-center">
        <div 
          onClick={() => setView('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-transform duration-200">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none m-0 text-zinc-100">
              Visualize IT
            </h1>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase block mt-1 font-mono">
              [dsa.coach.v1.0]
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2.5">
          <button
            onClick={() => setView('dashboard')}
            className={`text-xs font-mono font-bold transition px-3 py-1.5 rounded-lg border border-transparent cursor-pointer ${
              view === 'dashboard' 
                ? 'text-purple-400 bg-purple-950/20 border border-purple-900/30' 
                : 'text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/30'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={handleOpenSandbox}
            className={`text-xs font-mono font-bold flex items-center gap-1.5 transition px-3 py-1.5 rounded-lg border cursor-pointer ${
              view === 'visualizer' && !selectedProblem 
                ? 'bg-purple-950/30 border-purple-500/60 text-purple-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Code2 size={13} />
            Sandbox
          </button>
        </nav>
      </header>

      {/* Main Sliding Content Container */}
      <main className="flex-1 flex flex-col w-full overflow-hidden py-4 md:py-6">
        <div 
          className="view-carousel-container flex-1"
          style={{ transform: getTranslateX() }}
        >
          {/* Dashboard View */}
          <div className="view-slide flex flex-col px-4 lg:px-8 w-full max-w-7xl mx-auto">
            <Dashboard 
              onSelectProblem={handleSelectProblem} 
              onOpenSandbox={handleOpenSandbox} 
            />
          </div>
          
          {/* Problem Coach View */}
          <div className="view-slide flex flex-col px-4 lg:px-8 w-full max-w-7xl mx-auto">
            <ProblemCoach 
              problem={selectedProblem} 
              onStartVisualizing={() => setView('visualizer')} 
            />
          </div>
          
          {/* Visualizer View */}
          <div className="view-slide flex flex-col px-4 lg:px-8 w-full max-w-7xl mx-auto">
            <Visualizer 
              problem={selectedProblem} 
              onClose={selectedProblem ? () => setView('coach') : () => setView('dashboard')} 
            />
          </div>
        </div>
      </main>

      {/* Stitched Footer */}
      <footer className="border-t border-zinc-900 border-dashed bg-zinc-950 px-4 py-5 text-center text-xs text-zinc-550 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Visualize IT. Interactive Algorithms Study Tool.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-400 transition cursor-help">[MemoryMap]</span>
            <span className="hover:text-zinc-400 transition cursor-help">[TraceEngine]</span>
            <span className="hover:text-zinc-400 transition cursor-help">[AST_Step]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

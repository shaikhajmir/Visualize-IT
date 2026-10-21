import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, AlertCircle, FileCode, CheckCircle, HelpCircle } from 'lucide-react';
import { executeTracer } from '../utils/compiler';

export default function Visualizer({ problem, onClose }) {
  const [code, setCode] = useState(problem ? problem.starterCode : `function solve(arr) {\n  let i = 0;\n  let j = arr.length - 1;\n  while (i < j) {\n    let temp = arr[i];\n    arr[i] = arr[j];\n    arr[j] = temp;\n    i++;\n    j--;\n  }\n  return arr;\n}`);
  
  const [presetInput, setPresetInput] = useState(
    problem && problem.presetInputs && problem.presetInputs.length > 0
      ? JSON.stringify(problem.presetInputs[0].params)
      : `[[5, 2, 9, 1, 5, 6]]`
  );
  
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(800); // ms per step
  const [returnValue, setReturnValue] = useState(null);
  const [isCompiled, setIsCompiled] = useState(false);

  const timerRef = useRef(null);
  const gutterRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync Gutter scroll with Textarea scroll
  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Prevent Tab key from shifting focus, insert 2 spaces instead
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const targetVal = e.target.value;
      const newValue = targetVal.substring(0, start) + "  " + targetVal.substring(end);
      setCode(newValue);
      setIsCompiled(false);
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Playback Loop
  useEffect(() => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, playbackSpeed]);

  const handleCompileAndRun = () => {
    setError(null);
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setSteps([]);
    setIsCompiled(false);

    let parsedParams;
    try {
      parsedParams = JSON.parse(presetInput);
      if (!Array.isArray(parsedParams)) {
        throw new Error("Input must be a JSON array of arguments.");
      }
    } catch (e) {
      setError(`Input Parsing Error: ${e.message}. Enter valid JSON, e.g. [[1, 2, 3], 9]`);
      return;
    }

    const result = executeTracer(code, parsedParams);
    if (!result.success) {
      setError(result.error);
    } else {
      setSteps(result.steps);
      setReturnValue(result.returnValue);
      setIsCompiled(true);
      if (result.steps.length > 0) {
        setCurrentStepIdx(0);
      } else {
        setError("Code executed, but no trace steps were generated. Check that the function arguments match the input.");
      }
    }
  };

  const handlePresetSelect = (preset) => {
    setPresetInput(JSON.stringify(preset.params));
    setIsCompiled(false);
    setSteps([]);
    setCurrentStepIdx(0);
  };

  const currentStep = steps[currentStepIdx];
  const currentState = currentStep ? currentStep.state : {};
  const currentLine = currentStep ? currentStep.line : -1;

  // Extract variables of different types for rendering
  const arrays = [];
  const linkedLists = [];
  const stacks = [];
  const maps = [];
  const primitives = [];
  
  // Custom pointer list (integers that represent indices of arrays)
  const pointers = {}; // arrayName -> array of { name, value }

  // Filter out variables that aren't actually index pointers (like target, count, temp values)
  const isPointerName = (name) => {
    const lower = name.toLowerCase();
    if (lower === 'i' || lower === 'j' || lower === 'k' || lower === 'p' || lower === 'q') return true;
    const keywords = ['left', 'right', 'low', 'high', 'mid', 'index', 'idx', 'ptr', 'pointer', 'head', 'tail', 'curr', 'prev', 'start', 'end', 'slow', 'fast'];
    return keywords.some(kw => lower.includes(kw));
  };

  // Analyze variables from trace state
  Object.entries(currentState).forEach(([varName, data]) => {
    if (data.type === 'Primitive') {
      primitives.push({ name: varName, value: data.value });
      
      // If primitive is a number AND matches pointer name convention, render it as an index pointer
      if (typeof data.value === 'number' && isPointerName(varName)) {
        if (!pointers['general']) pointers['general'] = [];
        pointers['general'].push({ name: varName, value: data.value });
      }
    } else if (data.type === 'Map' || data.type === 'Set') {
      maps.push({ name: varName, type: data.type, value: data.value });
    } else if (data.type === 'Object') {
      const val = data.value;
      if (Array.isArray(val)) {
        if (varName.toLowerCase().includes('stack')) {
          stacks.push({ name: varName, value: val });
        } else {
          arrays.push({ name: varName, value: val });
        }
      } else if (val && typeof val === 'object' && val.val !== undefined) {
        // Linked list node detection (having 'val' and 'next')
        const nodes = [];
        let currNode = val;
        let limit = 0;
        while (currNode && limit < 15) {
          nodes.push(currNode.val);
          currNode = currNode.next;
          limit++;
        }
        linkedLists.push({ name: varName, value: nodes, original: val });
      } else {
        primitives.push({ name: varName, value: JSON.stringify(val) });
      }
    }
  });

  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col animate-fade-in text-zinc-100">
      {/* Title Bar with Stitched design */}
      <div className="flex justify-between items-center border-b border-zinc-900 border-dashed pb-4 mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 font-mono">
            <span className="text-purple-400">⚡</span>
            {problem ? `[Trace: ${problem.title}]` : '[Visual Sandbox]'}
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            {problem ? `category: ${problem.id}` : 'Write JS code and animate variables in memory.'}
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-mono font-bold transition cursor-pointer text-zinc-300 hover:text-white"
          >
            [&larr; Exit Console]
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Code Editor & Setup */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          
          {/* Preset Inputs */}
          {problem && problem.presetInputs && (
            <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-lg p-3">
              <span className="text-[10px] font-bold font-mono text-zinc-500 block mb-2">// Select Preset Parameters:</span>
              <div className="flex flex-wrap gap-2">
                {problem.presetInputs.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(preset)}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850 hover:border-purple-800 hover:text-purple-300 font-semibold transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inputs Editor */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-lg p-3">
            <label className="text-[10px] font-bold font-mono text-zinc-500 block mb-1">
              // Parameters Array (JSON Format):
            </label>
            <input
              type="text"
              value={presetInput}
              onChange={(e) => {
                setPresetInput(e.target.value);
                setIsCompiled(false);
              }}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-md px-3 py-1.5 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-650 transition"
              placeholder="e.g. [[2, 7, 11, 15], 9]"
            />
          </div>

          {/* Code Editor Container */}
          <div className="flex-1 flex flex-col bg-zinc-900/10 border border-zinc-850 border-dashed rounded-lg min-h-[300px] overflow-hidden">
            <div className="bg-zinc-900/30 px-4 py-2.5 border-b border-zinc-850 border-dashed flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono text-zinc-400 flex items-center gap-1.5">
                <FileCode size={14} className="text-purple-400" />
                // source_code.js
              </span>
              <button
                onClick={handleCompileAndRun}
                className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-[10px] font-mono font-bold rounded-md text-white shadow transition-all cursor-pointer border border-purple-500/20"
              >
                [Compile & Run]
              </button>
            </div>
            
            {/* Interactive Code Editor (Fully editable textarea with scroll-synced line numbers) */}
            <div className="flex-1 flex bg-zinc-950/90 font-mono text-xs overflow-hidden h-full relative">
              
              {/* Line Numbers Gutter */}
              <div 
                ref={gutterRef}
                className="w-9 bg-zinc-900/60 text-zinc-600 select-none text-right pr-2 py-3 border-r border-zinc-900 overflow-y-hidden flex flex-col"
              >
                {lineNumbers.map(ln => {
                  const isCurrent = currentLine === ln;
                  return (
                    <div 
                      key={ln} 
                      style={{ height: '20px' }} 
                      className={`leading-[20px] pr-1 select-none text-[10px] ${
                        isCurrent 
                          ? 'text-purple-400 font-extrabold bg-purple-950/30 border-r-2 border-purple-500 -mr-2 pl-0.5' 
                          : ''
                      }`}
                    >
                      {ln}
                    </div>
                  );
                })}
              </div>
              
              {/* Textarea Code Input */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setIsCompiled(false);
                }}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-zinc-200 p-3 focus:outline-none resize-none h-full overflow-auto font-mono whitespace-pre leading-[20px] select-text"
                style={{ 
                  lineHeight: '20px', 
                  outline: 'none',
                  tabSize: 2
                }}
                spellCheck={false}
                placeholder="Type or paste JavaScript code here..."
              />
            </div>
          </div>

          {/* Compile Error Panel */}
          {error && (
            <div className="bg-red-950/10 border border-red-900/35 border-dashed rounded-lg p-3 flex gap-2 text-red-400 text-xs font-mono">
              <AlertCircle className="shrink-0 text-red-500" size={16} />
              <div>
                <span className="font-bold block mb-0.5">// Execution Alert:</span>
                <p className="font-sans leading-relaxed text-xs">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualizer Canvas & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          
          {/* Stepper Controls */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-lg p-3 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                disabled={!isCompiled || currentStepIdx === 0}
                onClick={() => setCurrentStepIdx(0)}
                className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-zinc-400 transition cursor-pointer"
                title="Reset"
              >
                <RotateCcw size={15} />
              </button>
              <button
                disabled={!isCompiled || currentStepIdx === 0}
                onClick={() => setCurrentStepIdx(p => Math.max(0, p - 1))}
                className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-zinc-400 transition cursor-pointer"
                title="Step backward"
              >
                <SkipBack size={15} />
              </button>
              <button
                disabled={!isCompiled || steps.length <= 1}
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/60 active:bg-purple-950 border border-purple-500/30 disabled:opacity-30 text-purple-300 transition cursor-pointer shadow-inner"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
              <button
                disabled={!isCompiled || currentStepIdx >= steps.length - 1}
                onClick={() => setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1))}
                className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-zinc-400 transition cursor-pointer"
                title="Step forward"
              >
                <SkipForward size={15} />
              </button>
            </div>

            {/* Step Counter */}
            <div className="text-xs font-bold text-zinc-450 font-mono">
              [step: {isCompiled ? `${currentStepIdx + 1}/${steps.length}` : '0/0'}]
            </div>

            {/* Play Speed slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">Speed:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-20 accent-purple-500 cursor-pointer h-1 bg-zinc-950 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-zinc-500 font-mono w-8">
                {Math.round(1000 / playbackSpeed)}x
              </span>
            </div>
          </div>

          {/* Visual Canvas Panel */}
          <div className="flex-1 bg-zinc-900/10 border border-zinc-850 border-dashed rounded-lg p-4 overflow-y-auto flex flex-col gap-6 min-h-[350px] bg-grid-stitch">
            {!isCompiled ? (
              <div className="flex-1 flex flex-col justify-center items-center text-zinc-550 gap-2.5 p-8 border border-dashed border-zinc-850 rounded-xl bg-zinc-950/20">
                <HelpCircle size={32} className="text-purple-950/70 animate-pulse" />
                <p className="font-mono font-bold text-xs">[Trace Idle]</p>
                <p className="text-[11px] font-mono text-zinc-550 text-center max-w-[280px]">
                  Hit compile to synthesize generator scopes and load interactive models.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* 1. Arrays Section with sliding bounce Pointer overlays */}
                {arrays.map((arr, arrIdx) => {
                  const pointerList = pointers['general'] || [];
                  
                  // Group pointers pointing to same indices
                  const pointersByIndex = {};
                  pointerList.forEach(p => {
                    const val = p.value;
                    if (val >= 0 && val < arr.value.length) {
                      if (!pointersByIndex[val]) pointersByIndex[val] = [];
                      pointersByIndex[val].push(p.name);
                    }
                  });

                  return (
                    <div key={arrIdx} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 border-dashed relative">
                      <div className="text-[10px] font-mono font-bold text-zinc-550 mb-4 uppercase tracking-wider flex justify-between border-b border-zinc-900 pb-2">
                        <span>Array: {arr.name}</span>
                        <span>[size: {arr.value.length}]</span>
                      </div>
                      
                      {/* Array Items Row (Non-wrapping for precise calculation) */}
                      <div className="flex items-center flex-nowrap gap-2 pt-2 pb-16 overflow-x-auto relative min-h-[120px]">
                        {arr.value.map((item, idx) => {
                          const activePointers = pointersByIndex[idx] || [];
                          const isElementHighlighted = activePointers.length > 0;
                          
                          return (
                            <div key={idx} className="relative flex flex-col items-center shrink-0">
                              {/* Box Element */}
                              <div className={`w-12 h-12 rounded-lg border flex flex-col justify-center items-center font-mono font-bold text-sm transition-all duration-300
                                ${isElementHighlighted 
                                  ? 'bg-purple-950/50 border-purple-500 text-purple-300 shadow-md scale-105 ring-1 ring-purple-500/20' 
                                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
                                }`}
                              >
                                {item}
                                <span className="absolute -top-5 text-[9px] font-mono text-zinc-650 font-semibold">
                                  {idx}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Sliding Pointers Overlay layer */}
                        {Object.entries(pointersByIndex).map(([idxStr, names]) => {
                          const idx = parseInt(idxStr, 10);
                          // Calculate left position: 48px box width + 8px gap = 56px
                          const leftPos = idx * 56;
                          
                          return (
                            <div 
                              key={idxStr}
                              className="absolute bottom-1.5 flex flex-col items-center dsa-element-transition"
                              style={{ 
                                left: `${leftPos}px`, 
                                width: '48px',
                              }}
                            >
                              <span className="text-purple-400 text-xs leading-none">▲</span>
                              <div className="flex flex-col gap-0.5 items-center mt-1">
                                {names.map((name, nIdx) => (
                                  <span 
                                    key={nIdx}
                                    className="text-[8px] font-mono bg-purple-900 border border-purple-750 text-purple-300 px-1.5 py-0.5 rounded font-extrabold shadow-sm leading-none"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Linked Lists Section */}
                {linkedLists.map((list, listIdx) => (
                  <div key={listIdx} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 border-dashed">
                    <div className="text-[10px] font-mono font-bold text-zinc-550 mb-3 uppercase tracking-wider border-b border-zinc-900 pb-2">
                      Linked List: {list.name}
                    </div>
                    <div className="flex items-center flex-wrap gap-1.5 overflow-x-auto py-2">
                      {list.value.map((val, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex items-center shrink-0">
                            <div className="h-10 px-3.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs shadow-inner">
                              {val}
                            </div>
                            {idx < list.value.length - 1 && (
                              <span className="text-purple-450 text-sm font-bold px-1.5 animate-pulse">&rarr;</span>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                      <span className="text-zinc-650 text-[10px] font-mono ml-2">[null]</span>
                    </div>
                  </div>
                ))}

                {/* 3. Stacks Section */}
                {stacks.map((stack, stackIdx) => (
                  <div key={stackIdx} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 border-dashed">
                    <div className="text-[10px] font-mono font-bold text-zinc-550 mb-3 uppercase tracking-wider border-b border-zinc-900 pb-2">
                      Stack: {stack.name} (LIFO)
                    </div>
                    {stack.value.length === 0 ? (
                      <div className="h-20 flex items-center justify-center border border-dashed border-zinc-800 rounded text-zinc-550 text-xs font-mono bg-zinc-950/20">
                        // Stack is empty
                      </div>
                    ) : (
                      <div className="flex flex-col-reverse max-w-[200px] border-x border-b border-zinc-800 rounded-b-md p-1 bg-zinc-900/60 gap-1 pt-4">
                        {stack.value.map((item, idx) => {
                          const isTop = idx === stack.value.length - 1;
                          return (
                            <div 
                              key={idx} 
                              className={`py-1.5 px-3 rounded text-center text-xs font-mono font-semibold transition-all duration-300 animate-fade-in
                                ${isTop 
                                  ? 'bg-purple-950 border border-purple-500 text-purple-300 font-extrabold' 
                                  : 'bg-zinc-800/40 text-zinc-555 border border-zinc-850'
                                }`}
                            >
                              {JSON.stringify(item)}
                              {isTop && <span className="text-[8px] font-mono block text-purple-400 font-bold mt-0.5">[Top]</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* 4. Maps & Sets Section */}
                {maps.map((map, mapIdx) => (
                  <div key={mapIdx} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 border-dashed">
                    <div className="text-[10px] font-mono font-bold text-zinc-550 mb-3 uppercase tracking-wider border-b border-zinc-900 pb-2">
                      {map.type}: {map.name}
                    </div>
                    {map.value.length === 0 ? (
                      <div className="text-zinc-650 text-xs font-mono italic">// Empty structure</div>
                    ) : (
                      <div className="overflow-hidden border border-zinc-800 rounded-lg max-w-xs">
                        <table className="min-w-full text-xs font-mono text-left">
                          <thead className="bg-zinc-900/80 text-zinc-550 uppercase text-[9px]">
                            <tr>
                              <th className="py-2 px-3">Key</th>
                              <th className="py-2 px-3">Val</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-850">
                            {map.value.map(([key, val], idx) => (
                              <tr key={idx} className="hover:bg-zinc-900/30">
                                <td className="py-2 px-3 text-purple-405 font-bold">{JSON.stringify(key)}</td>
                                <td className="py-2 px-3 text-emerald-450">{JSON.stringify(val)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}

                {/* 5. Return Value (Shown at final step) */}
                {currentStepIdx === steps.length - 1 && (
                  <div className="bg-emerald-950/15 border border-emerald-800/40 border-dashed rounded-xl p-4 flex gap-3 text-emerald-400 animate-fade-in shadow-sm font-mono">
                    <CheckCircle className="shrink-0 text-emerald-400 mt-0.5" size={16} />
                    <div>
                      <span className="font-bold text-xs block mb-1.5">// Execution Successful:</span>
                      <div className="text-xs">
                        return_value: <span className="font-mono bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 rounded text-white font-extrabold">{JSON.stringify(returnValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local Variables list */}
          {isCompiled && primitives.length > 0 && (
            <div className="bg-zinc-900/20 border border-zinc-805 border-dashed rounded-lg p-3">
              <span className="text-[10px] font-bold font-mono text-zinc-550 block mb-2 uppercase tracking-wider">
                // Environment variables
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {primitives.map((v, idx) => (
                  <div key={idx} className="bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-900 flex justify-between items-center text-xs">
                    <span className="font-mono text-zinc-500 font-bold">{v.name}:</span>
                    <span className="font-mono font-bold text-purple-400 truncate max-w-[80px]" title={JSON.stringify(v.value)}>
                      {v.value === undefined ? 'undefined' : JSON.stringify(v.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

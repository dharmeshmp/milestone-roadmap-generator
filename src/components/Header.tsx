import React from 'react';
import { Sliders, RotateCcw, Download } from 'lucide-react';

interface HeaderProps {
  handleResetToDefault: () => void;
  handleExportSVG: () => void;
}

export default function Header({ handleResetToDefault, handleExportSVG }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 shadow-lg relative z-20">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#1a235a] border border-[#2d3a82] text-teal-300 rounded-xl shadow-inner">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-display">Sprint Capacity &amp; Roadmap Studio</h1>
            <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 font-bold tracking-wider rounded-md uppercase border border-indigo-500/30">v1.2</span>
          </div>
          <p className="text-xs text-slate-400">Design, customize values, and capture high-resolution roadmap and team capacity graphics interactively</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button 
          onClick={handleResetToDefault}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:text-white transition flex items-center gap-1.5 active:scale-95"
          title="Reset to image reference state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Reference Mockup
        </button>
        
        <button 
          onClick={handleExportSVG}
          className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition flex items-center gap-1.5 active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export Vector SVG
        </button>
      </div>
    </header>
  );
}

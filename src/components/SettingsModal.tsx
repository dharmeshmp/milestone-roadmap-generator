import React from 'react';
import { X, Settings } from 'lucide-react';
import { GlobalConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalConfig: GlobalConfig;
  setGlobalConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  globalConfig,
  setGlobalConfig,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-display">Global Studio Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-850 hover:text-white transition active:scale-95 bg-transparent border-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Canvas background selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Canvas Grid Layout</label>
            <div className="grid grid-cols-2 gap-2">
              {['light', 'grid', 'dark', 'slate'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setGlobalConfig({ ...globalConfig, canvasBg: bg as any })}
                  className={`py-2 rounded-lg border text-xs capitalize transition ${
                    globalConfig.canvasBg === bg 
                      ? 'bg-slate-800 border-indigo-500/50 text-indigo-400 font-bold' 
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">Sets the background styling for both Roadmap and Team Capacity canvas boards.</p>
          </div>

          {/* Working hours per day */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Working Hours Per Dev (1 Day)</label>
            <input 
              type="number" 
              min={1} 
              max={24}
              value={globalConfig.workingHoursPerDay || 8}
              onChange={(e) => setGlobalConfig({ ...globalConfig, workingHoursPerDay: Math.max(1, Math.min(24, parseInt(e.target.value) || 8)) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">Used as the base daily capacity hours per engineer to compute percentage utilization dynamically.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-semibold active:scale-95 transition"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}

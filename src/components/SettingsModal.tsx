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
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-xl w-full max-w-md overflow-hidden shadow-xl relative z-10 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-100 font-display">Global Studio Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition active:scale-95 bg-transparent border-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Canvas background selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Preview Canvas Grid Layout</label>
            <div className="grid grid-cols-2 gap-2">
              {['light', 'grid', 'dark', 'slate'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setGlobalConfig({ ...globalConfig, canvasBg: bg as any })}
                  className={`py-2 rounded-lg border text-xs capitalize transition cursor-pointer ${
                    globalConfig.canvasBg === bg 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">Sets the background styling for both Roadmap and Team Capacity canvas boards.</p>
          </div>

          {/* Working hours per day */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Daily Working Hours Per Dev (1 Day)</label>
            <input 
              type="number" 
              min={1} 
              max={24}
              value={globalConfig.workingHoursPerDay || 8}
              onChange={(e) => setGlobalConfig({ ...globalConfig, workingHoursPerDay: Math.max(1, Math.min(24, parseInt(e.target.value) || 8)) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono"
            />
            <p className="text-[10px] text-zinc-500">Used as the base daily capacity hours per engineer to compute percentage utilization dynamically.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold border border-zinc-800 active:scale-98 transition cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}

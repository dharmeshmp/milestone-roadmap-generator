import React from 'react';
import { AlertTriangle, ClipboardList, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { Milestone, RoadmapConfig, IconType } from '../types';

interface RoadmapCanvasProps {
  milestones: Milestone[];
  config: RoadmapConfig;
  selectedMilestoneId: string | null;
  setSelectedMilestoneId: (id: string | null) => void;
}

export default function RoadmapCanvas({
  milestones,
  config,
  selectedMilestoneId,
  setSelectedMilestoneId,
}: RoadmapCanvasProps) {
  
  // Custom High-Fidelity Custom Rendered Icons for visual match
  const renderCustomIcon = (type: IconType) => {
    switch (type) {
      case 'lock':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-center text-amber-600 relative group-hover:scale-105 transition-transform">
            <div className="absolute top-1.5 w-4 h-4 rounded-t-full border-2 border-amber-600 border-b-0" />
            <div className="w-5 h-4 bg-amber-600 rounded-lg absolute bottom-2 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-50" />
            </div>
          </div>
        );
      case 'traffic-light':
        return (
          <div className="w-10 h-11 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between p-1 items-center gap-[1px] shadow-md group-hover:scale-105 transition-transform" title="Traffic Light Selector">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 shadow-sm flex items-center justify-center text-amber-500 relative group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6 fill-amber-300 stroke-amber-600 stroke-[2.5]" />
          </div>
        );
      case 'clipboard':
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 shadow-sm flex items-center justify-center text-orange-600 relative group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5 stroke-orange-700 stroke-[2]" />
            <span className="absolute top-1 bg-orange-700 w-3 h-1.5 rounded-sm" />
          </div>
        );
      case 'check':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600 relative group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5 stroke-emerald-600 stroke-[2.5]" />
          </div>
        );
      case 'calendar':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600 relative group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 stroke-sky-600 stroke-[2.5]" />
          </div>
        );
      case 'sparkles':
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 shadow-sm flex items-center justify-center text-indigo-600 relative group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 stroke-indigo-600 stroke-[2.5] fill-indigo-200" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id="milestones-roadmap-canvas"
      className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/60 overflow-hidden transform transition-all duration-300 hover:shadow-indigo-500/5"
    >
      
      {/* Image Title Header */}
      <div className="mb-8 relative pb-2 group">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1a235a]">
            {config.title.toUpperCase()}
          </h2>
        </div>
        {/* Thick accent bar matching exact design */}
        <div className="h-1 bg-[#dee4ff] w-full mt-2.5 rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-full bg-[#1a235a] rounded-full" />
        </div>
      </div>

      {/* Timeline Container Flow */}
      {milestones.length === 0 ? (
        <div className="py-20 text-center text-slate-400 italic font-medium">
          Create milestones in the editor on the left to begin your timeline.
        </div>
      ) : (
        <div className="relative pl-10 sm:pl-14 py-4 space-y-6">
          
          {/* Vertical axis bar line */}
          <div 
            className="absolute left-4 sm:left-6 top-0 bottom-0 w-1 rounded" 
            style={{ 
              backgroundColor: config.timelineColor, 
              width: '6px',
              transform: 'translateX(-50%)' 
            }}
          />

          {milestones.map((milestone, idx) => {
            const isSelected = milestone.id === selectedMilestoneId;
            const isHighlighted = milestone.isHighlighted;

            return (
              <div 
                key={milestone.id} 
                onClick={() => setSelectedMilestoneId(milestone.id)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                
                {/* Timeline Circle node */}
                <div 
                  className={`absolute left-[-34px] sm:left-[-41px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-[4px] flex items-center justify-center transition-all duration-300 z-10 ${
                    isHighlighted 
                      ? 'border-red-100 bg-red-500 shadow-md shadow-red-200 ring-2 ring-red-500/20' 
                      : 'border-[#dbe4ff] bg-[#1a235a]'
                  }`}
                />

                {/* Horizontal link bar connecting circle node to card */}
                <div 
                  className={`absolute left-[-20px] sm:left-[-22px] top-1/2 -translate-y-1/2 h-[3.5px] w-5 transition-all duration-300 ${
                    isHighlighted ? 'bg-red-500' : 'bg-[#1a235a]'
                  }`}
                />

                {/* Milestone Card Block */}
                <div 
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-2 transition-all gap-4 relative overflow-hidden shadow-sm ${
                    isSelected 
                      ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-lg' 
                      : ''
                  }`}
                  style={{ 
                    backgroundColor: config.cardBg, 
                    borderColor: isSelected ? '#3b82f6' : config.cardBorder 
                  }}
                >
                  
                  {/* Inner element container alignment */}
                  <div className="flex items-start gap-4">
                    
                    {/* Icon section */}
                    <div className="shrink-0 pt-0.5">
                      {renderCustomIcon(milestone.icon)}
                    </div>

                    {/* Core Texts info */}
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-base sm:text-lg text-[#1a235a] tracking-tight hover:text-[#2d3a82] transition leading-tight">
                        {milestone.title || 'Untitled Node'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-1">
                        {milestone.subtitle}
                      </p>

                      {/* Assignee badges listed horizontally below title */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {milestone.assignees.map((a) => (
                          <span 
                            key={a.id}
                            className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-sm flex items-center gap-1 select-none"
                            style={{ backgroundColor: a.color }}
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Status Indicator pill on far right */}
                  {!config.hideStatus && !milestone.hideStatus && (
                    <div className="shrink-0 flex items-center sm:justify-end">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold tracking-wider ${milestone.statusBg} ${milestone.statusText} uppercase shadow-sm border border-black/5`}>
                        {milestone.status || 'UPCOMING'}
                      </span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

import React from 'react';
import { TeamMember, CapacityConfig } from '../types';

interface CapacityCanvasProps {
  teamMembers: TeamMember[];
  selectedDeveloperIds: string[];
  capacityConfig: CapacityConfig;
  selectedTeamMemberId: string | null;
  setSelectedTeamMemberId: (id: string | null) => void;
}

export default function CapacityCanvas({
  teamMembers,
  selectedDeveloperIds,
  capacityConfig,
  selectedTeamMemberId,
  setSelectedTeamMemberId,
}: CapacityCanvasProps) {
  
  const activeMembers = teamMembers.filter(m => selectedDeveloperIds.includes(m.id));

  return (
    <div 
      id="team-capacity-canvas"
      className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-300 hover:shadow-indigo-500/5"
      style={{ 
        backgroundColor: capacityConfig.cardBg, 
        borderColor: capacityConfig.cardBorder,
        borderWidth: '2px',
        borderStyle: 'solid'
      }}
    >
      
      {/* Image Title Header */}
      <div className="mb-8 relative pb-2 group">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1a235a]">
            {capacityConfig.title.toUpperCase()}
          </h2>
        </div>
        {/* Thick accent bar matching exact design */}
        <div className="h-1 bg-[#dee4ff] w-full mt-2.5 rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-full bg-[#1a235a] rounded-full" />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr] sm:grid-cols-[1.8fr_1.5fr_1.5fr] gap-4 pb-3 border-b border-slate-200/60 text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">
        <div>Engineer</div>
        <div>Role</div>
        <div className="text-right">Utilisation</div>
      </div>

      {/* Team Members List */}
      <div className="mt-4 space-y-4">
        {activeMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            Select developers in the sidebar to visualize capacity.
          </div>
        ) : (
          activeMembers.map((member) => {
            const isSelected = member.id === selectedTeamMemberId;
            
            let barColor = 'bg-teal-600';
            let textColor = 'text-teal-600';
            let statusLabel = 'Available';
            if (member.utilization >= capacityConfig.orangeThreshold) {
              barColor = 'bg-rose-500';
              textColor = 'text-rose-600';
              statusLabel = 'At risk';
            } else if (member.utilization >= capacityConfig.greenThreshold) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-500';
              statusLabel = 'Busy';
            }

            return (
              <div
                key={member.id}
                onClick={() => setSelectedTeamMemberId(member.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-50/85 border-[#1a235a] shadow-md ring-2 ring-indigo-500/10' 
                    : 'bg-slate-50/30 border-transparent hover:bg-slate-50/60'
                }`}
              >
                <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr] sm:grid-cols-[1.8fr_1.5fr_1.5fr] gap-4 items-center mb-3">
                  <div className="font-bold text-sm text-slate-800 truncate">
                    {member.name}
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-[#4f46e5] text-[10px] font-extrabold uppercase tracking-wider">
                      {member.role}
                    </span>
                  </div>
                  <div className={`text-right font-mono font-extrabold text-sm ${textColor}`}>
                    {member.utilization}%
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(member.utilization, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>0%</span>
                    <span className={`font-semibold uppercase tracking-wider ${textColor}`}>{statusLabel}</span>
                    <span>100%+</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Threholds Legend Keys */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-start text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-teal-600 inline-block" />
          <span>Available (&lt;{capacityConfig.greenThreshold}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
          <span>Busy ({capacityConfig.greenThreshold}-{capacityConfig.orangeThreshold - 1}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
          <span>At risk (&gt;={capacityConfig.orangeThreshold}%)</span>
        </div>
      </div>

    </div>
  );
}

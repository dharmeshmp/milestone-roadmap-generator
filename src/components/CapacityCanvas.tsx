import React from 'react';
import { TeamMember, CapacityConfig } from '../types';
import { CanvasCard, CanvasHeader, DownloadButton, Badge, EmptyState } from './ui';
import { exportElement } from '@/lib/exportCanvas';

interface CapacityCanvasProps {
  teamMembers: TeamMember[];
  selectedDeveloperIds: string[];
  capacityConfig: CapacityConfig;
  selectedTeamMemberId: string | null;
  setSelectedTeamMemberId: (id: string | null) => void;
  capacityDates: string[];
}

export default function CapacityCanvas({
  teamMembers,
  selectedDeveloperIds,
  capacityConfig,
  selectedTeamMemberId,
  setSelectedTeamMemberId,
  capacityDates,
}: CapacityCanvasProps) {
  
  const activeMembers = teamMembers.filter(m => selectedDeveloperIds.includes(m.id));
  const groupSize = capacityConfig.groupSize || 0;

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    if (size <= 0) return [arr];
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const memberGroups = chunkArray(activeMembers, groupSize);

  const handleExportGroup = async (groupIndex: number, format: 'png' | 'svg') => {
    const displayTitle =
      groupSize > 0
        ? `${capacityConfig.title} - Group ${groupIndex + 1}`
        : capacityConfig.title;
    const fileName = displayTitle.toLowerCase().replace(/\s+/g, '_');
    await exportElement(`team-capacity-canvas-${groupIndex}`, fileName, format);
  };

  if (activeMembers.length === 0) {
    return (
      <CanvasCard
        className="text-slate-900"
        style={{ 
          backgroundColor: capacityConfig.cardBg, 
          borderColor: capacityConfig.cardBorder,
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
      >
        Select developers in the sidebar to visualize capacity.
      </CanvasCard>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {memberGroups.map((groupMembers, groupIndex) => {
        const displayTitle = groupSize > 0 
          ? `${capacityConfig.title} - Group ${groupIndex + 1}`
          : capacityConfig.title;

        return (
          <CanvasCard
            key={groupIndex}
            id={`team-capacity-canvas-${groupIndex}`}
            className="transition-all duration-300 hover:shadow-indigo-500/5"
            style={{ 
              backgroundColor: capacityConfig.cardBg, 
              borderColor: capacityConfig.cardBorder,
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
          >
            <CanvasHeader
              title={displayTitle}
              action={<DownloadButton onDownload={(format) => handleExportGroup(groupIndex, format)} />}
            >
              {capacityDates && capacityDates.length > 0 && (
                <span>Dates: {capacityDates.join(', ')} ({capacityDates.length * 8}h capacity)</span>
              )}
            </CanvasHeader>

            {/* Column Headers */}
            <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr] sm:grid-cols-[1.8fr_1.5fr_1.5fr] gap-4 pb-3 border-b border-slate-200/60 text-xs font-bold tracking-wider text-zinc-400 uppercase font-mono">
              <div>Engineer</div>
              <div>Role</div>
              <div className="text-right">Utilisation</div>
            </div>

            {/* Team Members List */}
            <div className="mt-3 space-y-3">
              {groupMembers.map((member) => {
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
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-55/80 border-[#1a235a] shadow-md ring-2 ring-indigo-500/10' 
                        : 'bg-slate-50/30 border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr] sm:grid-cols-[1.8fr_1.5fr_1.5fr] gap-4 items-center mb-3">
                      <div className="font-bold text-sm text-slate-800 truncate flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: member.color || '#2580eb' }}
                        />
                        <span>{member.name}</span>
                      </div>
                      <div>
                        <Badge variant="role">{member.role}</Badge>
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
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                        <span>0%</span>
                        <span className={`font-semibold uppercase tracking-wider ${textColor}`}>{statusLabel}</span>
                        <span>100%+</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thresholds Legend Keys */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-start text-xs font-semibold text-zinc-500">
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

          </CanvasCard>
        );
      })}
    </div>
  );
}

import React from 'react';
import { AlertTriangle, ClipboardList, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { Milestone, RoadmapConfig, TeamMember, IconType } from '../types';
import { CanvasCard, CanvasHeader, DownloadButton, Badge, EmptyState } from './ui';
import { exportElement } from '@/lib/exportCanvas';

interface RoadmapCanvasProps {
  milestones: Milestone[];
  config: RoadmapConfig;
  teamMembers: TeamMember[];
  selectedMilestoneId: string | null;
  setSelectedMilestoneId: (id: string | null) => void;
}

export default function RoadmapCanvas({
  milestones,
  config,
  teamMembers,
  selectedMilestoneId,
  setSelectedMilestoneId,
}: RoadmapCanvasProps) {
  
  // Custom High-Fidelity Custom Rendered Icons for visual match
  const renderCustomIcon = (type: IconType) => {
    switch (type) {
      case 'lock':
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-center text-amber-600 relative group-hover:scale-105 transition-transform">
            <div className="absolute top-1.5 w-4 h-4 rounded-t-full border-2 border-amber-600 border-b-0" />
            <div className="w-5 h-4 bg-amber-600 rounded-lg absolute bottom-2 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-50" />
            </div>
          </div>
        );
      case 'traffic-light':
        return (
          <div className="w-10 h-11 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between p-1 items-center gap-[1px] shadow-md group-hover:scale-105 transition-transform" title="Traffic Light Selector">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 shadow-sm flex items-center justify-center text-amber-500 relative group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6 fill-amber-300 stroke-amber-600 stroke-[2.5]" />
          </div>
        );
      case 'clipboard':
        return (
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 shadow-sm flex items-center justify-center text-orange-600 relative group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5 stroke-orange-700 stroke-[2]" />
            <span className="absolute top-1 bg-orange-700 w-3 h-1.5 rounded-sm" />
          </div>
        );
      case 'check':
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600 relative group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5 stroke-emerald-600 stroke-[2.5]" />
          </div>
        );
      case 'calendar':
        return (
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600 relative group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 stroke-sky-600 stroke-[2.5]" />
          </div>
        );
      case 'sparkles':
        return (
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 shadow-sm flex items-center justify-center text-indigo-600 relative group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 stroke-indigo-600 stroke-[2.5] fill-indigo-200" />
          </div>
        );
      default:
        return null;
    }
  };

  const groupSize = config.groupSize || 0;

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    if (size <= 0) return [arr];
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const milestoneGroups = chunkArray(milestones, groupSize);

  const handleExportGroup = async (groupIndex: number, format: 'png' | 'svg') => {
    const displayTitle =
      config.groupSize && config.groupSize > 0
        ? `${config.title} - Group ${groupIndex + 1}`
        : config.title;
    const fileName = displayTitle.toLowerCase().replace(/\s+/g, '_') + '_roadmap';
    await exportElement(`milestones-roadmap-canvas-${groupIndex}`, fileName, format);
  };



  return (
    <div className="flex flex-col gap-8 w-full">
      {milestoneGroups.map((groupMilestones, groupIndex) => {
        const displayTitle = groupSize > 0 
          ? `${config.title} - Group ${groupIndex + 1}`
          : config.title;

        return (
          <CanvasCard
            key={groupIndex}
            id={`milestones-roadmap-canvas-${groupIndex}`}
            className="transform transition-all duration-300 hover:shadow-indigo-500/5"
          >
            <CanvasHeader
              title={displayTitle}
              action={<DownloadButton onDownload={(format) => handleExportGroup(groupIndex, format)} />}
            />


            {/* Timeline Container Flow */}
            {groupMilestones.length === 0 ? (
              <EmptyState className="py-20 font-medium">
                Create milestones in the editor on the left to begin your timeline.
              </EmptyState>
            ) : (
              <div className="relative pl-12 py-2 space-y-5">
                
                {/* Vertical axis bar line */}
                <div 
                  className="absolute left-4 sm:left-6 top-0 bottom-0 w-1 rounded" 
                  style={{ 
                    backgroundColor: config.timelineColor, 
                    width: '6px',
                    transform: 'translateX(-50%)' 
                  }}
                />

                {groupMilestones.map((milestone, idx) => {
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
                        className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-2 transition-all gap-4 relative overflow-hidden shadow-sm ${
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
                            <p className="text-xs sm:text-sm text-zinc-500 font-semibold flex items-center gap-1">
                              {milestone.subtitle}
                            </p>

                            {/* Assignee badges listed horizontally below title */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {milestone.assignees.map((a) => {
                                const dev = teamMembers?.find(t => t.name.toLowerCase() === a.name.toLowerCase());
                                const badgeColor = dev ? dev.color : a.color;
                                return (
                                  <Badge key={a.id} variant="assignee" color={badgeColor}>
                                    {a.name}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Status Indicator pill on far right */}
                        {!config.hideStatus && !milestone.hideStatus && (
                          <div className="shrink-0 flex items-center sm:justify-end">
                            <Badge variant="status" className={`${milestone.statusBg} ${milestone.statusText}`}>
                              {milestone.status || 'UPCOMING'}
                            </Badge>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </CanvasCard>
        );
      })}
    </div>
  );
}

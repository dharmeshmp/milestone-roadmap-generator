import React from 'react';
import { Download } from 'lucide-react';
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

  const handleExportGroupSVG = (groupIndex: number, groupMembers: TeamMember[]) => {
    const rowHeight = 70;
    const padding = 35;
    const headerHeight = 75;
    const colHeaderHeight = 22;
    const legendHeight = 55;
    const totalWidth = 520;
    const totalHeight = headerHeight + colHeaderHeight + (groupMembers.length * rowHeight) + legendHeight + padding;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="background-color: white; font-family: 'Inter', system-ui, sans-serif;">`;
    
    svgContent += `
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
          text { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
          .title { font-weight: 700; fill: #1a235a; letter-spacing: 0.05em; font-size: 15px; }
          .col-header { font-weight: 700; fill: #828fa7; font-size: 11px; letter-spacing: 0.03em; }
          .member-name { font-weight: 700; fill: #0f172a; font-size: 13px; }
          .role-badge-rect { fill: #eef2ff; }
          .role-text { font-weight: 600; fill: #4f46e5; fill-opacity: 0.95; font-size: 10px; }
          .util-text { font-weight: 700; font-size: 13px; }
          .legend-text { font-weight: 600; fill: #475569; font-size: 11px; }
        </style>
      </defs>
    `;

    // Outer Card border & background
    svgContent += `
      <rect width="${totalWidth}" height="${totalHeight}" rx="14" fill="${capacityConfig.cardBg || '#ffffff'}" stroke="${capacityConfig.cardBorder || '#dee5f7'}" stroke-width="2" />
    `;

    // 1. Header Section
    const displayTitle = groupSize > 0 
      ? `${capacityConfig.title} - Group ${groupIndex + 1}`
      : capacityConfig.title;

    svgContent += `
      <g transform="translate(${padding}, 40)">
        <text y="0" class="title">${displayTitle.toUpperCase()}</text>
        <line x1="0" y1="12" x2="${totalWidth - padding * 2}" y2="12" stroke="#e2e8f0" stroke-width="2" />
      </g>
    `;

    // 2. Tabular Column Headers
    const colY = headerHeight + 10;
    svgContent += `
      <g transform="translate(${padding}, ${colY})">
        <text x="0" y="0" class="col-header">Engineer</text>
        <text x="145" y="0" class="col-header">Role</text>
        <text x="${totalWidth - padding * 2}" y="0" text-anchor="end" class="col-header">Utilisation</text>
      </g>
    `;

    // 3. Render members list
    const listStartY = colY + 15;
    groupMembers.forEach((member, index) => {
      const itemY = listStartY + index * rowHeight;
      
      let color = '#0d9488'; // green (Available)
      if (member.utilization >= capacityConfig.orangeThreshold) {
        color = '#e11d48'; // red (At risk)
      } else if (member.utilization >= capacityConfig.greenThreshold) {
        color = '#d97706'; // orange/amber (Busy)
      }

      svgContent += `
        <g transform="translate(${padding}, ${itemY})">
          <rect x="0" y="2" width="${totalWidth - padding * 2}" height="56" rx="8" fill="#f8fafc" fill-opacity="0.6" />
          
          <!-- Colored dot badge indicator -->
          <circle cx="15" cy="28" r="5" fill="${member.color || '#2580eb'}" />
          <text x="28" y="32" class="member-name">${member.name}</text>
          
          <rect x="145" y="18" width="105" height="20" rx="6" class="role-badge-rect" />
          <text x="197" y="31" text-anchor="middle" class="role-text">${member.role.toUpperCase()}</text>
          
          <text x="${totalWidth - padding * 2 - 10}" y="32" text-anchor="end" class="util-text" fill="${color}">${member.utilization}%</text>
          
          <rect x="10" y="46" width="${totalWidth - padding * 2 - 20}" height="6" rx="3" fill="#e2e8f0" />
          <rect x="10" y="46" width="${((totalWidth - padding * 2 - 20) * Math.min(member.utilization, 100)) / 100}" height="6" rx="3" fill="${color}" />
        </g>
      `;
    });

    // 4. Color Threshold Legend Keys
    const finalY = totalHeight - legendHeight + 10;
    svgContent += `
      <g transform="translate(${padding}, ${finalY})">
        <rect x="0" y="0" width="14" height="14" rx="3" fill="#0d9488" />
        <text x="20" y="11" class="legend-text">Available (&lt;${capacityConfig.greenThreshold}%)</text>
        
        <rect x="150" y="0" width="14" height="14" rx="3" fill="#d97706" />
        <text x="170" y="11" class="legend-text">Busy (${capacityConfig.greenThreshold}-${capacityConfig.orangeThreshold - 1}%)</text>
        
        <rect x="300" y="0" width="14" height="14" rx="3" fill="#e11d48" />
        <text x="320" y="11" class="legend-text">At risk (&gt;=${capacityConfig.orangeThreshold}%)</text>
      </g>
    `;

    svgContent += `</svg>`;

    // Initiate download
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${displayTitle.toLowerCase().replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (activeMembers.length === 0) {
    return (
      <div 
        className="bg-white text-slate-900 rounded-3xl p-12 text-center text-slate-400 italic border border-slate-200"
        style={{ backgroundColor: capacityConfig.cardBg, borderColor: capacityConfig.cardBorder, borderWidth: '2px' }}
      >
        Select developers in the sidebar to visualize capacity.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {memberGroups.map((groupMembers, groupIndex) => {
        const displayTitle = groupSize > 0 
          ? `${capacityConfig.title} - Group ${groupIndex + 1}`
          : capacityConfig.title;

        return (
          <div 
            key={groupIndex}
            id={`team-capacity-canvas-${groupIndex}`}
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-300 hover:shadow-indigo-500/5 relative"
            style={{ 
              backgroundColor: capacityConfig.cardBg, 
              borderColor: capacityConfig.cardBorder,
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
          >
            
            {/* Image Title Header */}
            <div className="mb-8 relative pb-2 group">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1a235a]">
                  {displayTitle.toUpperCase()}
                </h2>
                <button
                  type="button"
                  onClick={() => handleExportGroupSVG(groupIndex, groupMembers)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition active:scale-95 cursor-pointer border border-indigo-100/60"
                  title="Download this card as SVG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
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
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
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
              })}
            </div>

            {/* Thresholds Legend Keys */}
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
      })}
    </div>
  );
}

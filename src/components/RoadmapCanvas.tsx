import React from 'react';
import { AlertTriangle, ClipboardList, Calendar, CheckSquare, Sparkles, Download } from 'lucide-react';
import { Milestone, RoadmapConfig, TeamMember, IconType } from '../types';

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

  const handleExportGroupSVG = (groupIndex: number, groupMilestones: Milestone[]) => {
    const cardHeight = 110;
    const cardGap = 25;
    const padding = 40;
    const headerHeight = 70;
    const totalHeight = headerHeight + padding + (groupMilestones.length * (cardHeight + cardGap)) + padding;
    const totalWidth = 650;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="background-color: white; font-family: 'Inter', system-ui, sans-serif;">`;
    
    svgContent += `
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
          text { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
          .title { font-weight: 700; fill: #1e293b; letter-spacing: -0.025em; font-size: 19px; }
          .card-title { font-weight: 700; fill: #1a235a; font-size: 15px; }
          .card-sub { font-weight: 500; fill: #64748b; font-size: 12px; }
          .badge-text { font-weight: 700; fill: #ffffff; font-size: 10px; letter-spacing: 0.05em; }
          .pill-text { font-weight: 600; fill: #ffffff; font-size: 10px; }
        </style>
      </defs>
    `;

    const displayTitle = config.groupSize && config.groupSize > 0 
      ? `${config.title} - Group ${groupIndex + 1}`
      : config.title;

    svgContent += `
      <g transform="translate(${padding}, 40)">
        <text y="0" class="title">${displayTitle.toUpperCase()}</text>
        <line x1="0" y1="12" x2="${totalWidth - padding * 2}" y2="12" stroke="#dee5f7" stroke-width="4" stroke-linecap="round"/>
      </g>
    `;

    const timelineX = padding + 40;
    const timelineStartY = headerHeight + 10;
    const timelineEndY = totalHeight - 30;
    
    svgContent += `
      <line x1="${timelineX}" y1="${timelineStartY}" x2="${timelineX}" y2="${timelineEndY}" stroke="${config.timelineColor}" stroke-width="6" stroke-linecap="round"/>
    `;

    groupMilestones.forEach((m, idx) => {
      const topOffset = timelineStartY + idx * (cardHeight + cardGap) + cardHeight/2;
      const cardX = timelineX + 32;
      const cardY = topOffset - cardHeight/2;
      const cardWidth = totalWidth - cardX - padding;
      
      const isHighlighted = m.isHighlighted;
      const connectorColor = isHighlighted ? '#ef4444' : '#1a235a';
      const nodeColor = isHighlighted ? '#ef4444' : '#1a235a';
      const nodeRingColor = isHighlighted ? '#fee2e2' : '#ccd9ff';

      svgContent += `
        <line x1="${timelineX}" y1="${topOffset}" x2="${cardX}" y2="${topOffset}" stroke="${connectorColor}" stroke-width="4"/>
      `;

      svgContent += `
        <circle cx="${timelineX}" cy="${topOffset}" r="12" fill="${nodeRingColor}"/>
        <circle cx="${timelineX}" cy="${topOffset}" r="8" fill="${nodeColor}"/>
      `;

      svgContent += `
        <g transform="translate(${cardX}, ${cardY})">
          <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="${config.cardBg}" stroke="${config.cardBorder}" stroke-width="1.5" />
      `;

      const iconX = 18;
      const iconY = cardHeight/2 - 18;
      
      if (m.icon === 'lock') {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#fef3c7" stroke="#fde68a" stroke-width="1"/>
            <path d="M12 17a3 3 0 0 1 6 0" stroke="#d97706" stroke-width="2" fill="none"/>
            <rect x="11" y="20" width="14" height="10" rx="2" fill="#d97706" />
            <circle cx="18" cy="24" r="1.5" fill="#ffffff" />
            <path d="M18 25v3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
          </g>
        `;
      } else if (m.icon === 'traffic-light') {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
            <rect x="13" y="6" width="10" height="24" rx="5" fill="#0f172a" />
            <circle cx="18" cy="11" r="3" fill="#ef4444" />
            <circle cx="18" cy="18" r="3" fill="#fbbf24" />
            <circle cx="18" cy="25" r="3" fill="#22c55e" />
          </g>
        `;
      } else if (m.icon === 'warning') {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#fef3c7" stroke="#fde68a" stroke-width="1"/>
            <path d="M18 6l13 22H5L18 6z" fill="#f59e0b" />
            <path d="M18 13v6" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="18" cy="23" r="1.5" fill="#ffffff"/>
          </g>
        `;
      } else if (m.icon === 'clipboard') {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#ffedd5" stroke="#fed7aa" stroke-width="1"/>
            <rect x="11" y="10" width="14" height="18" rx="2" fill="#eaeaea" stroke="#c0522b" stroke-width="1.5"/>
            <rect x="14" y="8" width="8" height="4" rx="1" fill="#c0522b" />
            <line x1="14" y1="16" x2="22" y2="16" stroke="#475569" stroke-width="1.5"/>
            <line x1="14" y1="20" x2="20" y2="20" stroke="#475569" stroke-width="1.5"/>
          </g>
        `;
      } else if (m.icon === 'check') {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#d1fae5" stroke="#a7f3d0" stroke-width="1"/>
            <circle cx="18" cy="18" r="10" fill="#10b981" />
            <path d="M14 18l3 3 6-6" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </g>
        `;
      } else {
        svgContent += `
          <g transform="translate(${iconX}, ${iconY})">
            <rect x="0" y="0" width="36" height="36" rx="8" fill="#e0f2fe" stroke="#bae6fd" stroke-width="1"/>
            <path d="M18 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#0284c7" />
          </g>
        `;
      }

      const textX = iconX + 48;
      svgContent += `
        <text x="${textX}" y="28" class="card-title">${m.title}</text>
        <text x="${textX}" y="47" class="card-sub">${m.subtitle}</text>
      `;

      if (!config.hideStatus && !m.hideStatus) {
        const statusWidth = 90;
        const statusHeight = 28;
        const statusX = cardWidth - statusWidth - 18;
        const statusY = cardHeight/2 - statusHeight/2;
        
        let statusFill = '#1a235a';
        if (m.statusBg.includes('emerald')) statusFill = '#059669';
        else if (m.statusBg.includes('amber')) statusFill = '#f59e0b';
        else if (m.statusBg.includes('red')) statusFill = '#dc2626';
        else if (m.statusBg.includes('slate')) statusFill = '#cbd5e1';

        svgContent += `
          <rect x="${statusX}" y="${statusY}" width="${statusWidth}" height="${statusHeight}" rx="8" fill="${statusFill}" />
          <text x="${statusX + statusWidth/2}" y="${statusY + 17}" text-anchor="middle" class="badge-text" fill="${m.statusText.includes('black') ? '#000000' : '#ffffff'}">${m.status.toUpperCase()}</text>
        `;
      }

      let assigneeX = textX;
      const assigneeY = 64;
      m.assignees.forEach((a) => {
        const tagWidth = a.name.length * 6 + 22;
        const tagHeight = 22;
        const dev = teamMembers.find(t => t.name.toLowerCase() === a.name.toLowerCase());
        const badgeColor = dev ? dev.color : a.color;
        
        svgContent += `
          <g transform="translate(${assigneeX}, ${assigneeY})">
            <rect width="${tagWidth}" height="${tagHeight}" rx="6" fill="${badgeColor}" />
            <text x="${tagWidth/2}" y="14" text-anchor="middle" class="pill-text" fill="#ffffff">${a.name}</text>
          </g>
        `;
        assigneeX += tagWidth + 8;
      });

      svgContent += `</g>`;
    });

    svgContent += `</svg>`;

    // Initiate download
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${displayTitle.toLowerCase().replace(/\s+/g, '_')}_roadmap.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {milestoneGroups.map((groupMilestones, groupIndex) => {
        const displayTitle = groupSize > 0 
          ? `${config.title} - Group ${groupIndex + 1}`
          : config.title;

        return (
          <div 
            key={groupIndex}
            id={`milestones-roadmap-canvas-${groupIndex}`}
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/60 overflow-hidden transform transition-all duration-300 hover:shadow-indigo-500/5 relative"
          >
            
            {/* Image Title Header */}
            <div className="mb-8 relative pb-2 group">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1a235a]">
                  {displayTitle.toUpperCase()}
                </h2>
                {groupSize > 0 && (
                  <button
                    type="button"
                    onClick={() => handleExportGroupSVG(groupIndex, groupMilestones)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition active:scale-98 cursor-pointer border border-indigo-100/60"
                    title="Download this roadmap card as SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>
                )}
              </div>
              {/* Thick accent bar matching exact design */}
              <div className="h-1 bg-[#dee4ff] w-full mt-2.5 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-full bg-[#1a235a] rounded-full" />
              </div>
            </div>

            {/* Timeline Container Flow */}
            {groupMilestones.length === 0 ? (
              <div className="py-20 text-center text-zinc-400 italic font-medium">
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
                                  <span 
                                    key={a.id}
                                    className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-sm flex items-center gap-1 select-none"
                                    style={{ backgroundColor: badgeColor }}
                                  >
                                    {a.name}
                                  </span>
                                );
                              })}
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
      })}
    </div>
  );
}

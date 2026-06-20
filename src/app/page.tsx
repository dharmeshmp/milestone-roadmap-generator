"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  FileText, 
  Info, 
  Settings, 
  Code, 
  Sparkles,
  Lock,
  AlertTriangle,
  ClipboardList,
  Calendar,
  CheckSquare,
  RefreshCw,
  Sliders,
  Layers,
  Heart,
  Users
} from 'lucide-react';
import { Milestone, RoadmapConfig, IconType, Assignee, TeamMember, CapacityConfig } from '../types';
import { INITIAL_MILESTONES, DEFAULT_CONFIG, INITIAL_TEAM_MEMBERS, DEFAULT_CAPACITY_CONFIG } from '../initialData';
import { 
  getDevelopers, 
  addDeveloper, 
  updateDeveloper, 
  deleteDeveloper, 
  reorderDevelopers,
  resetDevelopers
} from './actions/developers';

// Color Presets for assignees
const ASSIGNEE_COLORS = [
  { name: 'Red', value: '#db3e3e' },
  { name: 'Amber/Orange', value: '#e28a2a' },
  { name: 'Blue', value: '#2580eb' },
  { name: 'Emerald Green', value: '#16a34a' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Indigo/Purple', value: '#4f46e5' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Brown/Terracotta', value: '#c0522b' },
  { name: 'Dark Slate', value: '#475569' }
];

// Presets for status background colors
const STATUS_COLORS = [
  { name: 'Dark Navy', bg: 'bg-[#1a235a]', text: 'text-white' },
  { name: 'Vibrant Emerald', bg: 'bg-emerald-600', text: 'text-white' },
  { name: 'Amber Warning', bg: 'bg-amber-500', text: 'text-black' },
  { name: 'Crimson Red', bg: 'bg-red-600', text: 'text-white' },
  { name: 'Cloud Slate', bg: 'bg-slate-200', text: 'text-slate-800' }
];

function App() {
  // Main reactive states
  const [appMode, setAppMode] = useState<'roadmap' | 'capacity'>(() => {
    const saved = localStorage.getItem('applet_visual_mode');
    return (saved as 'roadmap' | 'capacity') || 'roadmap';
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('milestones_data');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [config, setConfig] = useState<RoadmapConfig>(() => {
    const saved = localStorage.getItem('milestones_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<string[]>([]);

  const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>(() => {
    const saved = localStorage.getItem('capacity_config_data');
    return saved ? JSON.parse(saved) : DEFAULT_CAPACITY_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'json' | 'styles' | 'developers'>('editor');
  
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(() => {
    return INITIAL_MILESTONES.length > 0 ? INITIAL_MILESTONES[0].id : null;
  });

  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);

  // State for raw JSON text input
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneeColor, setNewAssigneeColor] = useState(ASSIGNEE_COLORS[0].value);
  
  // States for Team Capacity Member editing
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Associate');
  const [newMemberUtil, setNewMemberUtil] = useState<number>(85);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('applet_visual_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('milestones_data', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('milestones_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('capacity_config_data', JSON.stringify(capacityConfig));
  }, [capacityConfig]);

  // Load team members from SQLite on mount
  useEffect(() => {
    getDevelopers().then((data) => {
      if (data && data.length > 0) {
        setTeamMembers(data);
        setSelectedDeveloperIds(data.map(m => m.id));
        setSelectedTeamMemberId(prev => prev === null || !data.some(m => m.id === prev) ? data[0].id : prev);
      } else {
        setTeamMembers(INITIAL_TEAM_MEMBERS);
        setSelectedDeveloperIds(INITIAL_TEAM_MEMBERS.map(m => m.id));
        setSelectedTeamMemberId(INITIAL_TEAM_MEMBERS[0].id);
      }
    });
  }, []);

  // Sync state to JSON text input based on active mode
  useEffect(() => {
    if (appMode === 'roadmap') {
      setJsonText(JSON.stringify({ config, milestones }, null, 2));
    } else {
      setJsonText(JSON.stringify({ config: capacityConfig, teamMembers }, null, 2));
    }
  }, [milestones, config, teamMembers, capacityConfig, appMode]);

  // Helper to trigger transient banner notifications
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- HANDLERS FOR MILESTONES ---
  
  const handleAddMilestone = () => {
    const newId = Date.now().toString();
    const newMilestone: Milestone = {
      id: newId,
      title: 'New Milestone Stage',
      subtitle: '[24 June]',
      icon: 'lock',
      status: 'UPCOMING',
      statusBg: 'bg-[#1a235a]',
      statusText: 'text-white',
      isHighlighted: false,
      assignees: [
        { id: `${newId}-1`, name: 'Assignee', color: ASSIGNEE_COLORS[2].value }
      ]
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    setSelectedMilestoneId(newId);
    showNotification('Added new milestone milestone card!');
  };

  const handleDeleteMilestone = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const filtered = milestones.filter(m => m.id !== id);
    setMilestones(filtered);
    if (selectedMilestoneId === id) {
      setSelectedMilestoneId(filtered.length > 0 ? filtered[0].id : null);
    }
    showNotification('Milestone removed', 'error');
  };

  const handleUpdateMilestone = <K extends keyof Milestone>(id: string, key: K, value: Milestone[K]) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m));
  };

  const handleMoveMilestone = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === milestones.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const result = [...milestones];
    const [removed] = result.splice(index, 1);
    result.splice(targetIndex, 0, removed);
    
    setMilestones(result);
    showNotification(`Moved milestone ${direction}`);
  };

  // --- HANDLERS FOR ASSIGNEES ---
  
  const handleAddAssignee = (milestoneId: string) => {
    if (!newAssigneeName.trim()) {
      showNotification('Assignee name cannot be empty', 'error');
      return;
    }
    const currentMilestone = milestones.find(m => m.id === milestoneId);
    if (!currentMilestone) return;

    const newAssignee: Assignee = {
      id: Date.now().toString(),
      name: newAssigneeName.trim(),
      color: newAssigneeColor
    };

    const updatedAssignees = [...currentMilestone.assignees, newAssignee];
    handleUpdateMilestone(milestoneId, 'assignees', updatedAssignees);
    setNewAssigneeName('');
    showNotification(`Assigned ${newAssignee.name} to card!`);
  };

  const handleRemoveAssignee = (milestoneId: string, assigneeId: string) => {
    const currentMilestone = milestones.find(m => m.id === milestoneId);
    if (!currentMilestone) return;

    const updatedAssignees = currentMilestone.assignees.filter(a => a.id !== assigneeId);
    handleUpdateMilestone(milestoneId, 'assignees', updatedAssignees);
    showNotification('Assignee removed', 'error');
  };

  // --- HANDLERS FOR TEAM MEMBERS ---
  const handleAddTeamMember = () => {
    if (!newMemberName.trim()) {
      showNotification('Member name cannot be empty', 'error');
      return;
    }
    const newId = `tm-${Date.now()}`;
    const newMember: TeamMember = {
      id: newId,
      name: newMemberName.trim(),
      role: newMemberRole,
      utilization: newMemberUtil
    };
    
    addDeveloper(newMember).then((success) => {
      if (success) {
        setTeamMembers([...teamMembers, newMember]);
        setSelectedTeamMemberId(newId);
        setNewMemberName('');
        showNotification(`Added team member ${newMember.name}!`);
      } else {
        showNotification('Failed to add team member to database', 'error');
      }
    });
  };

  const handleUpdateTeamMember = <K extends keyof TeamMember>(id: string, key: K, value: TeamMember[K]) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;
    const updatedMember = { ...member, [key]: value };
    
    setTeamMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    
    updateDeveloper(updatedMember).then((success) => {
      if (!success) {
        showNotification('Failed to update team member in database', 'error');
      }
    });
  };

  const handleDeleteTeamMember = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    deleteDeveloper(id).then((success) => {
      if (success) {
        const filtered = teamMembers.filter(m => m.id !== id);
        setTeamMembers(filtered);
        if (selectedTeamMemberId === id) {
          setSelectedTeamMemberId(filtered.length > 0 ? filtered[0].id : null);
        }
        showNotification('Member removed', 'error');
      } else {
        showNotification('Failed to delete team member from database', 'error');
      }
    });
  };

  const handleMoveTeamMember = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === teamMembers.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const result = [...teamMembers];
    const [removed] = result.splice(index, 1);
    result.splice(targetIndex, 0, removed);
    
    setTeamMembers(result);
    
    const orderedIds = result.map(m => m.id);
    reorderDevelopers(orderedIds).then((success) => {
      if (success) {
        showNotification(`Moved member ${direction}`);
      } else {
        showNotification('Failed to save order to database', 'error');
      }
    });
  };

  // --- HANDLERS FOR JSON CONFIG ---
  
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object') {
        if (appMode === 'roadmap') {
          if (parsed.config) setConfig(parsed.config);
          if (Array.isArray(parsed.milestones)) setMilestones(parsed.milestones);
        } else {
          if (parsed.config) setCapacityConfig(parsed.config);
          if (Array.isArray(parsed.teamMembers)) setTeamMembers(parsed.teamMembers);
        }
        setJsonError(null);
      }
    } catch (err: any) {
      setJsonError(err.message || 'Syntax Error in JSON format');
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification('Configuration copied to clipboard!');
  };

  const handleResetToDefault = () => {
    if (appMode === 'roadmap') {
      setMilestones(INITIAL_MILESTONES);
      setConfig(DEFAULT_CONFIG);
      setSelectedMilestoneId(INITIAL_MILESTONES[0].id);
      showNotification('Reset roadmap to mockup reference values');
    } else {
      resetDevelopers(INITIAL_TEAM_MEMBERS).then((success) => {
        if (success) {
          setTeamMembers(INITIAL_TEAM_MEMBERS);
          setCapacityConfig(DEFAULT_CAPACITY_CONFIG);
          setSelectedTeamMemberId(INITIAL_TEAM_MEMBERS[0].id);
          showNotification('Reset team capacity to mockup reference values');
        } else {
          showNotification('Failed to reset developers database', 'error');
        }
      });
    }
  };

  // --- EXPORT HIGH-FIDELITY VECTOR SVG ---
  const handleExportSVG = () => {
    if (appMode === 'roadmap') {
      // Roadmap export
      const cardHeight = 110;
      const cardGap = 25;
      const padding = 40;
      const headerHeight = 70;
      const totalHeight = headerHeight + padding + (milestones.length * (cardHeight + cardGap)) + padding;
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

      svgContent += `
        <g transform="translate(${padding}, 40)">
          <text y="0" class="title">${config.title.toUpperCase()}</text>
          <line x1="0" y1="12" x2="${totalWidth - padding * 2}" y2="12" stroke="#dee5f7" stroke-width="4" stroke-linecap="round"/>
        </g>
      `;

      const timelineX = padding + 40;
      const timelineStartY = headerHeight + 10;
      const timelineEndY = totalHeight - 30;
      
      svgContent += `
        <line x1="${timelineX}" y1="${timelineStartY}" x2="${timelineX}" y2="${timelineEndY}" stroke="${config.timelineColor}" stroke-width="6" stroke-linecap="round"/>
      `;

      milestones.forEach((m, idx) => {
        const topOffset = timelineStartY + idx * (cardHeight + cardGap) + cardHeight/2;
        const cardX = timelineX + 32;
        const cardY = topOffset - cardHeight/2;
        const cardWidth = totalWidth - cardX - padding;
        
        const isHighlighted = m.isHighlighted;
        const connectorColor = isHighlighted ? '#ef4444' : '#1a235b';
        const nodeColor = isHighlighted ? '#ef4444' : '#1a235b';
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
          
          svgContent += `
            <g transform="translate(${assigneeX}, ${assigneeY})">
              <rect width="${tagWidth}" height="${tagHeight}" rx="6" fill="${a.color}" />
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
      link.download = `${config.title.toLowerCase().replace(/\s+/g, '_')}_roadmap.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Success: Downloaded roadmap as vector SVG!');
    } else {
      // Team Capacity visualizer export
      const rowHeight = 70;
      const padding = 35;
      const headerHeight = 75;
      const colHeaderHeight = 22;
      const legendHeight = 55;
      const totalWidth = 520;
      const activeMembers = teamMembers.filter(m => selectedDeveloperIds.includes(m.id));
      const totalHeight = headerHeight + colHeaderHeight + (activeMembers.length * rowHeight) + legendHeight + padding;

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
        <rect width="${totalWidth}" height="${totalHeight}" rx="14" fill="${capacityConfig.cardBg}" stroke="${capacityConfig.cardBorder}" stroke-width="2" />
      `;

      // 1. Header Section
      svgContent += `
        <g transform="translate(${padding}, 40)">
          <text y="0" class="title">${capacityConfig.title.toUpperCase()}</text>
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

      // 3. Render members list inside individual cards (or layout blocks)
      const listStartY = colY + 15;
      activeMembers.forEach((member, index) => {
        const itemY = listStartY + index * rowHeight;
        
        let color = '#0d9488'; // green (Available)
        if (member.utilization >= capacityConfig.orangeThreshold) {
          color = '#e11d48'; // red (At risk)
        } else if (member.utilization >= capacityConfig.greenThreshold) {
          color = '#d97706'; // orange/amber (Busy)
        }

        svgContent += `
          <g transform="translate(${padding}, ${itemY})">
            <!-- Backdrop sub-panel match -->
            <rect x="0" y="2" width="${totalWidth - padding * 2}" height="56" rx="8" fill="#f8fafc" fill-opacity="0.6" />
            
            <text x="10" y="26" class="member-name">${member.name}</text>
            
            <!-- Specialist/Associate role pill -->
            <rect x="145" y="12" width="105" height="20" rx="6" class="role-badge-rect" />
            <text x="197" y="25" text-anchor="middle" class="role-text">${member.role.toUpperCase()}</text>
            
            <text x="${totalWidth - padding * 2 - 10}" y="26" text-anchor="end" class="util-text" fill="${color}">${member.utilization}%</text>
            
            <!-- Progress tracks -->
            <rect x="10" y="40" width="${totalWidth - padding * 2 - 20}" height="10" rx="5" fill="#e2e8f0" />
            <rect x="10" y="40" width="${((totalWidth - padding * 2 - 20) * Math.min(member.utilization, 100)) / 100}" height="10" rx="5" fill="${color}" />
          </g>
        `;
      });

      // 4. Color Threshold Legend Keys
      const finalY = totalHeight - legendHeight + 10;
      svgContent += `
        <g transform="translate(${padding}, ${finalY})">
          <!-- Green key -->
          <rect x="0" y="0" width="14" height="14" rx="3" fill="#0d9488" />
          <text x="20" y="11" class="legend-text">Available (&lt;${capacityConfig.greenThreshold}%)</text>
          
          <!-- Orange key -->
          <rect x="150" y="0" width="14" height="14" rx="3" fill="#d97706" />
          <text x="170" y="11" class="legend-text">Busy (${capacityConfig.greenThreshold}-${capacityConfig.orangeThreshold - 1}%)</text>
          
          <!-- Red key -->
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
      link.download = `${capacityConfig.title.toLowerCase().replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Success: Downloaded team capacity dashboard as vector SVG!');
    }
  };


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

  const getCanvasBgClass = () => {
    switch (config.canvasBg) {
      case 'light': return 'bg-white';
      case 'grid': return 'bg-[#f8fafc] bg-grid-pattern';
      case 'dark': return 'bg-slate-900 bg-dark-grid-pattern';
      case 'slate': return 'bg-slate-100';
      default: return 'bg-slate-550';
    }
  };

  // Find currently focused / edit-mode milestone
  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);

  // Find currently focused / edit-mode team member
  const selectedTeamMember = teamMembers.find(m => m.id === selectedTeamMemberId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Transient Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 text-sm max-w-sm border ${
          notification.type === 'success' 
            ? 'bg-slate-800 border-emerald-500/30 text-emerald-300' 
            : 'bg-slate-800 border-rose-500/30 text-rose-300'
        }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <Info className="w-5 h-5 text-rose-400 flex-shrink-0" />}
          <div>
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header element bar */}
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

      {/* View Mode Mode Segmented Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
          <span className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">WORKSPACE FORMATTER</span>
        </div>
        
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 sm:self-end">
          <button
            onClick={() => setAppMode('roadmap')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
              appMode === 'roadmap'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-250'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Milestone Roadmap
          </button>
          <button
            onClick={() => setAppMode('capacity')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
              appMode === 'capacity'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-250'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team Capacity Visualizer
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Side control center */}
        <section className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden shrink-0">
          
          {/* Editor Tabs Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 shrink-0">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === 'editor' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Visual Editor
            </button>
            <button 
              onClick={() => setActiveTab('json')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === 'json' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              JSON Data Panel
            </button>
            <button 
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === 'styles' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Canvas Settings
            </button>
            <button 
              onClick={() => setActiveTab('developers')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                activeTab === 'developers' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Developers
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            
            {activeTab === 'editor' && (
              <div className="space-y-6">
                {appMode === 'roadmap' ? (
                  <>
                    {/* Milestone Node List Row Controllers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Roadmap Nodes</h2>
                    <span className="text-xs text-slate-500 font-mono">{milestones.length} stages declared</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                    {milestones.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No milestones yet. Click "+ Add New Milestone Button" below.
                      </div>
                    ) : (
                      milestones.map((m, idx) => {
                        const isFocused = m.id === selectedMilestoneId;
                        return (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedMilestoneId(m.id)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer border transition ${
                              isFocused 
                                ? 'bg-indigo-950/25 border-indigo-500/40 text-white' 
                                : 'bg-slate-900 hover:bg-slate-800/80 border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${m.isHighlighted ? 'bg-red-500 ring-2 ring-red-500/30' : 'bg-[#1a235a]'}`} />
                              <span className="font-semibold text-xs truncate max-w-[140px] sm:max-w-[210px]">{m.title || '(Untitled Stage)'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveMilestone(idx, 'up'); }}
                                disabled={idx === 0}
                                className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800"
                                title="Move Rank Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveMilestone(idx, 'down'); }}
                                disabled={idx === milestones.length - 1}
                                className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800"
                                title="Move Rank Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteMilestone(m.id, e)}
                                className="p-1 hover:text-rose-400 rounded hover:bg-slate-800 text-slate-500"
                                title="Delete Milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={handleAddMilestone}
                    className="mt-3 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition rounded-xl font-semibold text-xs text-center text-white flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Insert New Milestone Card
                  </button>
                </div>

                {/* Focused Stage Detail Form Editor */}
                {selectedMilestone ? (
                  <div className="border border-slate-800 bg-slate-900/60 p-4 rounded-xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-800 text-indigo-400 font-mono text-[10px]">EDITING</span>
                        <h3 className="font-bold text-xs text-white truncate max-w-[200px]">
                          {selectedMilestone.title}
                        </h3>
                      </div>
                      <button 
                        onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Card
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      
                      {/* Milestone Title & Subtitle */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title Name</label>
                          <input 
                            type="text"
                            value={selectedMilestone.title}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'title', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="e.g. Node Tickets"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date Subtitle</label>
                          <input 
                            type="text"
                            value={selectedMilestone.subtitle}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'subtitle', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="e.g. [24 June] or Daily"
                          />
                        </div>
                      </div>

                      {/* Icon & Theme state */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom Icon</label>
                          <select
                            value={selectedMilestone.icon}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'icon', e.target.value as IconType)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                          >
                            <option value="lock">🔐 Lock</option>
                            <option value="traffic-light">🚦 Traffic Light</option>
                            <option value="warning">⚠️ Alert Warning</option>
                            <option value="clipboard">📋 Clipboard Doc</option>
                            <option value="check">✅ Verified Check</option>
                            <option value="calendar">📅 Calendar Date</option>
                            <option value="sparkles">✨ Quality Sparkles</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Red Core Highlight</label>
                          <div className="flex items-center h-8">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedMilestone.isHighlighted}
                                onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'isHighlighted', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                              <span className="ml-2 text-xs text-slate-300 font-medium">
                                {selectedMilestone.isHighlighted ? 'Active/Red' : 'Normal/Blue'}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Status text & color presets */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Title</label>
                          <input 
                            type="text"
                            value={selectedMilestone.status}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'status', e.target.value.toUpperCase())}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder-slate-650"
                            placeholder="e.g. UPCOMING"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Styling</label>
                          <select
                            value={selectedMilestone.statusBg + '|' + selectedMilestone.statusText}
                            onChange={(e) => {
                              const [bg, text] = e.target.value.split('|');
                              handleUpdateMilestone(selectedMilestone.id, 'statusBg', bg);
                              handleUpdateMilestone(selectedMilestone.id, 'statusText', text);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                          >
                            {STATUS_COLORS.map((sc, sidx) => (
                              <option key={sidx} value={`${sc.bg}|${sc.text}`}>{sc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Individual Milestone Status Visibility Toggle */}
                      <div className="pt-1 select-none">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedMilestone.hideStatus || false}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'hideStatus', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-950 border border-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                          <span className="ml-2 text-xs text-slate-350 font-medium">
                            Hide status pill on ONLY this card
                          </span>
                        </label>
                      </div>

                      {/* Assignee pill tags section */}
                      <div className="border-t border-slate-800/80 pt-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Assignee / Owner Code Tags</label>
                        
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {selectedMilestone.assignees.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">No assignees linked yet.</span>
                          ) : (
                            selectedMilestone.assignees.map((act) => (
                              <div 
                                key={act.id} 
                                className="flex items-center gap-1 px-2.5 py-1 text-xs text-white rounded-full font-semibold transition"
                                style={{ backgroundColor: act.color }}
                              >
                                <span>{act.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAssignee(selectedMilestone.id, act.id)}
                                  className="hover:bg-black/20 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] ml-1 transition"
                                  title="Unassign"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Assignee Input Panel */}
                        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold">New Owner Badge Setup</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select 
                              value={newAssigneeName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewAssigneeName(val);
                                const devIndex = teamMembers.findIndex(m => m.name === val);
                                if (devIndex !== -1) {
                                  setNewAssigneeColor(ASSIGNEE_COLORS[devIndex % ASSIGNEE_COLORS.length].value);
                                }
                              }}
                              className="flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">Select Developer...</option>
                              {teamMembers.map((m) => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-1.5 items-center">
                              <select 
                                value={newAssigneeColor}
                                onChange={(e) => setNewAssigneeColor(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-white"
                              >
                                {ASSIGNEE_COLORS.map((c) => (
                                  <option key={c.value} value={c.value}>{c.name}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleAddAssignee(selectedMilestone.id)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white whitespace-nowrap active:scale-95 transition"
                              >
                                Assign
                              </button>
                            </div>
                          </div>

                          {/* Quick color circles preview */}
                          <div className="flex gap-1.5 items-center pt-1 overflow-x-auto">
                            <span className="text-[9px] text-slate-500 uppercase font-bold mr-1">Palette:</span>
                            {ASSIGNEE_COLORS.map((col) => (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => setNewAssigneeColor(col.value)}
                                className={`w-3.5 h-3.5 rounded-full border transition flex justify-center items-center ${
                                  newAssigneeColor === col.value ? 'border-white scale-125 ring-2 ring-indigo-500/30' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: col.value }}
                                title={col.name}
                              />
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                    Please insert or select a Milestone Node above to view block configuration form.
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Select Developers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Select Developers</h2>
                    <span className="text-xs text-slate-500 font-mono">{selectedDeveloperIds.length} of {teamMembers.length} selected</span>
                  </div>

                  <div className="space-y-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 max-h-[60vh] overflow-y-auto">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No developers found. Go to the "Developers" tab to add them.
                      </div>
                    ) : (
                      teamMembers.map((member) => {
                        const isChecked = selectedDeveloperIds.includes(member.id);
                        return (
                          <label 
                            key={member.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 transition"
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedDeveloperIds(selectedDeveloperIds.filter(id => id !== member.id));
                                } else {
                                  setSelectedDeveloperIds([...selectedDeveloperIds, member.id]);
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 rounded focus:ring-indigo-500 focus:ring-2 focus:ring-offset-slate-900 cursor-pointer"
                            />
                            <div className="flex-grow">
                              <p className="font-semibold text-xs text-slate-200">{member.name}</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{member.role}</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400">{member.utilization}%</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Interactive JSON Config</h2>
                  <button
                    onClick={copyJsonToClipboard}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Configuration'}
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Update your dataset in real-time by modifying the code content below. You can also paste your own exported layout dataset.
                </p>

                <div className="relative">
                  <textarea
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                    style={{ resize: 'vertical' }}
                    placeholder="{ ... }"
                  />
                  {jsonError ? (
                    <div className="mt-2 p-2.5 bg-rose-950/40 text-rose-300 rounded-lg text-xs font-mono border border-rose-500/20">
                      🚨 Invalid format: {jsonError}
                    </div>
                  ) : (
                    <div className="mt-2 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Syntax Validation: Safe (Verified JSON)
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-450 leading-relaxed">
                  <span className="font-semibold text-white">How to import:</span> Make sure your JSON keeps the structure of <code>config</code> (with fields title, timelineColor, canvasBg, cardBg, cardBorder) and <code>milestones</code> (with arrays of objects holding id, title, subtitle, icon, status, statusBg, statusText, isHighlighted, assignees).
                </div>
              </div>
            )}

            {activeTab === 'styles' && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Style &amp; Appearance</h2>
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Roadmap Main Header Title</label>
                  <input 
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="MILESTONE ROADMAP"
                  />
                </div>

                {/* Timeline axis line color */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Timeline Axis Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.timelineColor}
                      onChange={(e) => setConfig({ ...config, timelineColor: e.target.value })}
                      className="w-10 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.timelineColor}
                      onChange={(e) => setConfig({ ...config, timelineColor: e.target.value })}
                      className="flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Canvas background selector */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Preview Canvas Grid Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'grid', label: '📊 Blueprint Grid' },
                      { id: 'light', label: '☀️ Plain Light' },
                      { id: 'slate', label: '🌫️ Editorial Slate' },
                      { id: 'dark', label: '🌑 Tech Dark' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setConfig({ ...config, canvasBg: opt.id as any })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${
                          config.canvasBg === opt.id 
                            ? 'bg-slate-800 text-white border-indigo-500' 
                            : 'bg-slate-900 text-slate-400 border-transparent hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Background Customization */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Milestones Card Background</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.cardBg}
                      onChange={(e) => setConfig({ ...config, cardBg: e.target.value })}
                      className="w-10 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.cardBg}
                      onChange={(e) => setConfig({ ...config, cardBg: e.target.value })}
                      className="flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Card Border Customization */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Card Outer Outline Border Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.cardBorder}
                      onChange={(e) => setConfig({ ...config, cardBorder: e.target.value })}
                      className="w-10 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.cardBorder}
                      onChange={(e) => setConfig({ ...config, cardBorder: e.target.value })}
                      className="flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Hide Status Pills Option */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Status Badge Visibility</label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.hideStatus || false}
                        onChange={(e) => setConfig({ ...config, hideStatus: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-2 text-xs text-slate-300 font-medium">
                        {config.hideStatus ? 'Status pills hidden from view/export' : 'Status pills visible on cards'}
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'developers' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Developers</h2>
                    <span className="text-xs text-slate-500 font-mono">{teamMembers.length} engineers</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No team members yet. Click "+ Add New Teammate" below.
                      </div>
                    ) : (
                      teamMembers.map((member, idx) => {
                        const isFocused = member.id === selectedTeamMemberId;
                        let statusColor = 'bg-teal-500 ring-teal-500/20';
                        if (member.utilization >= capacityConfig.orangeThreshold) {
                          statusColor = 'bg-rose-500 ring-rose-500/20';
                        } else if (member.utilization >= capacityConfig.greenThreshold) {
                          statusColor = 'bg-amber-500 ring-amber-500/20';
                        }
                        return (
                          <div 
                            key={member.id}
                            onClick={() => setSelectedTeamMemberId(member.id)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer border transition ${
                              isFocused 
                                ? 'bg-indigo-950/25 border-indigo-500/40 text-white' 
                                : 'bg-slate-900 hover:bg-slate-800/80 border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor} ring-2`} />
                              <div className="truncate">
                                <p className="font-semibold text-xs truncate max-w-[140px] text-slate-200">{member.name}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold truncate max-w-[145px]">{member.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                              <span className="text-[11px] font-mono font-bold mr-2 text-slate-400">{member.utilization}%</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveTeamMember(idx, 'up'); }}
                                disabled={idx === 0}
                                className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800 text-slate-400"
                                title="Move Rank Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveTeamMember(idx, 'down'); }}
                                disabled={idx === teamMembers.length - 1}
                                className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800 text-slate-400"
                                title="Move Rank Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteTeamMember(member.id, e)}
                                className="p-1 hover:text-rose-400 rounded hover:bg-slate-800 text-slate-500"
                                title="Delete Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Focused Teammate Detail Form Editor */}
                {selectedTeamMember ? (
                  <div className="border border-slate-800 bg-slate-900/60 p-4 rounded-xl space-y-4 shadow-sm font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-800 text-rose-400 font-mono text-[9px] uppercase tracking-wider font-bold">EDITING TEAM</span>
                        <h3 className="font-bold text-xs text-white truncate max-w-[180px]">
                          {selectedTeamMember.name}
                        </h3>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteTeamMember(selectedTeamMember.id, e)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Profile
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                          <input 
                            type="text"
                            value={selectedTeamMember.name}
                            onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="e.g. Ronak"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role</label>
                          <select 
                            value={selectedTeamMember.role}
                            onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'role', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                          >
                            <option value="Specialist">Specialist</option>
                            <option value="Associate">Associate</option>
                            <option value="Lead">Lead</option>
                            <option value="Manager">Manager</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                          <span>Utilization</span>
                          <span className="text-white font-mono">{selectedTeamMember.utilization}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="150" 
                          step="5"
                          value={selectedTeamMember.utilization} 
                          onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'utilization', parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
                    Select a developer from the list above to edit their details.
                  </div>
                )}

                {/* Quick Add Teammate Card */}
                <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-300">Quick Add Member</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={newMemberName} 
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTeamMember(); }}
                    />
                    <select 
                      value={newMemberRole} 
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Associate">Associate</option>
                      <option value="Specialist">Specialist</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Default Util: {newMemberUtil}%</span>
                    <button 
                      onClick={handleAddTeamMember}
                      className="px-3 py-1 bg-[#be185d] hover:bg-[#9d174d] rounded-lg text-xs font-bold text-white transition active:scale-95"
                    >
                      Add Teammate
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Prompt/Instructions Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-400 space-y-2 shrink-0">
            <div className="flex gap-1.5 items-start text-indigo-300">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p className="font-semibold text-slate-300">Figma-Ready Assets</p>
            </div>
            <p className="leading-relaxed">
              Every detail is drawn with pure client-side vectors. Clicking <strong className="text-white">Export Vector SVG</strong> saves an infinitely-scalable vector asset ready for directly dropping into presentation slides or design files.
            </p>
          </div>
        </section>

        {/* Right Side: Interactive Preview Canvas stage */}
        <section className={`flex-grow p-4 md:p-8 overflow-y-auto flex items-center justify-center transition-colors duration-300 ${getCanvasBgClass()}`}>
          
          <div className="w-full max-w-3xl">
            
            {/* Interactive help bar above preview */}
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Rendering Preview Area</span>
              </div>
              <div>
                <span>Click cards below to select/edit</span>
              </div>
            </div>

            {/* The Visual Artwork Card Box representing the roadmap or capacity */}
            {appMode === 'roadmap' ? (
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
            ) : (
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
                  {teamMembers.filter(m => selectedDeveloperIds.includes(m.id)).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic">
                      Select developers in the sidebar to visualize capacity.
                    </div>
                  ) : (
                    teamMembers.filter(m => selectedDeveloperIds.includes(m.id)).map((member) => {
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
            )}

            {/* Hint overlay */}
            <p className="mt-4 text-center text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Tip: Customize the title, timeline branch connector colors, card backgrounds, and core statuses instantly inside the sidebar controls.
            </p>

          </div>
          
        </section>

      </main>

    </div>
  );
}

const DynamicApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default DynamicApp;

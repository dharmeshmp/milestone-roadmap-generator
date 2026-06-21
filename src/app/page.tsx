"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Check, 
  Info,
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Milestone, RoadmapConfig, Assignee, TeamMember, CapacityConfig, JiraTicket } from '../types';
import { INITIAL_MILESTONES, DEFAULT_CONFIG, INITIAL_TEAM_MEMBERS, DEFAULT_CAPACITY_CONFIG } from '../initialData';
import { 
  getDevelopers, 
  addDeveloper, 
  updateDeveloper, 
  deleteDeveloper, 
  reorderDevelopers,
  resetDevelopers
} from './actions/developers';
import {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  resetMilestones
} from './actions/milestones';
import {
  getTickets,
  addTicket,
  updateTicket,
  deleteTicket
} from './actions/tickets';
import { importFullData } from './actions/importExport';

// Import our new components
import Header from '../components/Header';
import Sidebar, { ASSIGNEE_COLORS, STATUS_COLORS } from '../components/Sidebar';
import RoadmapCanvas from '../components/RoadmapCanvas';
import CapacityCanvas from '../components/CapacityCanvas';
import DeveloperModal from '../components/DeveloperModal';
import TicketBoardCanvas from '../components/TicketBoardCanvas';

function App() {
  // Main reactive states
  const [appMode, setAppMode] = useState<'roadmap' | 'capacity' | 'tickets'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('applet_visual_mode');
      return (saved as 'roadmap' | 'capacity' | 'tickets') || 'roadmap';
    }
    return 'roadmap';
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const [config, setConfig] = useState<RoadmapConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('milestones_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    }
    return DEFAULT_CONFIG;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<string[]>([]);

  const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capacity_config_data');
      return saved ? JSON.parse(saved) : DEFAULT_CAPACITY_CONFIG;
    }
    return DEFAULT_CAPACITY_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'styles'>('editor');
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);

  const [newAssigneeName, setNewAssigneeName] = useState('');
  
  // Daily tickets and timelog management states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // States for Team Capacity Member editing
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Associate');
  const [newMemberUtil, setNewMemberUtil] = useState<number>(85);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [capacityDates, setCapacityDates] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capacity_dates_list');
      return saved ? JSON.parse(saved) : [new Date().toISOString().split('T')[0]];
    }
    return [new Date().toISOString().split('T')[0]];
  });

  const [showGlobalCapacityDevIds, setShowGlobalCapacityDevIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('show_global_capacity_dev_ids');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const computedTeamMembers = React.useMemo(() => {
    return teamMembers.map(member => {
      if (capacityDates.length === 0 || showGlobalCapacityDevIds.includes(member.id)) {
        return member;
      }
      const totalHours = tickets
        .filter(t => t.assignee_id === member.id && capacityDates.includes(t.date))
        .reduce((sum, t) => sum + (t.timelog || 0), 0);
      const totalCapacity = capacityDates.length * 8;
      const utilization = Math.round((totalHours / totalCapacity) * 100);
      return { ...member, utilization };
    });
  }, [teamMembers, tickets, capacityDates, showGlobalCapacityDevIds]);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('capacity_dates_list', JSON.stringify(capacityDates));
  }, [capacityDates]);

  useEffect(() => {
    localStorage.setItem('show_global_capacity_dev_ids', JSON.stringify(showGlobalCapacityDevIds));
  }, [showGlobalCapacityDevIds]);

  useEffect(() => {
    localStorage.setItem('applet_visual_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('milestones_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('capacity_config_data', JSON.stringify(capacityConfig));
  }, [capacityConfig]);

  // Load team members, milestones, and daily tickets from SQLite on mount
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

    getMilestones().then((data) => {
      if (data && data.length > 0) {
        setMilestones(data);
        setSelectedMilestoneId(data[0].id);
      } else {
        setMilestones(INITIAL_MILESTONES);
        if (INITIAL_MILESTONES.length > 0) {
          setSelectedMilestoneId(INITIAL_MILESTONES[0].id);
        }
      }
    });

    getTickets().then((data) => {
      if (data && data.length > 0) {
        setTickets(data);
        setSelectedTicketId(data[0].id);
      }
    });
  }, []);

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
    addMilestone(newMilestone).then((success) => {
      if (success) {
        setMilestones(prev => [...prev, newMilestone]);
        setSelectedMilestoneId(newId);
        showNotification('Added new milestone stage!');
      } else {
        showNotification('Failed to add milestone to database', 'error');
      }
    });
  };

  const handleDeleteMilestone = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteMilestone(id).then((success) => {
      if (success) {
        const filtered = milestones.filter(m => m.id !== id);
        setMilestones(filtered);
        if (selectedMilestoneId === id) {
          setSelectedMilestoneId(filtered.length > 0 ? filtered[0].id : null);
        }
        showNotification('Milestone removed', 'error');
      } else {
        showNotification('Failed to delete milestone from database', 'error');
      }
    });
  };

  const handleUpdateMilestone = <K extends keyof Milestone>(id: string, key: K, value: Milestone[K]) => {
    const current = milestones.find(m => m.id === id);
    if (!current) return;
    const updatedMilestone = { ...current, [key]: value };
    setMilestones(prev => prev.map(m => m.id === id ? updatedMilestone : m));
    updateMilestone(updatedMilestone).then((success) => {
      if (!success) {
        showNotification('Failed to update milestone in database', 'error');
      }
    });
  };

  const handleMoveMilestone = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === milestones.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const result = [...milestones];
    const [removed] = result.splice(index, 1);
    result.splice(targetIndex, 0, removed);
    
    setMilestones(result);
    
    const orderedIds = result.map(m => m.id);
    reorderMilestones(orderedIds).then((success) => {
      if (success) {
        showNotification(`Moved milestone ${direction}`);
      } else {
        showNotification('Failed to save order to database', 'error');
      }
    });
  };

  // --- HANDLERS FOR ASSIGNEES ---
  
  const handleAddAssignee = (milestoneId: string) => {
    if (!newAssigneeName.trim()) {
      showNotification('Assignee name cannot be empty', 'error');
      return;
    }
    const currentMilestone = milestones.find(m => m.id === milestoneId);
    if (!currentMilestone) return;

    const dev = teamMembers.find(t => t.name.toLowerCase() === newAssigneeName.trim().toLowerCase());
    const assigneeColor = dev ? dev.color : ASSIGNEE_COLORS[0].value;

    const newAssignee: Assignee = {
      id: Date.now().toString(),
      name: newAssigneeName.trim(),
      color: assigneeColor
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

  // --- HANDLERS FOR JIRA TICKETS ---
  const handleAddTicket = (ticket: JiraTicket) => {
    addTicket(ticket).then((success) => {
      if (success) {
        setTickets(prev => [...prev, ticket]);
        setSelectedTicketId(ticket.id);
        showNotification(`Logged ticket ${ticket.id} successfully!`);
      } else {
        showNotification('Failed to add ticket to database', 'error');
      }
    });
  };

  const handleDeleteTicket = (id: string) => {
    deleteTicket(id).then((success) => {
      if (success) {
        const filtered = tickets.filter(t => t.id !== id);
        setTickets(filtered);
        if (selectedTicketId === id) {
          setSelectedTicketId(filtered.length > 0 ? filtered[0].id : null);
        }
        showNotification(`Deleted ticket ${id}`, 'error');
      } else {
        showNotification('Failed to delete ticket from database', 'error');
      }
    });
  };

  const handleUpdateTicket = <K extends keyof JiraTicket>(id: string, key: K, value: JiraTicket[K]) => {
    const current = tickets.find(t => t.id === id);
    if (!current) return;
    const updatedTicket = { ...current, [key]: value };
    setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
    updateTicket(updatedTicket).then((success) => {
      if (!success) {
        showNotification('Failed to update ticket in database', 'error');
      }
    });
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
      utilization: newMemberUtil,
      color: ASSIGNEE_COLORS[teamMembers.length % ASSIGNEE_COLORS.length].value
    };
    
    addDeveloper(newMember).then((success) => {
      if (success) {
        setTeamMembers([...teamMembers, newMember]);
        setSelectedDeveloperIds(prev => [...prev, newId]);
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
        setSelectedDeveloperIds(prev => prev.filter(devId => devId !== id));
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

  const handleReorderDevelopers = (orderedIds: string[]) => {
    const orderedMembers = orderedIds.map(id => teamMembers.find(m => m.id === id)).filter(Boolean) as TeamMember[];
    setTeamMembers(orderedMembers);
    
    reorderDevelopers(orderedIds).then((success) => {
      if (success) {
        showNotification('Developer order updated');
      } else {
        showNotification('Failed to save developer order to database', 'error');
      }
    });
  };

  const handleResetToDefault = () => {
    if (appMode === 'roadmap') {
      resetMilestones(INITIAL_MILESTONES).then((success) => {
        if (success) {
          setMilestones(INITIAL_MILESTONES);
          setConfig(DEFAULT_CONFIG);
          if (INITIAL_MILESTONES.length > 0) {
            setSelectedMilestoneId(INITIAL_MILESTONES[0].id);
          }
          showNotification('Reset roadmap to mockup reference values');
        } else {
          showNotification('Failed to reset milestones database', 'error');
        }
      });
    } else {
      resetDevelopers(INITIAL_TEAM_MEMBERS).then((success) => {
        if (success) {
          setTeamMembers(INITIAL_TEAM_MEMBERS);
          setSelectedDeveloperIds(INITIAL_TEAM_MEMBERS.map(m => m.id));
          setCapacityConfig(DEFAULT_CAPACITY_CONFIG);
          setSelectedTeamMemberId(INITIAL_TEAM_MEMBERS[0].id);
          showNotification('Reset team capacity to mockup reference values');
        } else {
          showNotification('Failed to reset developers database', 'error');
        }
      });
    }
  };

  // --- HANDLERS FOR IMPORT/EXPORT JSON DATA ---
  const handleExportJSON = () => {
    const data = {
      developers: teamMembers,
      milestones: milestones,
      tickets: tickets
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'studio_backup_data.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Exported full database state as JSON successfully!');
  };

  const handleImportJSON = (data: any) => {
    importFullData(data).then((success) => {
      if (success) {
        getDevelopers().then((devs) => {
          if (devs && devs.length > 0) {
            setTeamMembers(devs);
            setSelectedDeveloperIds(devs.map(m => m.id));
            setSelectedTeamMemberId(prev => prev === null || !devs.some(m => m.id === prev) ? devs[0].id : prev);
          }
        });
        getMilestones().then((ms) => {
          if (ms && ms.length > 0) {
            setMilestones(ms);
            setSelectedMilestoneId(ms[0].id);
          }
        });
        getTickets().then((tks) => {
          if (tks && tks.length > 0) {
            setTickets(tks);
            setSelectedTicketId(tks[0].id);
          }
        });
        showNotification('Imported and restored database state successfully!');
      } else {
        showNotification('Failed to import database JSON', 'error');
      }
    });
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
      const hasDates = capacityDates && capacityDates.length > 0;
      const headerHeight = 75 + (hasDates ? 15 : 0);
      const colHeaderHeight = 22;
      const legendHeight = 55;
      const totalWidth = 520;
      const activeMembers = computedTeamMembers.filter(m => selectedDeveloperIds.includes(m.id));
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
          ${hasDates ? `<text y="15" font-size="9px" fill="#64748b" font-family="monospace">DATES: ${capacityDates.join(', ')}</text>` : ''}
          <line x1="0" y1="${hasDates ? 25 : 12}" x2="${totalWidth - padding * 2}" y2="${hasDates ? 25 : 12}" stroke="#e2e8f0" stroke-width="2" />
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

  const getCanvasBgClass = () => {
    switch (config.canvasBg) {
      case 'light': return 'bg-white';
      case 'grid': return 'bg-[#f8fafc] bg-grid-pattern';
      case 'dark': return 'bg-slate-900 bg-dark-grid-pattern';
      case 'slate': return 'bg-slate-100';
      default: return 'bg-slate-550';
    }
  };

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

      {/* Header Element Component */}
      <Header 
        handleResetToDefault={handleResetToDefault} 
        handleExportSVG={handleExportSVG} 
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        handleExportJSON={handleExportJSON}
        handleImportJSON={handleImportJSON}
      />

      {/* View Mode Mode Segmented Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold pr-1">Show Sidebar</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[10px] font-bold pr-1">Hide Sidebar</span>
              </>
            )}
          </button>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
          <button
            onClick={() => setAppMode('tickets')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
              appMode === 'tickets'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-250'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            JIRA Tickets &amp; Timelogs
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Component */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden flex ${
          isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-full lg:w-[460px] xl:w-[500px] opacity-100'
        } shrink-0`}>
          <Sidebar
            appMode={appMode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            milestones={milestones}
            config={config}
            setConfig={setConfig}
            teamMembers={computedTeamMembers}
            capacityConfig={capacityConfig}
            setCapacityConfig={setCapacityConfig}
            selectedDeveloperIds={selectedDeveloperIds}
            setSelectedDeveloperIds={setSelectedDeveloperIds}
            selectedMilestoneId={selectedMilestoneId}
            setSelectedMilestoneId={setSelectedMilestoneId}
            handleAddMilestone={handleAddMilestone}
            handleDeleteMilestone={handleDeleteMilestone}
            handleUpdateMilestone={handleUpdateMilestone}
            handleMoveMilestone={handleMoveMilestone}
            newAssigneeName={newAssigneeName}
            setNewAssigneeName={setNewAssigneeName}
            handleAddAssignee={handleAddAssignee}
            handleRemoveAssignee={handleRemoveAssignee}
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            setSelectedTicketId={setSelectedTicketId}
            handleAddTicket={handleAddTicket}
            handleDeleteTicket={handleDeleteTicket}
            handleUpdateTicket={handleUpdateTicket}
            selectedDate={selectedDate}
            handleReorderDevelopers={handleReorderDevelopers}
            capacityDates={capacityDates}
            setCapacityDates={setCapacityDates}
            showGlobalCapacityDevIds={showGlobalCapacityDevIds}
            setShowGlobalCapacityDevIds={setShowGlobalCapacityDevIds}
          />
        </div>

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

            {/* Render selected canvas */}
            {appMode === 'roadmap' ? (
              <RoadmapCanvas
                milestones={milestones}
                config={config}
                teamMembers={teamMembers}
                selectedMilestoneId={selectedMilestoneId}
                setSelectedMilestoneId={setSelectedMilestoneId}
              />
            ) : appMode === 'capacity' ? (
              <CapacityCanvas
                teamMembers={computedTeamMembers}
                selectedDeveloperIds={selectedDeveloperIds}
                capacityConfig={capacityConfig}
                selectedTeamMemberId={selectedTeamMemberId}
                setSelectedTeamMemberId={setSelectedTeamMemberId}
                capacityDates={capacityDates}
              />
            ) : (
              <TicketBoardCanvas
                tickets={tickets}
                teamMembers={teamMembers}
                selectedTicketId={selectedTicketId}
                setSelectedTicketId={setSelectedTicketId}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                handleUpdateTicket={handleUpdateTicket}
              />
            )}

            {/* Hint overlay */}
            <p className="mt-4 text-center text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Tip: Customize the title, timeline branch connector colors, card backgrounds, and core statuses instantly inside the sidebar controls.
            </p>

          </div>
        </section>

      </main>

      {/* Global Developer Directory modal */}
      <DeveloperModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        teamMembers={teamMembers}
        capacityConfig={capacityConfig}
        selectedTeamMemberId={selectedTeamMemberId}
        setSelectedTeamMemberId={setSelectedTeamMemberId}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        newMemberUtil={newMemberUtil}
        setNewMemberUtil={setNewMemberUtil}
        handleAddTeamMember={handleAddTeamMember}
        handleUpdateTeamMember={handleUpdateTeamMember}
        handleDeleteTeamMember={handleDeleteTeamMember}
        handleMoveTeamMember={handleMoveTeamMember}
      />

    </div>
  );
}

const DynamicApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default DynamicApp;

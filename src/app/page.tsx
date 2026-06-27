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
import { Milestone, RoadmapConfig, Assignee, TeamMember, CapacityConfig, JiraTicket, GlobalConfig } from '../types';
import { INITIAL_MILESTONES, DEFAULT_CONFIG, INITIAL_TEAM_MEMBERS, DEFAULT_CAPACITY_CONFIG, DEFAULT_GLOBAL_CONFIG } from '../initialData';
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
import SettingsModal from '../components/SettingsModal';
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
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

  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('global_config_data');
      return saved ? JSON.parse(saved) : DEFAULT_GLOBAL_CONFIG;
    }
    return DEFAULT_GLOBAL_CONFIG;
  });

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
      const totalCapacity = capacityDates.length * (globalConfig.workingHoursPerDay || 8);
      const utilization = Math.round((totalHours / totalCapacity) * 100);
      return { ...member, utilization };
    });
  }, [teamMembers, tickets, capacityDates, showGlobalCapacityDevIds, globalConfig.workingHoursPerDay]);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('global_config_data', JSON.stringify(globalConfig));
  }, [globalConfig]);

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



  const getCanvasBgClass = () => {
    switch (globalConfig.canvasBg) {
      case 'light': return 'bg-zinc-50/50';
      case 'grid': return 'bg-zinc-950 bg-grid-pattern';
      case 'dark': return 'bg-zinc-950 bg-dark-grid-pattern';
      case 'slate': return 'bg-zinc-900';
      default: return 'bg-zinc-950';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Transient Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 text-sm max-w-sm border ${
          notification.type === 'success' 
            ? 'bg-zinc-900 border-emerald-500/30 text-emerald-300' 
            : 'bg-zinc-900 border-rose-500/30 text-rose-300'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />}
          <div>
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}

      <Header 
        handleResetToDefault={handleResetToDefault} 
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        handleExportJSON={handleExportJSON}
        handleImportJSON={handleImportJSON}
      />

      {/* View Mode Mode Segmented Control Bar */}
      <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-semibold pr-1">Show Sidebar</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-semibold pr-1">Hide Sidebar</span>
              </>
            )}
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">WORKSPACE FORMATTER</span>
        </div>
        
        <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-850 gap-0.5 sm:self-end">
          <button
            onClick={() => setAppMode('roadmap')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 active:scale-98 cursor-pointer ${
              appMode === 'roadmap'
                ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Milestone Roadmap
          </button>
          <button
            onClick={() => setAppMode('capacity')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 active:scale-98 cursor-pointer ${
              appMode === 'capacity'
                ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team Capacity
          </button>
          <button
            onClick={() => setAppMode('tickets')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 active:scale-98 cursor-pointer ${
              appMode === 'tickets'
                ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            JIRA Tickets
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
        <section className={`flex-grow p-6 md:p-10 overflow-y-auto flex items-start justify-center transition-colors duration-300 ${getCanvasBgClass()}`}>
          <div className={`w-full ${appMode === 'tickets' ? 'max-w-7xl' : 'max-w-3xl'}`}>
            
            {/* Interactive help bar above preview */}
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{appMode === 'tickets' ? 'Daily Kanban Workspace' : 'Live Rendering Preview'}</span>
              </div>
              <div>
                <span>{appMode === 'tickets' ? 'Drag & Drop cards to update status' : 'Click cards below to select/edit'}</span>
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
            <p className="mt-4 text-center text-xs text-zinc-500 leading-relaxed max-w-md mx-auto">
              Tip: Customize titles, branch line connections, card backgrounds, and task columns instantly via the sidebar panel.
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

      {/* Global Settings modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        globalConfig={globalConfig}
        setGlobalConfig={setGlobalConfig}
      />

    </div>
  );
}

const DynamicApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default DynamicApp;

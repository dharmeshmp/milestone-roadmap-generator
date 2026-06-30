import React from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  Info, 
  Code, 
  Sparkles,
  Lock,
  AlertTriangle,
  ClipboardList,
  Calendar,
  CheckSquare,
  Sliders,
  Layers,
  Users,
  GripVertical
} from 'lucide-react';
import { Milestone, RoadmapConfig, TeamMember, CapacityConfig, IconType, JiraTicket, GlobalConfig } from '../types';

// Color Presets for assignees
export const ASSIGNEE_COLORS = [
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
export const STATUS_COLORS = [
  { name: 'Dark Navy', bg: 'bg-[#1a235a]', text: 'text-white' },
  { name: 'Vibrant Emerald', bg: 'bg-emerald-600', text: 'text-white' },
  { name: 'Amber Warning', bg: 'bg-amber-500', text: 'text-black' },
  { name: 'Crimson Red', bg: 'bg-red-600', text: 'text-white' },
  { name: 'Cloud Slate', bg: 'bg-slate-200', text: 'text-slate-800' }
];

interface SidebarProps {
  appMode: 'roadmap' | 'capacity' | 'tickets';
  activeTab: 'editor' | 'styles';
  setActiveTab: (tab: 'editor' | 'styles') => void;
  
  milestones: Milestone[];
  config: RoadmapConfig;
  setConfig: React.Dispatch<React.SetStateAction<RoadmapConfig>>;
  
  teamMembers: TeamMember[];
  capacityConfig: CapacityConfig;
  setCapacityConfig: React.Dispatch<React.SetStateAction<CapacityConfig>>;
  
  selectedDeveloperIds: string[];
  setSelectedDeveloperIds: React.Dispatch<React.SetStateAction<string[]>>;
  
  selectedMilestoneId: string | null;
  setSelectedMilestoneId: React.Dispatch<React.SetStateAction<string | null>>;

  handleAddMilestone: () => void;
  handleDeleteMilestone: (id: string, e?: React.MouseEvent) => void;
  handleUpdateMilestone: <K extends keyof Milestone>(id: string, keyOrUpdates: K | Partial<Milestone>, value?: Milestone[K]) => void;
  handleMoveMilestone: (index: number, direction: 'up' | 'down') => void;

  newAssigneeName: string;
  setNewAssigneeName: (val: string) => void;
  handleAddAssignee: (milestoneId: string) => void;
  handleRemoveAssignee: (milestoneId: string, assigneeId: string) => void;

  tickets: JiraTicket[];
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  handleAddTicket: (ticket: JiraTicket) => void;
  handleDeleteTicket: (id: string) => void;
  handleUpdateTicket: <K extends keyof JiraTicket>(id: string, key: K, value: JiraTicket[K]) => void;
  selectedDate: string;
  handleReorderDevelopers: (orderedIds: string[]) => void;
  handleReorderMilestones: (orderedIds: string[]) => void;
  capacityDates: string[];
  setCapacityDates: React.Dispatch<React.SetStateAction<string[]>>;
  showGlobalCapacityDevIds: string[];
  setShowGlobalCapacityDevIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Sidebar({
  appMode,
  activeTab,
  setActiveTab,
  milestones,
  config,
  setConfig,
  teamMembers,
  capacityConfig,
  setCapacityConfig,
  selectedDeveloperIds,
  setSelectedDeveloperIds,
  selectedMilestoneId,
  setSelectedMilestoneId,
  handleAddMilestone,
  handleDeleteMilestone,
  handleUpdateMilestone,
  handleMoveMilestone,
  newAssigneeName,
  setNewAssigneeName,
  handleAddAssignee,
  handleRemoveAssignee,
  tickets,
  selectedTicketId,
  setSelectedTicketId,
  handleAddTicket,
  handleDeleteTicket,
  handleUpdateTicket,
  selectedDate,
  handleReorderDevelopers,
  handleReorderMilestones,
  capacityDates,
  setCapacityDates,
  showGlobalCapacityDevIds,
  setShowGlobalCapacityDevIds,
}: SidebarProps) {

  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Local state for JIRA tickets logging form
  const [newTicketIdLocal, setNewTicketIdLocal] = React.useState('');
  const [newTicketTitleLocal, setNewTicketTitleLocal] = React.useState('');
  const [newTicketAssigneeLocal, setNewTicketAssigneeLocal] = React.useState('');
  const [newTicketStatusLocal, setNewTicketStatusLocal] = React.useState<'To Do' | 'In Progress' | 'Reassigned' | 'Done'>('To Do');
  const [newTicketRemarkLocal, setNewTicketRemarkLocal] = React.useState('');
  const [newTicketHoursLocal, setNewTicketHoursLocal] = React.useState(0);
  const [newTicketDateLocal, setNewTicketDateLocal] = React.useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Local state for dragging developers
  const [draggedOverDevId, setDraggedOverDevId] = React.useState<string | null>(null);

  const handleDeveloperDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const sourceIndex = teamMembers.findIndex(m => m.id === draggedId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const result = [...teamMembers];
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(targetIndex, 0, removed);

    handleReorderDevelopers(result.map(m => m.id));
  };

  // Local state for dragging milestones
  const [draggedOverMilestoneId, setDraggedOverMilestoneId] = React.useState<string | null>(null);

  const handleMilestoneDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const sourceIndex = milestones.findIndex(m => m.id === draggedId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const result = [...milestones];
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(targetIndex, 0, removed);

    handleReorderMilestones(result.map(m => m.id));
  };

  return (
    <section className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
      
      {/* Editor Tabs Navigation */}
      <div className="flex border-b border-zinc-850 bg-zinc-950/80 p-1 gap-1 shrink-0">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'editor' 
              ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          Visual Editor
        </button>
        <button 
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'styles' 
              ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          Canvas Settings
        </button>
      </div>

      {/* Active Tab View */}
      <div className="flex-grow overflow-y-auto p-5 space-y-6">
        
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {appMode === 'tickets' ? (
              <>
                {/* Tickets list for selected date */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Daily Activities</h2>
                    <span className="text-xs text-zinc-500 font-mono">
                      {tickets.filter(t => t.date === selectedDate).length} tasks
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/80">
                    {tickets.filter(t => t.date === selectedDate).length === 0 ? (
                      <div className="text-center py-6 text-zinc-500 text-xs">
                        No JIRA tickets for today. Add a ticket below.
                      </div>
                    ) : (
                      tickets.filter(t => t.date === selectedDate).map((ticket) => {
                        const isFocused = ticket.id === selectedTicketId;
                        return (
                          <div 
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer border transition ${
                              isFocused 
                                ? 'bg-indigo-950/25 border-indigo-500/40 text-white' 
                                : 'bg-zinc-900 hover:bg-zinc-800/80 border-transparent text-zinc-350'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-bold font-mono text-zinc-400 shrink-0">
                                {ticket.id}
                              </span>
                              <span className="font-semibold text-xs truncate max-w-[150px]">
                                {ticket.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
                                className="p-1 hover:text-rose-450 rounded hover:bg-zinc-800 text-zinc-500 bg-transparent border-0 cursor-pointer"
                                title="Delete Ticket"
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

                {/* Edit Form */}
                {selectedTicket ? (
                  <div className="border border-zinc-800/80 bg-zinc-900/50 p-4 rounded-lg space-y-4 shadow-sm font-sans">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-zinc-800 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-bold">TICKET</span>
                        <h3 className="font-bold text-xs text-white truncate max-w-[150px]">{selectedTicket.id}</h3>
                      </div>
                      <button 
                        onClick={() => handleDeleteTicket(selectedTicket.id)}
                        className="text-rose-450 hover:text-rose-400 text-xs flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Task
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Activity Title</label>
                        <input 
                          type="text"
                          value={selectedTicket.title}
                          onChange={(e) => handleUpdateTicket(selectedTicket.id, 'title', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Assignee</label>
                          <select 
                            value={selectedTicket.assignee_id || ''}
                            onChange={(e) => handleUpdateTicket(selectedTicket.id, 'assignee_id', e.target.value || null)}
                            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</label>
                          <select 
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateTicket(selectedTicket.id, 'status', e.target.value as any)}
                            className="w-full bg-zinc-950 border border-slate-855 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Reassigned">Reassigned</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Log Hours</label>
                          <input 
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            value={selectedTicket.timelog}
                            onChange={(e) => handleUpdateTicket(selectedTicket.id, 'timelog', parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Date</label>
                          <input 
                            type="date"
                            value={selectedTicket.date}
                            onChange={(e) => handleUpdateTicket(selectedTicket.id, 'date', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Remark / Progress Comments</label>
                        <textarea 
                          rows={2}
                          value={selectedTicket.remark}
                          onChange={(e) => handleUpdateTicket(selectedTicket.id, 'remark', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none resize-none"
                          placeholder="Daily updates..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/40 p-6 rounded-lg border border-zinc-800 text-center text-zinc-400 text-xs">
                    Please select a Ticket above to configure details or log hours.
                  </div>
                )}

                {/* Quick Add Ticket Card */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-zinc-350">Quick Log New Ticket</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Ticket Key (e.g. JIRA-105)" 
                      value={newTicketIdLocal} 
                      onChange={(e) => setNewTicketIdLocal(e.target.value.toUpperCase())}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <input 
                      type="text" 
                      placeholder="Activity Title" 
                      value={newTicketTitleLocal} 
                      onChange={(e) => setNewTicketTitleLocal(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={newTicketAssigneeLocal} 
                      onChange={(e) => setNewTicketAssigneeLocal(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="">Select Assignee...</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <select 
                      value={newTicketStatusLocal} 
                      onChange={(e) => setNewTicketStatusLocal(e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Reassigned">Reassigned</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      value={newTicketDateLocal} 
                      onChange={(e) => setNewTicketDateLocal(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <input 
                      type="number" 
                      placeholder="Hours (e.g. 4.0)" 
                      step="0.5"
                      min="0"
                      value={newTicketHoursLocal || ''} 
                      onChange={(e) => setNewTicketHoursLocal(parseFloat(e.target.value) || 0)}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Status remarks..." 
                      value={newTicketRemarkLocal} 
                      onChange={(e) => setNewTicketRemarkLocal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!newTicketIdLocal.trim() || !newTicketTitleLocal.trim()) return;
                      handleAddTicket({
                        id: newTicketIdLocal.trim(),
                        title: newTicketTitleLocal.trim(),
                        assignee_id: newTicketAssigneeLocal || null,
                        status: newTicketStatusLocal,
                        date: newTicketDateLocal,
                        remark: newTicketRemarkLocal.trim(),
                        timelog: newTicketHoursLocal
                      });
                      setNewTicketIdLocal('');
                      setNewTicketTitleLocal('');
                      setNewTicketAssigneeLocal('');
                      setNewTicketRemarkLocal('');
                      setNewTicketHoursLocal(0);
                      setNewTicketDateLocal(new Date().toISOString().split('T')[0]);
                    }}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 active:scale-98 transition rounded-lg font-bold text-xs text-center text-white flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Log Ticket Daily Task
                  </button>
                </div>
              </>
            ) : appMode === 'roadmap' ? (
              <>
                {/* Milestone Node List Row Controllers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Roadmap Nodes</h2>
                    <span className="text-xs text-zinc-500 font-mono">{milestones.length} stages declared</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/80">
                    {milestones.length === 0 ? (
                      <div className="text-center py-6 text-zinc-500 text-xs">
                        No milestones yet. Click "+ Add New Milestone Button" below.
                      </div>
                    ) : (
                      milestones.map((m, idx) => {
                        const isFocused = m.id === selectedMilestoneId;
                        const isDraggedOver = draggedOverMilestoneId === m.id;
                        return (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedMilestoneId(m.id)}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', m.id);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDraggedOverMilestoneId(m.id)}
                            onDragLeave={() => setDraggedOverMilestoneId(null)}
                            onDrop={(e) => {
                              handleMilestoneDrop(e, idx);
                              setDraggedOverMilestoneId(null);
                            }}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-grab active:cursor-grabbing border transition ${
                              isDraggedOver
                                ? 'border-indigo-500 bg-zinc-850 ring-2 ring-indigo-500/20'
                                : isFocused 
                                  ? 'bg-indigo-950/25 border-indigo-500/40 text-white' 
                                  : 'bg-zinc-900 hover:bg-zinc-800/80 border-transparent text-zinc-350'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-zinc-550 hover:text-zinc-350 shrink-0 cursor-grab" />
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.isHighlighted ? 'bg-red-500 ring-2 ring-red-500/30' : 'bg-[#1a235a]'}`} />
                              <span className="font-semibold text-xs truncate max-w-[120px] sm:max-w-[190px]">{m.title || '(Untitled Stage)'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                              <button 
                                onClick={(e) => handleDeleteMilestone(m.id, e)}
                                className="p-1 hover:text-rose-450 rounded hover:bg-zinc-800 text-zinc-500 bg-transparent border-0 cursor-pointer"
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
                    className="mt-3 w-full py-2 px-3 bg-indigo-650 hover:bg-indigo-550 active:scale-98 transition rounded-lg font-bold text-xs text-center text-white flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Milestone Node
                  </button>
                </div>

                {/* Focus Item Detail Configuration Form Panel */}
                {selectedMilestone ? (
                  <div className="border border-zinc-800 bg-zinc-900/60 p-4 rounded-lg space-y-4 shadow-sm font-sans">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-zinc-800 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-bold">CONFIGURING</span>
                        <h3 className="font-bold text-xs text-white truncate max-w-[180px]">{selectedMilestone.title}</h3>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteMilestone(selectedMilestone.id, e)}
                        className="text-rose-450 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Stage
                      </button>
                    </div>

                    {/* Form Controls */}
                    <div className="space-y-3">
                      
                      {/* Main Title & Subtitle */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Title</label>
                          <input 
                            type="text"
                            value={selectedMilestone.title}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'title', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="Sprint Stage"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subtitle / Date Range</label>
                          <input 
                            type="text"
                            value={selectedMilestone.subtitle}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'subtitle', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="[20-25 June]"
                          />
                        </div>
                      </div>

                      {/* Icon Selector list */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">Stage Node Icon Class</label>
                        <div className="grid grid-cols-6 gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/80">
                          {(['lock', 'traffic-light', 'warning', 'clipboard', 'check', 'sparkles'] as IconType[]).map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => handleUpdateMilestone(selectedMilestone.id, 'icon', icon)}
                              className={`py-1.5 rounded flex items-center justify-center text-xs font-semibold capitalize border transition ${
                                selectedMilestone.icon === icon 
                                  ? 'bg-zinc-800 border-indigo-500/50 text-indigo-400' 
                                  : 'border-transparent text-zinc-400 hover:bg-zinc-900/60'
                              }`}
                              title={icon}
                            >
                              <span className="text-[10px] font-mono">{icon.substring(0, 4)}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom State colors */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">State Status Text</label>
                          <input 
                            type="text"
                            value={selectedMilestone.status}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'status', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Preset Theme status color</label>
                          <select
                            value={selectedMilestone.statusBg + '|' + selectedMilestone.statusText}
                            onChange={(e) => {
                              const [bg, text] = e.target.value.split('|');
                              handleUpdateMilestone(selectedMilestone.id, { statusBg: bg, statusText: text });
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                          >
                            {STATUS_COLORS.map((col) => (
                              <option key={col.bg} value={col.bg + '|' + col.text}>{col.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Connector Highlighting */}
                      <div className="flex items-center gap-4 py-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedMilestone.isHighlighted}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'isHighlighted', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-800 rounded focus:ring-indigo-500"
                          />
                          <span className="text-[10px] font-bold text-zinc-350 uppercase">Highlight Node (Red Line Connector Accent)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedMilestone.hideStatus || false}
                            onChange={(e) => handleUpdateMilestone(selectedMilestone.id, 'hideStatus', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-800 rounded focus:ring-indigo-500"
                          />
                          <span className="text-[10px] font-bold text-zinc-350 uppercase">Hide Status Badge</span>
                        </label>
                      </div>

                      {/* Owner Badges Assignee Area */}
                      <div className="border-t border-zinc-800/85 pt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Assigned Badges ({selectedMilestone.assignees.length})</span>
                        </div>

                        {/* List current assignees */}
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMilestone.assignees.length === 0 ? (
                            <span className="text-[10px] text-zinc-500 italic">No resource badges attached to node</span>
                          ) : (
                            selectedMilestone.assignees.map((assignee) => (
                              <div 
                                key={assignee.id}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center shadow"
                                style={{ 
                                  backgroundColor: teamMembers.find(t => t.name.toLowerCase() === assignee.name.toLowerCase())?.color || assignee.color 
                                }}
                              >
                                <span>{assignee.name}</span>
                                <button 
                                  onClick={() => handleRemoveAssignee(selectedMilestone.id, assignee.id)}
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
                        <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-2">
                          <p className="text-[10px] text-zinc-400 font-bold">New Owner Badge Setup</p>
                          <div className="flex gap-2">
                            <select 
                              value={newAssigneeName}
                              onChange={(e) => setNewAssigneeName(e.target.value)}
                              className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">Select Developer...</option>
                              {teamMembers.map((m) => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddAssignee(selectedMilestone.id)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white whitespace-nowrap active:scale-98 transition"
                            >
                              Assign
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/40 p-6 rounded-lg border border-zinc-800 text-center text-zinc-400 text-xs">
                    Please insert or select a Milestone Node above to view block configuration form.
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Capacity Dates Selection */}
                <div className="space-y-3 border-b border-zinc-800/80 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Capacity Dates</h2>
                    <span className="text-xs text-zinc-500 font-mono">{capacityDates.length} selected</span>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="date"
                      id="capacity-date-picker"
                      className="flex-grow bg-zinc-950 border border-zinc-800/80 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val && !capacityDates.includes(val)) {
                            setCapacityDates([...capacityDates, val].sort());
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const picker = document.getElementById('capacity-date-picker') as HTMLInputElement;
                        const val = picker?.value;
                        if (val && !capacityDates.includes(val)) {
                          setCapacityDates([...capacityDates, val].sort());
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 active:scale-98 transition rounded-lg text-xs font-bold text-white whitespace-nowrap"
                    >
                      Add Date
                    </button>
                  </div>

                  {/* Selected Dates List */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-zinc-950/40 rounded-lg border border-zinc-800/80">
                    {capacityDates.length === 0 ? (
                      <span className="text-[10px] text-zinc-500 italic p-0.5">No dates selected. Showing global capacity.</span>
                    ) : (
                      capacityDates.map((d) => (
                        <div 
                          key={d}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs font-mono flex items-center gap-1 border border-zinc-750/50"
                        >
                          <span>{d}</span>
                          <button
                            type="button"
                            onClick={() => setCapacityDates(capacityDates.filter(x => x !== d))}
                            className="text-zinc-400 hover:text-zinc-250 font-bold ml-1 text-[11px] focus:outline-none"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick-add toggle based on existing ticket dates */}
                  {Array.from(new Set(tickets.map(t => t.date))).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Quick Select (Dates with Active Logged Tickets)</p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {Array.from(new Set(tickets.map(t => t.date)))
                          .sort()
                          .map(d => {
                            const isSelected = capacityDates.includes(d);
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setCapacityDates(capacityDates.filter(x => x !== d));
                                  } else {
                                    setCapacityDates([...capacityDates, d].sort());
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono border transition ${
                                  isSelected 
                                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300' 
                                    : 'bg-zinc-900 border-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-350'
                                }`}
                              >
                                {d}
                              </button>
                            );
                          })
                        }
                      </div>
                    </div>
                  )}

                  {capacityDates.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCapacityDates([])}
                        className="text-[9px] text-zinc-500 hover:text-rose-400 font-bold uppercase tracking-wider focus:outline-none"
                      >
                        Clear All Dates
                      </button>
                    </div>
                  )}
                </div>

                {/* Select Developers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Select Developers</h2>
                    <span className="text-xs text-zinc-500 font-mono">{selectedDeveloperIds.length} of {teamMembers.length} selected</span>
                  </div>

                  <div className="space-y-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/80 max-h-[60vh] overflow-y-auto">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-6 text-zinc-500 text-xs">
                        No developers found. Go to the "Developers" tab to add them.
                      </div>
                    ) : (
                      teamMembers.map((member, idx) => {
                        const isChecked = selectedDeveloperIds.includes(member.id);
                        const isDraggedOver = draggedOverDevId === member.id;
                        return (
                          <div 
                            key={member.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', member.id);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDraggedOverDevId(member.id)}
                            onDragLeave={() => setDraggedOverDevId(null)}
                            onDrop={(e) => {
                              handleDeveloperDrop(e, idx);
                              setDraggedOverDevId(null);
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition cursor-grab active:cursor-grabbing ${
                              isDraggedOver 
                                ? 'border-indigo-500 bg-zinc-800/80 ring-2 ring-indigo-500/20' 
                                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'
                            }`}
                          >
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 shrink-0" />
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              id={`checkbox-dev-${member.id}`}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedDeveloperIds(selectedDeveloperIds.filter(id => id !== member.id));
                                } else {
                                  setSelectedDeveloperIds([...selectedDeveloperIds, member.id]);
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-800 rounded focus:ring-indigo-500 focus:ring-2 focus:ring-offset-slate-900 cursor-pointer"
                            />
                            <label htmlFor={`checkbox-dev-${member.id}`} className="flex-grow cursor-pointer select-none">
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-2 h-2 rounded-full inline-block shrink-0" 
                                  style={{ backgroundColor: member.color || '#2580eb' }} 
                                />
                                <p className="font-semibold text-xs text-zinc-200">{member.name}</p>
                              </div>
                              <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold ml-3.5">{member.role}</p>
                            </label>
                            {capacityDates.length > 0 && (
                              <div className="flex items-center gap-1 shrink-0" title={showGlobalCapacityDevIds.includes(member.id) ? "Showing Global Capacity (Check to show dynamic dates capacity)" : "Showing Dynamic Dates Capacity (Uncheck to show global capacity)"}>
                                <input 
                                  type="checkbox"
                                  checked={!showGlobalCapacityDevIds.includes(member.id)}
                                  id={`checkbox-dyn-${member.id}`}
                                  onChange={() => {
                                    if (showGlobalCapacityDevIds.includes(member.id)) {
                                      setShowGlobalCapacityDevIds(showGlobalCapacityDevIds.filter(id => id !== member.id));
                                    } else {
                                      setShowGlobalCapacityDevIds([...showGlobalCapacityDevIds, member.id]);
                                    }
                                  }}
                                  className="w-3 h-3 text-indigo-600 bg-zinc-950 border-zinc-800 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor={`checkbox-dyn-${member.id}`} className="text-[9px] text-zinc-450 font-bold uppercase select-none cursor-pointer">Dyn</label>
                              </div>
                            )}
                            <span className="text-xs font-mono font-bold text-zinc-400 select-none">{member.utilization}%</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}


        {activeTab === 'styles' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-display">Style &amp; Appearance</h2>
            
            {appMode === 'roadmap' ? (
              <>
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Roadmap Main Header Title</label>
                  <input 
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="MILESTONE ROADMAP"
                  />
                </div>

                {/* Timeline axis line color */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Timeline Axis Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.timelineColor}
                      onChange={(e) => setConfig({ ...config, timelineColor: e.target.value })}
                      className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.timelineColor}
                      onChange={(e) => setConfig({ ...config, timelineColor: e.target.value })}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Card Background Color picker */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Card Frame Fill Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.cardBg}
                      onChange={(e) => setConfig({ ...config, cardBg: e.target.value })}
                      className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.cardBg}
                      onChange={(e) => setConfig({ ...config, cardBg: e.target.value })}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Card Border Customization */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Card Outer Outline Border Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={config.cardBorder}
                      onChange={(e) => setConfig({ ...config, cardBorder: e.target.value })}
                      className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.cardBorder}
                      onChange={(e) => setConfig({ ...config, cardBorder: e.target.value })}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Hide Status Pills Option */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Status Badge Visibility</label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.hideStatus || false}
                        onChange={(e) => setConfig({ ...config, hideStatus: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-2 text-xs text-zinc-300 font-medium">
                        {config.hideStatus ? 'Status pills hidden from view/export' : 'Status pills visible on cards'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Milestones per Card (Group Size) Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase font-sans">Milestones Per Card (Group Size)</label>
                  <select
                    value={config.groupSize || 0}
                    onChange={(e) => setConfig({ ...config, groupSize: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value={0}>Show all in a single card</option>
                    <option value={1}>1 milestone per card</option>
                    <option value={2}>2 milestones per card</option>
                    <option value={3}>3 milestones per card</option>
                    <option value={4}>4 milestones per card</option>
                    <option value={5}>5 milestones per card</option>
                  </select>
                </div>
              </>
            ) : appMode === 'capacity' ? (
              <>
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Capacity Main Header Title</label>
                  <input 
                    type="text"
                    value={capacityConfig.title}
                    onChange={(e) => setCapacityConfig({ ...capacityConfig, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="TEAM CAPACITY"
                  />
                </div>

                {/* Card Background Color */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Card Background Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={capacityConfig.cardBg}
                      onChange={(e) => setCapacityConfig({ ...capacityConfig, cardBg: e.target.value })}
                      className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={capacityConfig.cardBg}
                      onChange={(e) => setCapacityConfig({ ...capacityConfig, cardBg: e.target.value })}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Card Border Color */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Card Border Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={capacityConfig.cardBorder}
                      onChange={(e) => setCapacityConfig({ ...capacityConfig, cardBorder: e.target.value })}
                      className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={capacityConfig.cardBorder}
                      onChange={(e) => setCapacityConfig({ ...capacityConfig, cardBorder: e.target.value })}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Developers per Card (Group Size) Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase font-sans">Developers Per Card (Group Size)</label>
                  <select
                    value={capacityConfig.groupSize || 0}
                    onChange={(e) => setCapacityConfig({ ...capacityConfig, groupSize: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value={0}>Show all in a single card</option>
                    <option value={1}>1 developer per card</option>
                    <option value={2}>2 developers per card</option>
                    <option value={3}>3 developers per card</option>
                    <option value={4}>4 developers per card</option>
                    <option value={5}>5 developers per card</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs italic">
                No custom styles available for ticket board canvas.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prompt/Instructions Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 text-[11px] text-zinc-400 space-y-2 shrink-0">
        <div className="flex gap-1.5 items-start text-indigo-300">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="font-semibold text-zinc-300">Figma-Ready Assets</p>
        </div>
        <p className="leading-relaxed">
          Every detail is drawn with pure client-side vectors. Clicking <strong className="text-white">Export Vector SVG</strong> saves an infinitely-scalable vector asset ready for directly dropping into presentation slides or design files.
        </p>
      </div>
    </section>
  );
}

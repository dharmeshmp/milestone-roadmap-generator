import React from 'react';
import { Clipboard, Clock, Calendar, User, LayoutGrid, List, History } from 'lucide-react';
import { JiraTicket, TeamMember } from '../types';
import { Badge, EmptyState } from './ui';
import { getTicketHistory, TicketHistoryEntry } from '../app/actions/tickets';

const InlineRemarkInput = ({ 
  ticketId, 
  initialRemark, 
  handleUpdateTicket 
}: { 
  ticketId: string; 
  initialRemark: string; 
  handleUpdateTicket: <K extends keyof JiraTicket>(id: string, key: K, value: JiraTicket[K]) => void;
}) => {
  const [val, setVal] = React.useState(initialRemark);

  React.useEffect(() => {
    setVal(initialRemark);
  }, [initialRemark]);

  const handleBlur = () => {
    if (val !== initialRemark) {
      handleUpdateTicket(ticketId, 'remark', val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="Click to add remark..."
      className="bg-transparent text-zinc-450 italic placeholder:text-zinc-650/70 text-xs w-full border-0 focus:border-0 outline-none focus:outline-none focus:text-zinc-100 focus:bg-zinc-950/40 focus:ring-1 focus:ring-zinc-800/80 px-2.5 py-1 rounded transition-all"
    />
  );
};

interface TicketBoardCanvasProps {
  tickets: JiraTicket[];
  teamMembers: TeamMember[];
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  handleUpdateTicket: <K extends keyof JiraTicket>(id: string, key: K, value: JiraTicket[K]) => void;
}

export default function TicketBoardCanvas({
  tickets,
  teamMembers,
  selectedTicketId,
  setSelectedTicketId,
  selectedDate,
  setSelectedDate,
  handleUpdateTicket,
}: TicketBoardCanvasProps) {
  
  // State for view mode (board, list, or history)
  const [viewMode, setViewMode] = React.useState<'board' | 'list' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jira_board_view_mode');
      return (saved as 'board' | 'list' | 'history') || 'board';
    }
    return 'board';
  });

  const [history, setHistory] = React.useState<TicketHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('jira_board_view_mode', viewMode);
    if (viewMode === 'history') {
      setLoadingHistory(true);
      getTicketHistory().then((data) => {
        setHistory(data);
        setLoadingHistory(false);
      });
    }
  }, [viewMode]);

  // State for dragging column feedback
  const [draggedOverColumn, setDraggedOverColumn] = React.useState<'To Do' | 'In Progress' | 'Reassigned' | 'Done' | null>(null);

  // Filter tickets by selected date
  const filteredTickets = tickets.filter(t => t.date === selectedDate);

  // Group by status
  const todoTickets = filteredTickets.filter(t => t.status === 'To Do');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'In Progress');
  const reassignedTickets = filteredTickets.filter(t => t.status === 'Reassigned');
  const doneTickets = filteredTickets.filter(t => t.status === 'Done');

  // Helper to calculate total hours logged today
  const totalHours = filteredTickets.reduce((acc, curr) => acc + curr.timelog, 0);

  const getDeveloper = (devId: string | null) => {
    return teamMembers.find(m => m.id === devId);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, status: 'To Do' | 'In Progress' | 'Reassigned' | 'Done') => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      handleUpdateTicket(ticketId, 'status', status);
    }
  };

  const renderTicketCard = (ticket: JiraTicket) => {
    const isSelected = ticket.id === selectedTicketId;
    const developer = getDeveloper(ticket.assignee_id);

    return (
      <div 
        key={ticket.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, ticket.id)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTicketId(ticket.id);
        }}
        className={`bg-zinc-900/95 border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 select-none flex flex-col justify-between gap-3 relative overflow-hidden shrink-0 hover:-translate-y-0.5 ${
          isSelected 
            ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' 
            : 'border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800/80">
              {ticket.id}
            </span>
            {ticket.timelog > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-900/50">
                <Clock className="w-3 h-3" />
                {ticket.timelog} hrs
              </span>
            )}
          </div>
          <h4 className="font-bold text-sm text-zinc-100 leading-snug hover:text-indigo-400 transition-colors">
            {ticket.title || 'Untitled Activity'}
          </h4>
        </div>

        {ticket.remark && (
          <p className="text-[11px] text-zinc-400 bg-zinc-950/60 border-l-2 border-zinc-750 pl-2.5 py-1.5 italic line-clamp-2 rounded-r-md">
            "{ticket.remark}"
          </p>
        )}

        <div className="flex items-center justify-between border-t border-zinc-850 pt-2.5 mt-1">
          <div className="flex items-center gap-1.5">
            {developer ? (
              <>
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: developer.color || '#2580eb' }}
                />
                <span className="text-xs font-semibold text-zinc-350">{developer.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500 italic">Unassigned</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls for Date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold font-display tracking-tight text-zinc-100 uppercase">
              JIRA TICKETS &amp; TIMELOGS
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Daily project tasks, status monitoring, and engineer logs</p>
        </div>

        {/* View mode toggle and Date Selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View switcher toggle */}
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 gap-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1 active:scale-98 cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800/80'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1 active:scale-98 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800/80'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`p-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1 active:scale-98 cursor-pointer ${
                viewMode === 'history'
                  ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800/80'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
              title="Audit Log"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Log</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-100 focus:outline-none border-0 cursor-pointer font-mono [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {viewMode === 'history' ? (
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-850 bg-zinc-950/40 flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Ticket Activity Audit Log
            </h3>
            <span className="text-xs font-mono bg-zinc-850 px-2.5 py-0.5 rounded-full font-bold text-zinc-400 border border-zinc-800">
              {history.length} events
            </span>
          </div>
          <div className="divide-y divide-zinc-850/60 max-h-[60vh] overflow-y-auto">
            {loadingHistory ? (
              <div className="px-5 py-12 text-center text-zinc-500 font-medium">
                Loading audit logs...
              </div>
            ) : history.length === 0 ? (
              <div className="px-5 py-12 text-center text-zinc-500 font-medium">
                No activity logs available yet.
              </div>
            ) : (
              history.map((entry) => {
                let actionText = '';
                switch (entry.field) {
                  case 'created':
                    actionText = `Created ticket: "${entry.new_value}"`;
                    break;
                  case 'deleted':
                    actionText = `Deleted ticket: "${entry.old_value}"`;
                    break;
                  case 'status':
                    actionText = `Changed status from "${entry.old_value}" to "${entry.new_value}"`;
                    break;
                  case 'assignee_id':
                    const oldName = entry.old_assignee || (entry.old_value === 'Unassigned' ? 'Unassigned' : entry.old_value);
                    const newName = entry.new_assignee || (entry.new_value === 'Unassigned' ? 'Unassigned' : entry.new_value);
                    actionText = `Changed assignee from ${oldName} to ${newName}`;
                    break;
                  case 'timelog':
                    actionText = `Logged time changed from ${entry.old_value} hrs to ${entry.new_value} hrs`;
                    break;
                  default:
                    actionText = `Updated ${entry.field} from "${entry.old_value}" to "${entry.new_value}"`;
                    break;
                }

                let formattedTime = entry.timestamp;
                try {
                  const date = new Date(entry.timestamp);
                  formattedTime = date.toLocaleString();
                } catch (e) {}

                return (
                  <div key={entry.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-900/30 transition-colors">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-[10px] font-bold bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800/80 text-zinc-400 shrink-0">
                        {entry.ticket_id}
                      </span>
                      <span className="text-zinc-200 text-xs font-medium leading-relaxed">
                        {actionText}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono self-end sm:self-auto">
                      {formattedTime}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-zinc-300">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-850 text-zinc-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5 w-28">ID</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5 w-36">Status</th>
                  <th className="px-5 py-3.5 w-44">Assignee</th>
                  <th className="px-5 py-3.5 w-28">Logged Time</th>
                  <th className="px-5 py-3.5 max-w-xs">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 font-medium">
                      No tickets found for {selectedDate}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isSelected = ticket.id === selectedTicketId;
                    const developer = getDeveloper(ticket.assignee_id);
                    
                    let statusColorClasses = '';
                    switch (ticket.status) {
                      case 'To Do':
                        statusColorClasses = 'bg-zinc-900 text-zinc-400 border-zinc-800';
                        break;
                      case 'In Progress':
                        statusColorClasses = 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50';
                        break;
                      case 'Reassigned':
                        statusColorClasses = 'bg-amber-950/60 text-amber-400 border-amber-900/50';
                        break;
                      case 'Done':
                        statusColorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50';
                        break;
                    }

                    return (
                      <tr 
                        key={ticket.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(ticket.id);
                        }}
                        className={`hover:bg-zinc-900/60 cursor-pointer transition-colors duration-150 ${
                          isSelected ? 'bg-indigo-950/15' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-mono font-bold text-zinc-400">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                            )}
                            <span className="bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800/80">
                              {ticket.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-100 max-w-sm truncate">
                          {ticket.title || 'Untitled Activity'}
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-flex items-center">
                            <span className={`absolute left-2.5 w-1.5 h-1.5 rounded-full pointer-events-none ${
                              ticket.status === 'To Do' ? 'bg-zinc-500' :
                              ticket.status === 'In Progress' ? 'bg-indigo-500 animate-pulse' :
                              ticket.status === 'Reassigned' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`} />
                            <select
                              value={ticket.status}
                              onChange={(e) => handleUpdateTicket(ticket.id, 'status', e.target.value as any)}
                              className={`appearance-none pl-6 pr-6.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark] transition-all ${statusColorClasses}`}
                            >
                              <option value="To Do" className="bg-zinc-900 text-zinc-400">To Do</option>
                              <option value="In Progress" className="bg-zinc-900 text-indigo-400 font-bold">In Progress</option>
                              <option value="Reassigned" className="bg-zinc-900 text-amber-400 font-bold">Reassigned</option>
                              <option value="Done" className="bg-zinc-900 text-emerald-400 font-bold">Done</option>
                            </select>
                            <span className="absolute right-2.5 pointer-events-none text-[8px] opacity-40 select-none">▼</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-flex items-center">
                            <span 
                              className="absolute left-2.5 w-1.5 h-1.5 rounded-full pointer-events-none transition-colors"
                              style={{ backgroundColor: developer ? (developer.color || '#2580eb') : '#52525b' }}
                            />
                            <select
                              value={ticket.assignee_id || ''}
                              onChange={(e) => handleUpdateTicket(ticket.id, 'assignee_id', e.target.value || null)}
                              className="appearance-none pl-6 pr-6.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-800 bg-zinc-900/60 text-zinc-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark] transition-all"
                            >
                              <option value="" className="bg-zinc-900 text-zinc-500 font-semibold">Unassigned</option>
                              {teamMembers.map((member) => (
                                <option key={member.id} value={member.id} className="bg-zinc-900 text-zinc-200 font-semibold">
                                  {member.name}
                                </option>
                              ))}
                            </select>
                            <span className="absolute right-2.5 pointer-events-none text-[8px] opacity-40 select-none">▼</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          {ticket.timelog > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-900/50">
                              <Clock className="w-3 h-3" />
                              {ticket.timelog} hrs
                            </span>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-400 max-w-xs" onClick={(e) => e.stopPropagation()}>
                          <InlineRemarkInput
                            ticketId={ticket.id}
                            initialRemark={ticket.remark || ''}
                            handleUpdateTicket={handleUpdateTicket}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Grid Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Column 1: To Do */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDraggedOverColumn('To Do')}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'To Do'); setDraggedOverColumn(null); }}
            className={`rounded-xl p-4 border transition-all duration-200 flex flex-col gap-3 min-h-[400px] ${
              draggedOverColumn === 'To Do' 
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-zinc-900/60' 
                : 'bg-zinc-900/40 border-zinc-850'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-extrabold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                To Do
              </span>
              <span className="text-xs font-mono bg-zinc-850 px-2.5 py-0.5 rounded-full font-bold text-zinc-400 border border-zinc-800">
                {todoTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
              {todoTickets.length === 0 ? (
                <EmptyState className="text-zinc-500 bg-transparent border-dashed border-zinc-800">No tickets in To Do</EmptyState>
              ) : (
                todoTickets.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDraggedOverColumn('In Progress')}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'In Progress'); setDraggedOverColumn(null); }}
            className={`rounded-xl p-4 border transition-all duration-200 flex flex-col gap-3 min-h-[400px] ${
              draggedOverColumn === 'In Progress' 
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-zinc-900/60' 
                : 'bg-indigo-950/10 border-indigo-950/40'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                In Progress
              </span>
              <span className="text-xs font-mono bg-indigo-950/60 px-2.5 py-0.5 rounded-full font-bold text-indigo-400 border border-indigo-900/50">
                {inProgressTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
              {inProgressTickets.length === 0 ? (
                <EmptyState className="text-zinc-500 bg-transparent border-dashed border-zinc-800">No tickets in progress</EmptyState>
              ) : (
                inProgressTickets.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Column 3: Reassigned */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDraggedOverColumn('Reassigned')}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'Reassigned'); setDraggedOverColumn(null); }}
            className={`rounded-xl p-4 border transition-all duration-200 flex flex-col gap-3 min-h-[400px] ${
              draggedOverColumn === 'Reassigned' 
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-zinc-900/60' 
                : 'bg-amber-950/10 border-amber-950/30'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Reassigned
              </span>
              <span className="text-xs font-mono bg-amber-950/60 px-2.5 py-0.5 rounded-full font-bold text-amber-400 border border-amber-900/50">
                {reassignedTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
              {reassignedTickets.length === 0 ? (
                <EmptyState className="text-zinc-500 bg-transparent border-dashed border-zinc-800">No reassigned tickets</EmptyState>
              ) : (
                reassignedTickets.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Column 4: Done */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDraggedOverColumn('Done')}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'Done'); setDraggedOverColumn(null); }}
            className={`rounded-xl p-4 border transition-all duration-200 flex flex-col gap-3 min-h-[400px] ${
              draggedOverColumn === 'Done' 
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-zinc-900/60' 
                : 'bg-emerald-950/10 border-emerald-950/30'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Done
              </span>
              <span className="text-xs font-mono bg-emerald-950/60 px-2.5 py-0.5 rounded-full font-bold text-emerald-400 border border-emerald-900/50">
                {doneTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
              {doneTickets.length === 0 ? (
                <EmptyState className="text-zinc-500 bg-transparent border-dashed border-zinc-800">No tickets completed</EmptyState>
              ) : (
                doneTickets.map(renderTicketCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timelog summary footer */}
      <div className="border-t border-zinc-850 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Daily Total Hours Logged: <strong className="text-indigo-400 font-extrabold">{totalHours} hrs</strong></span>
        </div>
        <div>
          <span>Filtered Date: <strong className="text-zinc-300 font-extrabold">{selectedDate}</strong></span>
        </div>
      </div>
    </div>
  );
}

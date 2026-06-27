import React from 'react';
import { Clipboard, Clock, Calendar, User } from 'lucide-react';
import { JiraTicket, TeamMember } from '../types';
import { Badge, EmptyState } from './ui';

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

        {/* Date Selector input */}
        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg shrink-0">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-100 focus:outline-none border-0 cursor-pointer font-mono [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Kanban Grid Columns */}
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

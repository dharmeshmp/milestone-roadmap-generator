import React from 'react';
import { Clipboard, Clock, MessageSquare, Calendar, ChevronRight, User } from 'lucide-react';
import { JiraTicket, TeamMember } from '../types';

interface TicketBoardCanvasProps {
  tickets: JiraTicket[];
  teamMembers: TeamMember[];
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export default function TicketBoardCanvas({
  tickets,
  teamMembers,
  selectedTicketId,
  setSelectedTicketId,
  selectedDate,
  setSelectedDate,
}: TicketBoardCanvasProps) {
  
  // Filter tickets by selected date
  const filteredTickets = tickets.filter(t => t.date === selectedDate);

  // Group by status
  const todoTickets = filteredTickets.filter(t => t.status === 'To Do');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'In Progress');
  const doneTickets = filteredTickets.filter(t => t.status === 'Done');

  // Helper to calculate total hours logged today
  const totalHours = filteredTickets.reduce((acc, curr) => acc + curr.timelog, 0);

  const getDeveloper = (devId: string | null) => {
    return teamMembers.find(m => m.id === devId);
  };

  const renderTicketCard = (ticket: JiraTicket) => {
    const isSelected = ticket.id === selectedTicketId;
    const developer = getDeveloper(ticket.assignee_id);

    return (
      <div 
        key={ticket.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTicketId(ticket.id);
        }}
        className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between gap-3 relative overflow-hidden ${
          isSelected 
            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20' 
            : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {ticket.id}
            </span>
            {ticket.timelog > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-55/60 px-2 py-0.5 rounded-full border border-indigo-100">
                <Clock className="w-3 h-3" />
                {ticket.timelog} hrs
              </span>
            )}
          </div>
          <h4 className="font-bold text-sm text-[#1a235a] leading-snug">
            {ticket.title || 'Untitled Activity'}
          </h4>
        </div>

        {ticket.remark && (
          <p className="text-[11px] text-slate-500 bg-slate-50 border-l-2 border-slate-300 pl-2 py-1 italic line-clamp-2 rounded-r-md">
            "{ticket.remark}"
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
          <div className="flex items-center gap-1.5">
            {developer ? (
              <>
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: developer.color || '#2580eb' }}
                />
                <span className="text-xs font-semibold text-slate-700">{developer.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 italic">Unassigned</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      id="tickets-board-canvas"
      className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col gap-6"
    >
      {/* Header controls for Date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-[#1a235a]" />
            <h2 className="text-xl font-bold font-display tracking-tight text-[#1a235a]">
              JIRA TICKETS &amp; TIMELOGS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Daily project tasks, status monitoring, and engineer logs</p>
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-750 focus:outline-none border-0 cursor-pointer font-mono"
          />
        </div>
      </div>

      {/* Kanban Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: To Do */}
        <div className="bg-slate-50/75 rounded-2xl p-4 border border-slate-200/50 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-extrabold text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              To Do
            </span>
            <span className="text-xs font-mono bg-slate-200/80 px-2 py-0.5 rounded-full font-bold text-slate-600">
              {todoTickets.length}
            </span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
            {todoTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">No tickets in To Do</div>
            ) : (
              todoTickets.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-indigo-50/20 rounded-2xl p-4 border border-indigo-100/50 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-extrabold text-indigo-650 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              In Progress
            </span>
            <span className="text-xs font-mono bg-indigo-100/60 px-2 py-0.5 rounded-full font-bold text-indigo-700">
              {inProgressTickets.length}
            </span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
            {inProgressTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">No tickets in progress</div>
            ) : (
              inProgressTickets.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="bg-emerald-50/20 rounded-2xl p-4 border border-emerald-100/30 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Done
            </span>
            <span className="text-xs font-mono bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold text-emerald-800">
              {doneTickets.length}
            </span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5">
            {doneTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">No tickets completed</div>
            ) : (
              doneTickets.map(renderTicketCard)
            )}
          </div>
        </div>
      </div>

      {/* Timelog summary footer */}
      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Daily Total Hours Logged: <strong className="text-[#1a235a]">{totalHours} hrs</strong></span>
        </div>
        <div>
          <span>Filtered Date: <strong className="text-slate-700">{selectedDate}</strong></span>
        </div>
      </div>
    </div>
  );
}

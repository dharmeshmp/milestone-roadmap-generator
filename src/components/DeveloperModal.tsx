import React from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Users, Info } from 'lucide-react';
import { TeamMember, CapacityConfig } from '../types';
import { ASSIGNEE_COLORS } from './Sidebar';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  capacityConfig: CapacityConfig;
  selectedTeamMemberId: string | null;
  setSelectedTeamMemberId: (id: string | null) => void;
  newMemberName: string;
  setNewMemberName: (val: string) => void;
  newMemberRole: string;
  setNewMemberRole: (val: string) => void;
  newMemberUtil: number;
  setNewMemberUtil: (val: number) => void;
  handleAddTeamMember: () => void;
  handleUpdateTeamMember: <K extends keyof TeamMember>(id: string, key: K, value: TeamMember[K]) => void;
  handleDeleteTeamMember: (id: string, e?: React.MouseEvent) => void;
  handleMoveTeamMember: (index: number, direction: 'up' | 'down') => void;
}

export default function DeveloperModal({
  isOpen,
  onClose,
  teamMembers,
  capacityConfig,
  selectedTeamMemberId,
  setSelectedTeamMemberId,
  newMemberName,
  setNewMemberName,
  newMemberRole,
  setNewMemberRole,
  newMemberUtil,
  setNewMemberUtil,
  handleAddTeamMember,
  handleUpdateTeamMember,
  handleDeleteTeamMember,
  handleMoveTeamMember,
}: DeveloperModalProps) {
  if (!isOpen) return null;

  const selectedTeamMember = teamMembers.find(m => m.id === selectedTeamMemberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-display">Global Developer Directory</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition active:scale-95 bg-transparent border-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Developers list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Engineers List</h3>
              <span className="text-[11px] text-slate-500 font-mono">{teamMembers.length} profiles loaded</span>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No developers added. Create a teammate profile using the form.
                </div>
              ) : (
                teamMembers.map((member, idx) => {
                  const isFocused = member.id === selectedTeamMemberId;
                  return (
                    <div 
                      key={member.id}
                      onClick={() => setSelectedTeamMemberId(member.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer border transition ${
                        isFocused 
                          ? 'bg-indigo-950/25 border-indigo-500/40 text-white' 
                          : 'bg-slate-900 hover:bg-slate-850 border-transparent text-slate-350'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10 ring-2" 
                          style={{ 
                            backgroundColor: member.color || '#2580eb', 
                            borderColor: member.color || '#2580eb',
                            boxShadow: `0 0 8px ${member.color}40`
                          }}
                        />
                        <div className="truncate">
                          <p className="font-semibold text-xs text-slate-200">{member.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{member.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <span className="text-[10px] font-mono font-bold mr-1.5 text-slate-450">{member.utilization}%</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveTeamMember(idx, 'up'); }}
                          disabled={idx === 0}
                          className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800 text-slate-400 bg-transparent border-0 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveTeamMember(idx, 'down'); }}
                          disabled={idx === teamMembers.length - 1}
                          className="p-1 hover:text-indigo-400 disabled:opacity-20 rounded hover:bg-slate-800 text-slate-400 bg-transparent border-0 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteTeamMember(member.id, e)}
                          className="p-1 hover:text-rose-450 rounded hover:bg-slate-850 text-slate-500 bg-transparent border-0 cursor-pointer"
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

            {/* Quick Add Teammate Card */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Quick Add Teammate</h4>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newMemberName} 
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTeamMember(); }}
                />
                <select 
                  value={newMemberRole} 
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Associate">Associate</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-405 font-mono">Default Util: {newMemberUtil}%</span>
                <button 
                  onClick={handleAddTeamMember}
                  className="px-3.5 py-1 bg-pink-700 hover:bg-pink-650 rounded-lg text-xs font-bold text-white transition active:scale-95"
                >
                  Add Teammate
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Editing selected teammate */}
          <div className="flex flex-col justify-start">
            {selectedTeamMember ? (
              <div className="border border-slate-800 bg-slate-950/20 p-4 rounded-xl space-y-4 shadow-sm h-full">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-850 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-bold">CONFIGURE PROFILE</span>
                    <h4 className="font-bold text-xs text-white truncate max-w-[120px]">
                      {selectedTeamMember.name}
                    </h4>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteTeamMember(selectedTeamMember.id, e)}
                    className="text-rose-450 hover:text-rose-400 text-xs flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                      <input 
                        type="text"
                        value={selectedTeamMember.name}
                        onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
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
                      <span>Utilization Percentage</span>
                      <span className="text-white font-mono">{selectedTeamMember.utilization}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="150" 
                      step="5"
                      value={selectedTeamMember.utilization} 
                      onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'utilization', parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Badge Color Accent</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={selectedTeamMember.color || '#2580eb'} 
                        onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={selectedTeamMember.color || '#2580eb'} 
                        onChange={(e) => handleUpdateTeamMember(selectedTeamMember.id, 'color', e.target.value)}
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    {/* Presets */}
                    <div className="flex gap-1.5 items-center pt-2 overflow-x-auto">
                      {ASSIGNEE_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => handleUpdateTeamMember(selectedTeamMember.id, 'color', col.value)}
                          className={`w-3.5 h-3.5 rounded-full border transition flex justify-center items-center ${
                            selectedTeamMember.color === col.value ? 'border-white scale-125 ring-2 ring-indigo-500/30' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: col.value }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs bg-slate-950/20 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 h-full">
                <Info className="w-8 h-8 text-slate-650" />
                <span>Select a developer profile from the list to modify details.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-semibold active:scale-95 transition"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}

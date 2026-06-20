import { Milestone, RoadmapConfig, TeamMember, CapacityConfig } from './types';

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Node Tickets',
    subtitle: 'Daily',
    icon: 'lock',
    status: 'UPCOMING',
    statusBg: 'bg-[#1a235a]',
    statusText: 'text-white',
    isHighlighted: false,
    assignees: [
      { id: '1-1', name: 'Saurav', color: '#db3e3e' },
      { id: '1-2', name: 'Shivam', color: '#e28a2a' },
      { id: '1-3', name: 'Ronak', color: '#2580eb' }
    ]
  },
  {
    id: '2',
    title: 'Payson Gap Analysis',
    subtitle: '[24 June]',
    icon: 'traffic-light',
    status: 'UPCOMING',
    statusBg: 'bg-[#1a235a]',
    statusText: 'text-white',
    isHighlighted: false,
    assignees: [
      { id: '2-1', name: 'Ronak', color: '#2580eb' },
      { id: '2-2', name: 'Dharmesh', color: '#16a34a' }
    ]
  },
  {
    id: '3',
    title: 'Payson Code Structure Analysis',
    subtitle: '[24 June]',
    icon: 'warning',
    status: 'UPCOMING',
    statusBg: 'bg-[#1a235a]',
    statusText: 'text-white',
    isHighlighted: true,
    assignees: [
      { id: '3-1', name: 'Shashvat', color: '#f59e0b' }
    ]
  },
  {
    id: '4',
    title: 'Payson UI Kit Standard',
    subtitle: '[24 June]',
    icon: 'clipboard',
    status: 'UPCOMING',
    statusBg: 'bg-[#1a235a]',
    statusText: 'text-white',
    isHighlighted: false,
    assignees: [
      { id: '4-1', name: 'Shreya', color: '#c0522b' },
      { id: '4-2', name: 'Dharmesh', color: '#16a34a' }
    ]
  }
];

export const DEFAULT_CONFIG: RoadmapConfig = {
  title: 'MILESTONE ROADMAP',
  timelineColor: '#ccd9ff', // light blue from original image
  canvasBg: 'grid',
  cardBg: '#eef2ff', // soft light indigo-blue background
  cardBorder: '#1a235a', // dark navy blue border from original image
  hideStatus: false
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Ronak', role: 'Specialist', utilization: 90, color: '#2580eb' },
  { id: 'tm-2', name: 'Shivam', role: 'Associate', utilization: 85, color: '#e28a2a' },
  { id: 'tm-3', name: 'Saurav', role: 'Associate', utilization: 85, color: '#db3e3e' },
  { id: 'tm-4', name: 'Shashvat', role: 'Associate', utilization: 75, color: '#4f46e5' }
];

export const DEFAULT_CAPACITY_CONFIG: CapacityConfig = {
  title: 'TEAM CAPACITY',
  cardBg: '#ffffff',
  cardBorder: '#dee5f7',
  greenThreshold: 75,
  orangeThreshold: 90
};


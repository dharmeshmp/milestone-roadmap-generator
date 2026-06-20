export type IconType = 'lock' | 'traffic-light' | 'warning' | 'clipboard' | 'check' | 'code' | 'calendar' | 'sparkles';

export interface Assignee {
  id: string;
  name: string;
  color: string; // Tailwind bg class like 'bg-red-500' or direct hex
}

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  icon: IconType;
  status: string;
  statusBg: string; // e.g., 'bg-[#1d2757]'
  statusText: string; // e.g., 'text-white'
  isHighlighted: boolean; // if true, uses red node and red horizontal connector
  assignees: Assignee[];
  hideStatus?: boolean; // per-card toggle to hide the status badge
}

export interface RoadmapConfig {
  title: string;
  timelineColor: string; // e.g., '#e0f2fe' (sky-100)
  canvasBg: 'light' | 'grid' | 'dark' | 'slate';
  cardBg: string; // hex or Tailwind bg-class
  cardBorder: string; // hex or Tailwind border-class
  hideStatus?: boolean; // toggle visibility of the rightmost status pill
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // e.g. 'Specialist', 'Associate'
  utilization: number; // 0 to 105
  color: string; // Hex color for developer badge
}

export interface CapacityConfig {
  title: string;
  cardBg: string;
  cardBorder: string;
  greenThreshold: number; // typically 75
  orangeThreshold: number; // typically 90
}


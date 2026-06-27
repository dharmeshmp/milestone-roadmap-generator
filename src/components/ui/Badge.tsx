import React from 'react';
import { cn } from '../../lib/utils';

// ─── Variant types ─────────────────────────────────────────────────────────────

type BadgeVariant = 'role' | 'status' | 'assignee' | 'mono';

interface BaseBadgeProps {
  children: React.ReactNode;
  className?: string;
}

// role — indigo pill (e.g. FRONTEND, SPECIALIST)
interface RoleBadgeProps extends BaseBadgeProps {
  variant: 'role';
}

// status — accepts custom bg+text Tailwind classes (e.g. bg-emerald-100 text-emerald-800)
interface StatusBadgeProps extends BaseBadgeProps {
  variant: 'status';
}

// assignee — colored circle pill with white text; accepts a hex color string
interface AssigneeBadgeProps extends BaseBadgeProps {
  variant: 'assignee';
  color: string;
}

// mono — monospace gray tag (e.g. JIRA-101)
interface MonoBadgeProps extends BaseBadgeProps {
  variant: 'mono';
}

type BadgeProps = RoleBadgeProps | StatusBadgeProps | AssigneeBadgeProps | MonoBadgeProps;

/**
 * Badge — unified badge/pill component with 4 semantic variants:
 *  - `role`     → indigo pill (uppercase role label)
 *  - `status`   → custom bg/text class status chip
 *  - `assignee` → colored rounded-full name pill
 *  - `mono`     → monospace gray tag
 */
export function Badge(props: BadgeProps) {
  const { variant, children, className } = props;

  if (variant === 'role') {
    return (
      <span
        className={cn(
          'px-2.5 py-1 rounded-md bg-indigo-50 text-[#4f46e5] text-[10px] font-extrabold uppercase tracking-wider',
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'status') {
    return (
      <span
        className={cn(
          'px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold tracking-wider uppercase shadow-sm border border-black/5',
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'assignee') {
    const { color } = props as AssigneeBadgeProps;
    return (
      <span
        className={cn(
          'px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-sm flex items-center gap-1 select-none',
          className
        )}
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    );
  }

  // mono
  return (
    <span
      className={cn(
        'text-[10px] font-bold font-mono text-zinc-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider',
        className
      )}
    >
      {children}
    </span>
  );
}

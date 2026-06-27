import React from 'react';
import { cn } from '../../lib/utils';

interface CanvasHeaderProps {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode; // optional subtitle / date line
  className?: string;
}

/**
 * CanvasHeader — shared canvas section header.
 * Renders a bold title, optional action slot (e.g. DownloadSVGButton),
 * optional children (subtitles, date lines), and the lavender accent bar.
 */
export function CanvasHeader({ title, action, children, className }: CanvasHeaderProps) {
  return (
    <div className={cn('mb-6 relative pb-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1a235a]">
          {title.toUpperCase()}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Optional subtitle / date row */}
      {children && (
        <div className="mt-1 text-[11px] text-zinc-500 font-mono">{children}</div>
      )}

      {/* Lavender accent bar with navy cap */}
      <div className="h-1 bg-[#dee4ff] w-full mt-2.5 rounded-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-full bg-[#1a235a] rounded-full" />
      </div>
    </div>
  );
}

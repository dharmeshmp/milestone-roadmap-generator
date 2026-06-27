import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * CanvasCard — the shared white card wrapper used across all canvas views.
 * Provides consistent rounded corners, padding, shadow, and border.
 */
export function CanvasCard({ children, className, style, id }: CanvasCardProps) {
  return (
    <div
      id={id}
      className={cn(
        'bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200/60 overflow-hidden relative',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

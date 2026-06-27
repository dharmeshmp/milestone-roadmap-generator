import React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — centered italic placeholder shown when a list/column is empty.
 */
export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-10 text-zinc-400 text-xs italic',
        className
      )}
    >
      {children}
    </div>
  );
}

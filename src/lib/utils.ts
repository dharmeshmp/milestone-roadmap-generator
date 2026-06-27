import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — merge Tailwind CSS class names safely.
 * Combines clsx (conditional logic) with tailwind-merge (de-duplication).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

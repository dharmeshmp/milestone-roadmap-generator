import React from 'react';
import { Download } from 'lucide-react';

interface DownloadSVGButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * DownloadSVGButton — indigo ghost button used inside canvas headers
 * to trigger per-group SVG export.
 */
export function DownloadSVGButton({ onClick, label = 'Download Image' }: DownloadSVGButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-export-ignore="true"
      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition active:scale-98 cursor-pointer border border-indigo-100/60"
      title="Download this card as PNG"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

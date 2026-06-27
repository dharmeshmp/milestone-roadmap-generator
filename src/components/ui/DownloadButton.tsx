import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface DownloadButtonProps {
  onDownload: (format: 'png' | 'svg') => void;
}

/**
 * DownloadButton — drop-down selection button for PNG & SVG downloads.
 */
export function DownloadButton({ onDownload }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} data-export-ignore="true">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition active:scale-98 cursor-pointer border border-indigo-100/60 shadow-sm"
        title="Download options"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download</span>
        <ChevronDown className="w-3 h-3 opacity-85" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              onDownload('png');
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            PNG Image
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload('svg');
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            SVG Vector
          </button>
        </div>
      )}
    </div>
  );
}

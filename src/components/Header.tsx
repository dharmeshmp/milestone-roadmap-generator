import { Sliders, RotateCcw, Download, Users, FileJson, Upload, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  handleResetToDefault: () => void;
  onOpenDeveloperModal: () => void;
  onOpenSettingsModal: () => void;
  handleExportJSON: () => void;
  handleImportJSON: (data: any) => void;
}

export default function Header({ 
  handleResetToDefault, 
  onOpenDeveloperModal,
  onOpenSettingsModal,
  handleExportJSON,
  handleImportJSON
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        handleImportJSON(json);
      } catch {
        alert('Invalid JSON file format!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-5 py-0 h-14 flex items-center justify-between shrink-0 relative z-20">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0">
          <Sliders className="w-4 h-4 text-zinc-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100 truncate font-display">
              Sprint Capacity &amp; Roadmap Studio
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-zinc-800 text-zinc-500 font-semibold tracking-wider rounded border border-zinc-700/60 uppercase shrink-0">
              v1.2
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-zinc-500 truncate">
            Design and export high-resolution roadmap graphics
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Icon-only buttons for secondary actions */}
        <button
          onClick={onOpenDeveloperModal}
          title="Manage Developers"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettingsModal}
          title="Global Settings"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-zinc-800" />

        {/* More dropdown for JSON import/export/reset */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors text-xs font-medium cursor-pointer"
          >
            More
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="py-1">
                <button
                  onClick={() => { handleExportJSON(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-zinc-500" />
                  Export JSON
                </button>
                <label className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-zinc-500" />
                  Import JSON
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => { handleFileChange(e); setMenuOpen(false); }}
                    className="hidden"
                  />
                </label>
                <div className="h-px bg-zinc-800 my-1" />
                <button
                  onClick={() => { handleResetToDefault(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Mockup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

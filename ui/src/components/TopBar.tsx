import { Search, RefreshCw, Rocket } from 'lucide-react';
import LobsterIcon from './LobsterIcon';

export default function TopBar() {
  return (
    <header className="h-14 hidden md:flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a14]/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <LobsterIcon size={20} className="text-[#e63946]" />
        <Rocket size={14} className="text-[#ff6b35]" />
        <span className="text-sm font-bold bg-gradient-to-r from-[#e63946] via-[#ff6b35] to-[#f7b32b] bg-clip-text text-transparent">
          rocinante
        </span>
        <span className="text-xs text-gray-600 ml-1">ops deck</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-500 border border-white/5">
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-4 text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <RefreshCw size={16} />
        </button>
        <div className="w-7 h-7 rounded-full bg-[#7c5cfc]/30 flex items-center justify-center text-xs text-white font-semibold">
          S
        </div>
      </div>
    </header>
  );
}

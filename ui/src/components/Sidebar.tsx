import { NavLink, useLocation } from 'react-router-dom';
import {
  Brain,
  PanelLeftClose,
  PanelLeft,
  Code2,
  BookOpen,
  Menu,
  X,
  Notebook,
  FolderGit2,
  FolderOpen,
  Rocket,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import LobsterIcon from './LobsterIcon';

const navItems = [
  { to: '/repos', icon: FolderGit2, label: 'Repos' },
  { to: '/codebase', icon: FolderOpen, label: 'Codebase' },
  { to: '/search', icon: Code2, label: 'Search' },
  { to: '/prompts', icon: BookOpen, label: 'Prompts' },
  { to: '/journal', icon: Notebook, label: 'Journal' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on nav
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a14] border-b border-white/5 flex items-center px-4 z-40">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <LobsterIcon size={22} className="text-[#e63946]" />
          <span className="text-sm font-bold flex items-center gap-1.5">
            <Rocket size={14} className="text-[#ff6b35]" />
            <span className="bg-gradient-to-r from-[#e63946] via-[#ff6b35] to-[#f7b32b] bg-clip-text text-transparent">
              ops deck
            </span>
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col border-r border-white/5 bg-[#0a0a14] transition-all duration-200 z-30
          ${/* Mobile: slide in/out */''}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:w-16' : 'md:w-52'}
          w-64
        `}
      >
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/5">
          <LobsterIcon size={collapsed ? 22 : 26} className="text-[#e63946] shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold tracking-wide flex items-center gap-1.5">
              <Rocket size={14} className="text-[#ff6b35]" />
              <span className="bg-gradient-to-r from-[#e63946] via-[#ff6b35] to-[#f7b32b] bg-clip-text text-transparent">
                ops deck
              </span>
            </span>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="ml-auto text-gray-500 hover:text-white transition-colors hidden md:block"
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-gray-500 hover:text-white transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#7c5cfc]/15 text-white shadow-[inset_0_0_0_1px_rgba(124,92,252,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

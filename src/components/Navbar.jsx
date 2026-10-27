import React, { useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  Plus, 
  LogIn, 
  LogOut, 
  GraduationCap,
  ChevronDown,
  User,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({
  isSupabaseLive,
  isSheetsLive,
  user,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenSheetsDrawer,
  onOpenConfigModal,
  onOpenVivaModal,
  onOpenDbModal,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-tight">
                CivicPulse
              </span>
              <span className="text-[10px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] font-medium hidden sm:inline-block">
                Ward 14
              </span>
            </div>

            {/* Subtle Status Dots */}
            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-white/[0.08] text-[11px] text-slate-400">
              <span 
                className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors"
                onClick={onOpenConfigModal}
                title="Supabase Database Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isSupabaseLive ? 'PostgreSQL' : 'Demo DB'}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span 
                className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors"
                onClick={onOpenSheetsDrawer}
                title="Google Sheets Sync Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSheetsLive ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <span>Google Sheets</span>
              </span>
            </div>
          </div>

          {/* Right: Clean, Uncluttered Action Bar */}
          <div className="flex items-center space-x-2">
            
            {/* Database & Users Button */}
            <button
              onClick={onOpenDbModal}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Inspect Database Users & Grievances"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>DB & Users</span>
            </button>

            {/* Assessment Guide Button */}
            <button
              onClick={onOpenVivaModal}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 transition-colors"
              title="View 8-Point Assessment Guide"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Rubric Guide</span>
              <span className="text-[10px] font-mono bg-purple-500/30 text-purple-200 px-1 py-0.2 rounded ml-1">
                8/8
              </span>
            </button>

            {/* Google Sheets Modal Button */}
            <button
              onClick={onOpenSheetsDrawer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Google Sheets Sync Hub"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenConfigModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="API Keys & Database Config"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* + New Issue CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20 transition-colors ml-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Issue</span>
            </button>

            {/* User Profile / Logout Dropdown */}
            {user ? (
              <div className="relative pl-2 border-l border-white/[0.08]">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center text-xs font-bold">
                    {(user.user_metadata?.full_name || user.email || 'A').slice(0, 1).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111724] border border-white/[0.1] rounded-xl p-2 shadow-2xl z-50 text-xs">
                    <div className="px-2.5 py-2 border-b border-white/[0.06]">
                      <p className="font-semibold text-white truncate">
                        {user.user_metadata?.full_name || 'Aditya Singh'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); onOpenDbModal(); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center space-x-2 mt-1"
                    >
                      <Database className="w-3.5 h-3.5 text-sky-400" />
                      <span>Database & Users</span>
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 mt-0.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-colors ml-1"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  LogIn, 
  LogOut, 
  ChevronDown,
  User,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  isSupabaseLive,
  isSheetsLive,
  user,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenSheetsDrawer,
  onOpenConfigModal,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#080A10]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity (Make.com Style) */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-base shadow-sm">
              🏛️
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold text-white tracking-tight">
                CivicPulse
              </span>
              <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold hidden sm:inline-block">
                Ward 14 Dispatch
              </span>
            </div>

            {/* Live Service Dots */}
            <div className="hidden md:flex items-center space-x-2.5 pl-3.5 border-l border-white/[0.08] text-xs text-slate-400">
              <button 
                onClick={onOpenConfigModal}
                className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
                title="Supabase Database Status"
              >
                <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-medium">{isSupabaseLive ? 'PostgreSQL Live' : 'Demo DB'}</span>
              </button>
              <span className="text-slate-600">•</span>
              <button 
                onClick={onOpenSheetsDrawer}
                className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
                title="Google Sheets Live Sync Status"
              >
                <span className={`w-2 h-2 rounded-full ${isSheetsLive ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
                <span className="text-[11px] font-medium">Google Sheets</span>
              </button>
            </div>
          </div>

          {/* Right: Clean, Production Action Bar */}
          <div className="flex items-center space-x-2.5">
            
            {/* Google Sheets Hub */}
            <button
              onClick={onOpenSheetsDrawer}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-medium"
              title="Google Sheets Live Sync Hub"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Sheets Hub</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenConfigModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer"
              title="Database & API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary Make.com Purple Gradient CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 ml-1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Issue</span>
            </button>

            {/* User Profile / Logout Dropdown */}
            {user ? (
              <div className="relative pl-2 border-l border-white/[0.08]">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {(user.user_metadata?.full_name || user.email || 'A').slice(0, 1).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0D1019] border border-white/[0.1] rounded-2xl p-2.5 shadow-2xl z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-white/[0.06]">
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-white truncate text-sm">
                          {user.user_metadata?.full_name || 'Aditya Singh'}
                        </p>
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        Verified Citizen
                      </span>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); onOpenConfigModal(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center space-x-2 mt-1 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Connection Settings</span>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 mt-0.5 cursor-pointer"
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
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-colors ml-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-purple-400" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  Plus, 
  LogIn, 
  LogOut, 
  User, 
  GraduationCap,
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
  onOpenVivaModal,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                  CivicPulse
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Full-Stack
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Grievance & Municipal Infrastructure Hub
              </p>
            </div>
          </div>

          {/* Integration Status Badges */}
          <div className="hidden lg:flex items-center space-x-2">
            <button 
              onClick={onOpenConfigModal}
              title="Click to configure Supabase credentials"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSupabaseLive 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase: {isSupabaseLive ? 'Live DB' : 'Demo DB'}</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            <button 
              onClick={onOpenSheetsDrawer}
              title="Click to view Google Sheets live sync details"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSheetsLive 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets: {isSheetsLive ? 'Synced' : 'Ready'}</span>
              <span className={`w-2 h-2 rounded-full ${isSheetsLive ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`} />
            </button>
          </div>

          {/* Action Center */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Viva Rubric Guide Button */}
            <button
              onClick={onOpenVivaModal}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 hover:text-white transition-all shadow-sm"
              title="View Assessment Rubric & Talking Points"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Assessment Guide</span>
              <span className="md:hidden">Rubric</span>
            </button>

            {/* Google Sheets Trigger */}
            <button
              onClick={onOpenSheetsDrawer}
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Open Google Sheets Hub"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Sheets Sync</span>
            </button>

            {/* Config modal button */}
            <button
              onClick={onOpenConfigModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Configure Supabase & Google Sheets keys"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Report Issue Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-200">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aditya Singh'}</p>
                    <p className="text-slate-400 text-[10px] truncate max-w-[110px]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <LogIn className="w-4 h-4 text-sky-400" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}

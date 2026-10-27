import React from 'react';
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
  CheckCircle,
  Users
} from 'lucide-react';

export default function Navbar({
  isSupabaseLive,
  isSheetsLive,
  user,
  issuesCount,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenSheetsDrawer,
  onOpenConfigModal,
  onOpenVivaModal,
  onOpenDbModal,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0E131F]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Organization & Project Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-tight">
                  CivicPulse
                </span>
                <span className="text-slate-600 font-light">/</span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline-flex items-center space-x-1 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  <span>Ward 14 Operations</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </span>
              </div>
            </div>

            {/* Live System Health Pills */}
            <div className="hidden xl:flex items-center space-x-2 pl-4 border-l border-white/[0.08]">
              <button 
                onClick={onOpenConfigModal}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 transition-colors"
                title="Supabase Database Connection Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>Supabase: {isSupabaseLive ? 'PostgreSQL Live' : 'Demo DB'}</span>
              </button>

              <button 
                onClick={onOpenSheetsDrawer}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 transition-colors"
                title="Google Sheets Live Webhook Sync Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSheetsLive ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <span>Sheets Sync: {isSheetsLive ? 'Connected' : 'Active'}</span>
              </button>
            </div>
          </div>

          {/* Right Action Toolbar */}
          <div className="flex items-center space-x-2">
            
            {/* Database & Users Inspector Button */}
            <button
              onClick={onOpenDbModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25 hover:bg-sky-500/20 hover:text-white transition-colors"
              title="Inspect Registered Users and Raised Grievances in Database"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Database & Users</span>
              <span className="sm:hidden">DB</span>
            </button>

            {/* Assessment Rubric Guide Button */}
            <button
              onClick={onOpenVivaModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 hover:text-white transition-colors"
              title="View Viva / Rubric Evaluation Guide"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Assessment Guide</span>
              <span className="bg-purple-500/30 text-purple-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
                8/8
              </span>
            </button>

            {/* Google Sheets Trigger */}
            <button
              onClick={onOpenSheetsDrawer}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#161D2B] text-slate-200 border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#1C2436] transition-colors"
              title="Open Google Sheets Live Hub"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheets</span>
            </button>

            {/* Config modal button */}
            <button
              onClick={onOpenConfigModal}
              className="p-1.5 rounded-lg bg-[#161D2B] text-slate-400 hover:text-slate-200 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              title="Database & Webhook Keys"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Report Grievance CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Log Grievance</span>
              <span className="sm:hidden">Log</span>
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-white/[0.08]">
                <div 
                  className="w-7 h-7 rounded-lg bg-slate-800 border border-white/[0.12] flex items-center justify-center text-[11px] font-bold text-sky-300"
                  title={`Logged in as ${user.email}`}
                >
                  {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#161D2B] hover:bg-[#1C2436] text-slate-200 border border-white/[0.08] transition-colors"
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

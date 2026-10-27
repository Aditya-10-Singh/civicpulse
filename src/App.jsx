import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import IssueCard from './components/IssueCard';
import IssueTable from './components/IssueTable';
import SpreadsheetView from './components/SpreadsheetView';
import IssueModal from './components/IssueModal';
import AuthModal from './components/AuthModal';
import AuthScreen from './components/AuthScreen';
import SheetsDrawer from './components/SheetsDrawer';
import ConfigBanner from './components/ConfigBanner';

import { INITIAL_MOCK_ISSUES, CATEGORIES, STATUSES } from './data/mockIssues';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  apiFetchGrievances, 
  apiCreateGrievance, 
  apiUpdateGrievanceStatus, 
  apiUpvoteGrievance, 
  apiDeleteGrievance,
  apiGetSession,
  apiSignOut
} from './lib/supabaseClient';
import { 
  isGoogleSheetsConfigured, 
  syncSingleGrievanceToSheets 
} from './lib/googleSheets';

import { 
  Search, 
  List, 
  FileSpreadsheet,
  CheckCircle2, 
  Plus,
  Building2,
  Columns2,
  Columns3,
  Sparkles,
  ArrowRight,
  Paperclip,
  Check,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState(INITIAL_MOCK_ISSUES);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  // View mode: 'grid-2' (2-column symmetrical), 'grid-3' (3-column), 'table' (data table), 'spreadsheet' (Google Sheets view)
  const [viewMode, setViewMode] = useState('grid-2');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSheetsDrawerOpen, setIsSheetsDrawerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL'); // 'ALL', 'MY_ISSUES', 'CRITICAL', 'PROGRESS', 'RESOLVED'

  // Toast alert
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isSupabaseLive = isSupabaseConfigured();
  const isSheetsLive = isGoogleSheetsConfigured();

  // Load session & live data
  const loadData = async () => {
    if (isSupabaseConfigured()) {
      try {
        setLoading(true);
        const { data, isLive } = await apiFetchGrievances();
        if (isLive && data && data.length > 0) {
          setIssues(data);
        }
      } catch (err) {
        console.warn("Could not load from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    try {
      const session = await apiGetSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD: Create
  const handleCreateGrievance = async (formData) => {
    let newItem = {
      ...formData,
      id: 'g-' + Date.now().toString().slice(-4),
      user_id: currentUser?.id || 'usr-aditya-101',
      reported_by_name: currentUser?.user_metadata?.full_name || formData.reported_by_name || 'Aditya Singh',
      reported_by_email: currentUser?.email || formData.reported_by_email || 'adityasinghfeb102005@gmail.com',
      created_at: new Date().toISOString(),
      synced_to_sheets: false
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, isLive } = await apiCreateGrievance({
          title: newItem.title,
          category: newItem.category,
          priority: newItem.priority,
          status: 'Pending Review',
          location: newItem.location,
          description: newItem.description,
          reported_by_name: newItem.reported_by_name,
          reported_by_email: newItem.reported_by_email,
          user_id: currentUser?.id || null,
          image_url: newItem.image_url || null,
          upvotes: 1
        });
        if (isLive && data) {
          newItem = data;
        }
      } catch (err) {
        console.warn("Supabase insert error, saving locally:", err);
      }
    }

    setIssues(prev => [newItem, ...prev]);
    showToast("Civic grievance dispatched successfully!");

    // Background sync to Google Sheets
    try {
      await syncSingleGrievanceToSheets(newItem);
      setIssues(prev => prev.map(i => i.id === newItem.id ? { ...i, synced_to_sheets: true } : i));
    } catch (sheetErr) {
      console.warn("Google Sheets auto-sync notification:", sheetErr);
    }
  };

  // CRUD: Update status
  const handleStatusChange = async (id, newStatus) => {
    if (isSupabaseConfigured()) {
      try {
        await apiUpdateGrievanceStatus(id, newStatus);
      } catch (err) {
        console.warn("Supabase status update error:", err);
      }
    }

    setIssues(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));

    showToast(`Status updated to "${newStatus}"`);
  };

  // CRUD: Upvote
  const handleUpvote = async (id, newCount) => {
    if (isSupabaseConfigured()) {
      try {
        await apiUpvoteGrievance(id, newCount);
      } catch (err) {
        console.warn("Supabase upvote error:", err);
      }
    }

    setIssues(prev => prev.map(item => 
      item.id === id ? { ...item, upvotes: newCount } : item
    ));

    showToast("Upvote recorded!");
  };

  // CRUD: Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw this grievance ticket?")) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        await apiDeleteGrievance(id);
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    setIssues(prev => prev.filter(item => item.id !== id));
    showToast("Grievance ticket deleted.");
  };

  // Logout handler
  const handleLogout = async () => {
    await apiSignOut();
    setCurrentUser(null);
    setIsGuestMode(false);
    showToast("Signed out successfully.");
  };

  // Filtered Issues Logic
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        (issue.title && issue.title.toLowerCase().includes(query)) ||
        (issue.location && issue.location.toLowerCase().includes(query)) ||
        (issue.description && issue.description.toLowerCase().includes(query)) ||
        (issue.category && issue.category.toLowerCase().includes(query))
      );

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All Categories' || issue.category === selectedCategory;

      // 3. Status Tabs
      let matchesTab = true;
      if (selectedStatusTab === 'MY_ISSUES') {
        matchesTab = currentUser && (
          (issue.reported_by_email && issue.reported_by_email.toLowerCase() === currentUser.email?.toLowerCase()) ||
          (issue.user_id && issue.user_id === currentUser.id)
        );
      } else if (selectedStatusTab === 'CRITICAL') {
        matchesTab = issue.priority === 'Critical';
      } else if (selectedStatusTab === 'PROGRESS') {
        matchesTab = issue.status === 'In Progress';
      } else if (selectedStatusTab === 'RESOLVED') {
        matchesTab = issue.status === 'Resolved';
      }

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [issues, searchQuery, selectedCategory, selectedStatusTab, currentUser]);

  // Tab Counts
  const countAll = issues.length;
  const countCritical = issues.filter(i => i.priority === 'Critical').length;
  const countProgress = issues.filter(i => i.status === 'In Progress').length;
  const countResolved = issues.filter(i => i.status === 'Resolved').length;
  const countMyIssues = currentUser 
    ? issues.filter(i => 
        (i.reported_by_email && i.reported_by_email.toLowerCase() === currentUser.email?.toLowerCase()) ||
        (i.user_id && i.user_id === currentUser.id)
      ).length 
    : 0;

  // Gatekeeping: Show Make.com AuthScreen if not authenticated and not continuing as guest
  if (!currentUser && !isGuestMode) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.user_metadata?.full_name || user.email}!`);
        }}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          showToast("Viewing platform as guest. Sign in anytime from top bar.", "info");
        }}
      />
    );
  }

  const citizenName = currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Aditya';

  return (
    <div className="min-h-screen bg-[#080A10] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center space-x-2.5 ${
            toast.type === 'info' 
              ? 'bg-[#0E121E] text-purple-300 border-purple-500/30 shadow-purple-500/10' 
              : 'bg-[#0E121E] text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Make.com Style Header */}
      <Navbar
        isSupabaseLive={isSupabaseLive}
        isSheetsLive={isSheetsLive}
        user={currentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSheetsDrawer={() => setIsSheetsDrawerOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* =========================================================================
          HERO PROMPT & QUICK ACTIONS (Matching Make.com Maia in Image 2)
          ========================================================================= */}
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#111526]/40 to-[#080A10] pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Greeting matching Image 2 ("Hi Aditya, what are we automating?") */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-white bg-clip-text text-transparent">
            Hi {citizenName}, what are we resolving today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 max-w-xl mx-auto">
            Describe a road hazard, pipe burst, or civic issue and field inspection squads will be dispatched.
          </p>

          {/* Central Make.com Prompt Box with Glowing Violet Border (Image 2) */}
          <div className="make-prompt-box rounded-2xl p-2 sm:p-3 mt-6 text-left transition-all max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center space-x-2 w-full px-2">
              <Search className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="text"
                placeholder="Search active issues or type a hazard (e.g. pothole on Sector 14)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold hidden sm:inline-block">
                Ctrl+K
              </span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center space-x-1 shadow-md shadow-purple-600/30 cursor-pointer"
                title="Open Grievance Form"
              >
                <span>Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Cards (Make.com "Start from scratch" in Image 2) */}
          <div className="mt-7 text-left max-w-3xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Start from scratch
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Action 1: Create Issue */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-3.5 rounded-2xl bg-[#0E121E] border border-white/[0.08] hover:border-purple-500/40 hover:bg-[#121626] transition-all text-left flex items-start space-x-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Report a Grievance
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    Photo proof & GPS location
                  </p>
                </div>
              </button>

              {/* Action 2: Field Spreadsheet View */}
              <button
                onClick={() => setViewMode('spreadsheet')}
                className="p-3.5 rounded-2xl bg-[#0E121E] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#121626] transition-all text-left flex items-start space-x-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Live Field Spreadsheet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    Google Sheets sync board
                  </p>
                </div>
              </button>

              {/* Action 3: Google Sheets Hub */}
              <button
                onClick={() => setIsSheetsDrawerOpen(true)}
                className="p-3.5 rounded-2xl bg-[#0E121E] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#121626] transition-all text-left flex items-start space-x-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Sync Hub & Export
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    Bulk push & instant CSV
                  </p>
                </div>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          MAIN DASHBOARD (Mirror Style KPI Cards & Multi-View Grid)
          ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-7 w-full">
        
        {/* KPI Stat Cards (Mirror App in Image 3) */}
        <StatCards issues={issues} />

        {/* Toolbar: Status Tabs + Filters + View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-3 border-b border-white/[0.06]">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'ALL', label: 'All Grievances', count: countAll },
              ...(currentUser ? [{ id: 'MY_ISSUES', label: 'My Reported', count: countMyIssues, color: 'text-purple-300 font-bold' }] : []),
              { id: 'CRITICAL', label: 'Critical Emergencies', count: countCritical, color: 'text-rose-400' },
              { id: 'PROGRESS', label: 'In Progress', count: countProgress, color: 'text-cyan-400' },
              { id: 'RESOLVED', label: 'Resolved Archive', count: countResolved, color: 'text-emerald-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  selectedStatusTab === tab.id
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={tab.color || ''}>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.08]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Toolbar: Category Dropdown + View Switchers */}
          <div className="flex items-center space-x-2.5">
            
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0E121E] border border-white/[0.08] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* View Switchers */}
            <div className="flex items-center bg-[#0E121E] p-1 rounded-xl border border-white/[0.08] shrink-0 space-x-1">
              
              {/* 2-Column Balanced Grid */}
              <button
                onClick={() => setViewMode('grid-2')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'grid-2' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="2-Column Balanced Symmetrical Grid"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2-Col</span>
              </button>

              {/* 3-Column Grid */}
              <button
                onClick={() => setViewMode('grid-3')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'grid-3' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="3-Column Grid"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3-Col</span>
              </button>

              {/* Table View */}
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tabular Data View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>

              {/* Live Interactive Spreadsheet */}
              <button
                onClick={() => setViewMode('spreadsheet')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                  viewMode === 'spreadsheet' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
                title="Interactive Google Sheets Dispatch View"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Spreadsheet</span>
              </button>

            </div>

          </div>

        </div>

        {/* Dynamic Display Area */}
        {filteredIssues.length === 0 ? (
          <div className="mirror-card rounded-2xl p-14 text-center my-6">
            <Building2 className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No matching tickets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
            >
              + Report New Grievance
            </button>
          </div>
        ) : viewMode === 'grid-2' ? (
          /* Perfectly Symmetrical 2-Column Balanced Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={handleUpvote}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : viewMode === 'grid-3' ? (
          /* 3-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={handleUpvote}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : viewMode === 'table' ? (
          /* Data Table */
          <IssueTable
            issues={filteredIssues}
            onUpvote={handleUpvote}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ) : (
          /* Interactive Google Spreadsheet View */
          <SpreadsheetView
            issues={filteredIssues}
            onSyncSuccess={() => showToast("Google Sheets bulk synchronized successfully!")}
          />
        )}

      </main>

      {/* =========================================================================
          PRODUCTION MINIMAL FOOTER (No Rubric, No DB Inspector)
          ========================================================================= */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#07090F] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">CivicPulse</span>
            <span>•</span>
            <span>Municipal Infrastructure & Redressal Platform</span>
            <span>•</span>
            <span className="text-slate-500">Ward 14</span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <button 
              onClick={() => setViewMode('spreadsheet')} 
              className="text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Live Spreadsheet
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsSheetsDrawerOpen(true)} 
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Google Sheets Sync
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsConfigModalOpen(true)} 
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Database Settings
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS & DRAWERS
          ========================================================================= */}
      <IssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateGrievance}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Logged in as ${user.user_metadata?.full_name || user.email}`);
        }}
      />

      <SheetsDrawer
        isOpen={isSheetsDrawerOpen}
        onClose={() => setIsSheetsDrawerOpen(false)}
        issues={issues}
        onSyncSuccess={() => showToast("Google Sheets bulk synchronization successful!")}
      />

      <ConfigBanner
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigUpdated={() => {
          loadData();
          showToast("Configuration reloaded!");
        }}
      />

    </div>
  );
}

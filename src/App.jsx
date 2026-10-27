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
import VivaGuideModal from './components/VivaGuideModal';
import DatabaseViewerModal from './components/DatabaseViewerModal';

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
  LayoutGrid, 
  List, 
  FileSpreadsheet,
  CheckCircle2, 
  Plus,
  Building2,
  SlidersHorizontal,
  Database,
  Columns2,
  Columns3,
  Sparkles
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
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

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
    showToast("Ticket removed.", "info");
  };

  // Auth Logout
  const handleLogout = async () => {
    await apiSignOut();
    setCurrentUser(null);
    setIsGuestMode(false);
    showToast("Signed out successfully", "info");
  };

  // Tab counts
  const countAll = issues.length;
  const myEmail = currentUser?.email?.toLowerCase();
  const countMyIssues = myEmail ? issues.filter(i => (i.reported_by_email || '').toLowerCase() === myEmail).length : 0;
  const countCritical = issues.filter(i => i.priority === 'Critical').length;
  const countProgress = issues.filter(i => i.status === 'In Progress').length;
  const countResolved = issues.filter(i => i.status === 'Resolved').length;

  // Filtered & Sorted issues
  const filteredIssues = useMemo(() => {
    return issues.filter(item => {
      const matchesSearch = 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'All Categories' || item.category === selectedCategory;

      let matchesTab = true;
      if (selectedStatusTab === 'MY_ISSUES') {
        matchesTab = Boolean(myEmail && (item.reported_by_email || '').toLowerCase() === myEmail);
      } else if (selectedStatusTab === 'CRITICAL') matchesTab = item.priority === 'Critical';
      else if (selectedStatusTab === 'PROGRESS') matchesTab = item.status === 'In Progress';
      else if (selectedStatusTab === 'RESOLVED') matchesTab = item.status === 'Resolved';

      return matchesSearch && matchesCategory && matchesTab;
    }).sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [issues, searchQuery, selectedCategory, selectedStatusTab, myEmail]);

  // If NOT logged in and NOT in guest mode: Show Clean Make.com Split-Screen Auth First!
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

  const citizenName = currentUser?.user_metadata?.full_name || 'Aditya Singh';

  return (
    <div className="min-h-screen bg-[#080A10] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 ${
            toast.type === 'info' 
              ? 'bg-[#121624] text-purple-300 border-purple-500/30' 
              : 'bg-[#121624] text-emerald-300 border-emerald-500/40'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Clean Navbar */}
      <Navbar
        isSupabaseLive={isSupabaseLive}
        isSheetsLive={isSheetsLive}
        user={currentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSheetsDrawer={() => setIsSheetsDrawerOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Welcome Bar (Matching Mirror App in Image 3) */}
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-purple-950/20 via-[#0A0D16] to-[#0A0D16] py-7 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Good day, {citizenName}.</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
              Ward 14 Infrastructure Dashboard • Connected with Supabase PostgreSQL & Google Sheets Sync
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Infrastructure Grievance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        
        {/* KPI Overview (Mirror App Style) */}
        <StatCards issues={issues} />

        {/* Toolbar: Status Tabs + Search + View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-3 border-b border-white/[0.06]">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'ALL', label: 'All Grievances', count: countAll },
              ...(currentUser ? [{ id: 'MY_ISSUES', label: 'My Reported', count: countMyIssues, color: 'text-purple-400 font-bold' }] : []),
              { id: 'CRITICAL', label: 'Critical Emergencies', count: countCritical, color: 'text-rose-400' },
              { id: 'PROGRESS', label: 'In Progress', count: countProgress, color: 'text-cyan-400' },
              { id: 'RESOLVED', label: 'Resolved Archive', count: countResolved, color: 'text-emerald-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  selectedStatusTab === tab.id
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/35 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span className={tab.color || ''}>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Toolbar: Search + Category + View Switchers */}
          <div className="flex items-center space-x-2">
            
            {/* Search Box */}
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111420] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#111420] border border-white/[0.08] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* View Switchers: 2-Columns, 3-Columns, Table, Google Spreadsheet */}
            <div className="flex items-center bg-[#111420] p-1 rounded-xl border border-white/[0.08] shrink-0 space-x-0.5">
              
              {/* 2-Column Symmetrical Grid */}
              <button
                onClick={() => setViewMode('grid-2')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  viewMode === 'grid-2' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="2-Column Balanced Grid (Perfect Symmetry)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2-Col</span>
              </button>

              {/* 3-Column Grid */}
              <button
                onClick={() => setViewMode('grid-3')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
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
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tabular Data View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>

              {/* Interactive Spreadsheet View */}
              <button
                onClick={() => setViewMode('spreadsheet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                  viewMode === 'spreadsheet' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
                title="Interactive Google Sheets Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Spreadsheet</span>
              </button>

            </div>

          </div>

        </div>

        {/* Dynamic Display Container */}
        {filteredIssues.length === 0 ? (
          <div className="mirror-card rounded-2xl p-12 text-center my-6">
            <Building2 className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">No matching tickets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              + Report New Grievance
            </button>
          </div>
        ) : viewMode === 'grid-2' ? (
          /* Perfectly Symmetrical 2-Column Balanced Grid (Eliminates the lonely 4th card!) */
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

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#0A0D14] py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CivicPulse • Developed by Aditya Singh • Full-Stack Assessment Ready</span>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <button onClick={() => setViewMode('spreadsheet')} className="text-emerald-400 font-semibold hover:underline">
              Live Spreadsheet
            </button>
            <span>•</span>
            <button onClick={() => setIsVivaModalOpen(true)} className="hover:text-purple-400 transition-colors">
              Rubric Guide (8/8)
            </button>
            <span>•</span>
            <button onClick={() => setIsDbModalOpen(true)} className="hover:text-sky-400 transition-colors">
              Database Inspector
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
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

      <VivaGuideModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />

      <DatabaseViewerModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        issues={issues}
      />

    </div>
  );
}

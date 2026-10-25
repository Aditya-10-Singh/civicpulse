import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import IssueCard from './components/IssueCard';
import IssueTable from './components/IssueTable';
import IssueModal from './components/IssueModal';
import AuthModal from './components/AuthModal';
import SheetsDrawer from './components/SheetsDrawer';
import ConfigBanner from './components/ConfigBanner';
import VivaGuideModal from './components/VivaGuideModal';

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
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Filter,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState(INITIAL_MOCK_ISSUES);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSheetsDrawerOpen, setIsSheetsDrawerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL'); // 'ALL', 'PENDING', 'PROGRESS', 'RESOLVED', 'CRITICAL'
  const [sortBy, setSortBy] = useState('Newest');

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
      created_at: new Date().toISOString(),
      synced_to_sheets: false
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, isLive } = await apiCreateGrievance({
          title: formData.title,
          category: formData.category,
          priority: formData.priority,
          status: 'Pending Review',
          location: formData.location,
          description: formData.description,
          reported_by_name: formData.reported_by_name,
          reported_by_email: formData.reported_by_email,
          image_url: formData.image_url || null,
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
    showToast("Civic grievance ticket registered successfully!");

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
    if (!window.confirm("Are you sure you want to withdraw/delete this grievance ticket?")) {
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
    showToast("Ticket withdrawn and archived.", "info");
  };

  // Auth Logout
  const handleLogout = async () => {
    await apiSignOut();
    setCurrentUser(null);
    showToast("Signed out successfully", "info");
  };

  // Tab counts
  const countAll = issues.length;
  const countPending = issues.filter(i => i.status === 'Pending Review').length;
  const countProgress = issues.filter(i => i.status === 'In Progress').length;
  const countResolved = issues.filter(i => i.status === 'Resolved').length;
  const countCritical = issues.filter(i => i.priority === 'Critical').length;

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
      if (selectedStatusTab === 'PENDING') matchesTab = item.status === 'Pending Review';
      else if (selectedStatusTab === 'PROGRESS') matchesTab = item.status === 'In Progress';
      else if (selectedStatusTab === 'RESOLVED') matchesTab = item.status === 'Resolved';
      else if (selectedStatusTab === 'CRITICAL') matchesTab = item.priority === 'Critical';

      return matchesSearch && matchesCategory && matchesTab;
    }).sort((a, b) => {
      if (sortBy === 'Upvoted') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === 'Critical') {
        const priorityScore = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [issues, searchQuery, selectedCategory, selectedStatusTab, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center space-x-2 ${
            toast.type === 'info' 
              ? 'bg-[#111724] text-sky-300 border-sky-500/30' 
              : 'bg-[#111724] text-emerald-300 border-emerald-500/40'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        isSupabaseLive={isSupabaseLive}
        isSheetsLive={isSheetsLive}
        user={currentUser}
        issuesCount={issues.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSheetsDrawer={() => setIsSheetsDrawerOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Dashboard Sub-Header / Control Strip */}
      <div className="border-b border-white/[0.06] bg-[#0E131F]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Metadata Badges */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Civic Infrastructure & Redressal Desk
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIVE PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-3">
                <span>Relational PostgreSQL + Real-Time Google Sheets Webhooks</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-sky-400/90 font-medium">Developed by Aditya Singh</span>
              </p>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Sheets Hub Button */}
              <button
                onClick={() => setIsSheetsDrawerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#161D2B] text-slate-300 border border-white/[0.08] hover:border-white/[0.16] hover:text-white transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sheets Sync Hub</span>
              </button>

              {/* Log Ticket Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Grievance Ticket</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* KPI Statistics Box */}
        <StatCards issues={issues} />

        {/* Toolbar: Status Tabs + Search + View Mode Switcher */}
        <div className="space-y-3 mb-6">
          
          {/* Top Row: Segmented Status Tabs */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 overflow-x-auto">
            <div className="flex items-center space-x-1">
              {[
                { id: 'ALL', label: 'All Tickets', count: countAll },
                { id: 'CRITICAL', label: 'Critical Hazards', count: countCritical, color: 'text-rose-400' },
                { id: 'PROGRESS', label: 'In Progress', count: countProgress, color: 'text-amber-400' },
                { id: 'RESOLVED', label: 'Resolved Archive', count: countResolved, color: 'text-emerald-400' },
                { id: 'PENDING', label: 'Pending Review', count: countPending }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatusTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    selectedStatusTab === tab.id
                      ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={tab.color || ''}>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    selectedStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher (Grid vs Table) */}
            <div className="flex items-center space-x-1 bg-[#111724] p-1 rounded-lg border border-white/[0.08] shrink-0 ml-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Data Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket title, ward landmark, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111724] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#111724] border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#111724] border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Upvoted">Most Upvoted</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

          </div>

        </div>

        {/* Display Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
          <span>Showing {filteredIssues.length} tickets</span>
          {(searchQuery || selectedCategory !== 'All Categories' || selectedStatusTab !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); setSelectedStatusTab('ALL'); }}
              className="text-sky-400 hover:underline"
            >
              Reset active filters
            </button>
          )}
        </div>

        {/* Content Display: Card Grid or Data Table */}
        {filteredIssues.length === 0 ? (
          <div className="dashboard-card rounded-xl p-12 text-center border border-white/[0.08] my-6">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
            <h3 className="text-base font-bold text-white mb-1">No matching tickets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search query, or select another category or status tab.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors"
            >
              + Log New Grievance
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        ) : (
          <IssueTable
            issues={filteredIssues}
            onUpvote={handleUpvote}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#0E131F] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">CivicPulse</span>
            <span>• Developed by Aditya Singh</span>
            <span>• Assessment Ready</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <button onClick={() => setIsVivaModalOpen(true)} className="hover:text-purple-400 transition-colors">
              Assessment Guide (8/8)
            </button>
            <button onClick={() => setIsSheetsDrawerOpen(true)} className="hover:text-emerald-400 transition-colors">
              Google Sheets Sync
            </button>
            <button onClick={() => setIsConfigModalOpen(true)} className="hover:text-sky-400 transition-colors">
              Supabase Configuration
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

    </div>
  );
}

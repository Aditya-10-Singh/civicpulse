import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import IssueCard from './components/IssueCard';
import IssueTable from './components/IssueTable';
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
  CheckCircle2, 
  Plus,
  Building2,
  SlidersHorizontal,
  Database
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState(INITIAL_MOCK_ISSUES);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

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
      reported_by_email: currentUser?.email || formData.reported_by_email || 'aditya.singh00552@gmail.com',
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
    showToast("Grievance ticket dispatched successfully!");

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

  // If NOT logged in and NOT in guest mode: Show Clean Dedicated Auth Screen First!
  if (!currentUser && !isGuestMode) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.user_metadata?.full_name || user.email}!`);
        }}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          showToast("Viewing as guest. Sign in anytime from the top bar.", "info");
        }}
      />
    );
  }

  // Once Authenticated or Guest: Clean, Focused, Uncluttered Dashboard
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 ${
            toast.type === 'info' 
              ? 'bg-[#111724] text-sky-300 border-sky-500/30' 
              : 'bg-[#111724] text-emerald-300 border-emerald-500/40'
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        
        {/* Clean KPI Overview */}
        <StatCards issues={issues} />

        {/* Clean Filter Toolbar (Linear Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Issues', count: countAll },
              ...(currentUser ? [{ id: 'MY_ISSUES', label: 'My Tickets', count: countMyIssues, color: 'text-sky-400' }] : []),
              { id: 'CRITICAL', label: 'Critical', count: countCritical, color: 'text-rose-400' },
              { id: 'PROGRESS', label: 'In Progress', count: countProgress, color: 'text-amber-400' },
              { id: 'RESOLVED', label: 'Resolved', count: countResolved, color: 'text-emerald-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  selectedStatusTab === tab.id
                    ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span className={tab.color || ''}>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-60">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right: Search, Category Filter, and View Switcher */}
          <div className="flex items-center space-x-2">
            
            {/* Search Box */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111724] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#111724] border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Grid vs Table View Mode */}
            <div className="flex items-center bg-[#111724] p-0.5 rounded-lg border border-white/[0.08] shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Data Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Issues Container: Card Grid or Data Table */}
        {filteredIssues.length === 0 ? (
          <div className="bg-[#111724] rounded-xl p-12 text-center border border-white/[0.08] my-6">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">No matching grievances found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors"
            >
              + Report New Grievance
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

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#0B0F17] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CivicPulse • Developed by Aditya Singh</span>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <button onClick={() => setIsVivaModalOpen(true)} className="hover:text-purple-400 transition-colors">
              Assessment Rubric (8/8)
            </button>
            <span>•</span>
            <button onClick={() => setIsSheetsDrawerOpen(true)} className="hover:text-emerald-400 transition-colors">
              Google Sheets
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

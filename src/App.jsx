import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import IssueCard from './components/IssueCard';
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
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowUpDown,
  Building,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState(INITIAL_MOCK_ISSUES);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSheetsDrawerOpen, setIsSheetsDrawerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Newest'); // 'Newest', 'Upvoted', 'Critical'

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
      id: 'g-' + Date.now(),
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

    // Prepend to list
    setIssues(prev => [newItem, ...prev]);
    showToast("Civic grievance successfully registered!");

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

    showToast("Upvote recorded! Priority increased.");
  };

  // CRUD: Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw/delete this grievance?")) {
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
    showToast("Grievance withdrawn and removed.", "info");
  };

  // Auth Logout
  const handleLogout = async () => {
    await apiSignOut();
    setCurrentUser(null);
    showToast("Signed out successfully", "info");
  };

  // Filtered & Sorted issues
  const filteredIssues = useMemo(() => {
    return issues.filter(item => {
      const matchesSearch = 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'All Categories' || item.category === selectedCategory;

      const matchesStatus = 
        selectedStatus === 'All Statuses' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
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
  }, [issues, searchQuery, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center space-x-2 ${
            toast.type === 'info' 
              ? 'bg-slate-800 text-sky-300 border-sky-500/30' 
              : 'bg-emerald-950 text-emerald-200 border-emerald-500/40 shadow-emerald-500/10'
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
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSheetsDrawer={() => setIsSheetsDrawerOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 text-xs font-semibold border border-sky-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Municipal Redressal & Live Spreadsheets Gateway</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Empowering Citizens.<br />
                <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Automating Municipal Response.
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Report local civic hazards in real-time. Every complaint is securely written to <strong>Supabase PostgreSQL</strong> and synchronized instantaneously to the department's <strong>Google Sheet</strong> for rapid field dispatch.
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 shadow-xl shrink-0 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assessment Controls
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">Ready for Viva</span>
              </div>
              
              <button
                onClick={() => setIsVivaModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Open 8-Point Rubric Guide</span>
              </button>

              <button
                onClick={() => setIsSheetsDrawerOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Demonstrate Google Sheets Sync</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* KPI Stats Overview */}
        <StatCards issues={issues} />

        {/* Filter and Search Bar */}
        <div className="glass-card rounded-2xl p-4 mb-6 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search grievances by title, description, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="Newest">Newest First</option>
              <option value="Upvoted">Most Upvoted</option>
              <option value="Critical">Critical Severity</option>
            </select>

          </div>

        </div>

        {/* Results Counter & Active Filter summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <span>Showing {filteredIssues.length} of {issues.length} community grievances</span>
          {(searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All Statuses') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); setSelectedStatus('All Statuses'); }}
              className="text-sky-400 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Grievance Grid */}
        {filteredIssues.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 my-8">
            <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No grievances found matching criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search query, selecting "All Categories", or report a new issue.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg transition-colors"
            >
              + Report First Issue Here
            </button>
          </div>
        ) : (
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
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">CivicPulse</span>
            <span>• Developed by Aditya Singh</span>
            <span>• Full-Stack Assessment Project</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <button onClick={() => setIsVivaModalOpen(true)} className="hover:text-purple-400 transition-colors">
              Assessment Rubric
            </button>
            <button onClick={() => setIsSheetsDrawerOpen(true)} className="hover:text-emerald-400 transition-colors">
              Google Sheets Sync
            </button>
            <button onClick={() => setIsConfigModalOpen(true)} className="hover:text-sky-400 transition-colors">
              Supabase Config
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

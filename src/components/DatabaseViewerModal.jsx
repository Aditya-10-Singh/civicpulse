import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Users, 
  FileText, 
  Terminal, 
  Copy, 
  Check, 
  User, 
  ShieldCheck, 
  Calendar,
  ExternalLink,
  MapPin,
  Tag
} from 'lucide-react';
import { getRegisteredUsers } from '../lib/supabaseClient';

export default function DatabaseViewerModal({ isOpen, onClose, issues }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'issues', 'sql'
  const [selectedCitizenEmail, setSelectedCitizenEmail] = useState('ALL');
  const [copiedQuery, setCopiedQuery] = useState('');

  if (!isOpen) return null;

  const users = getRegisteredUsers();

  // Helper to count issues per user
  const getUserIssueCount = (userEmail) => {
    return issues.filter(
      i => (i.reported_by_email || '').toLowerCase() === userEmail.toLowerCase()
    ).length;
  };

  // Filter issues by selected citizen
  const filteredIssues = selectedCitizenEmail === 'ALL'
    ? issues
    : issues.filter(i => (i.reported_by_email || '').toLowerCase() === selectedCitizenEmail.toLowerCase());

  const handleCopy = (sqlText, label) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedQuery(label);
    setTimeout(() => setCopiedQuery(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#111724] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Database & User Registry Inspector</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIVE DB SCHEMA
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Inspect registered users (<code className="text-sky-300 font-mono">auth.users</code>) and raised grievances (<code className="text-sky-300 font-mono">public.grievances</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 border-b border-white/[0.08] pt-3 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registered Users (auth.users)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/20">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'issues'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Grievances by Citizen (public.grievances)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/20">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'sql'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Console & SQL Guide</span>
          </button>
        </div>

        {/* Tab 1: Registered Citizens (auth.users) */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto pt-3">
            <div className="p-3 rounded-lg bg-[#0D121D] border border-white/[0.06] mb-3 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Citizen Accounts Registry:</span>
                <span className="text-slate-400 ml-1">
                  Users registered through the Sign Up form or pre-seeded demo accounts.
                </span>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">
                Table: auth.users
              </span>
            </div>

            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E131F] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.06] text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5">User Details</th>
                    <th className="py-2.5 px-3.5">User ID (UID)</th>
                    <th className="py-2.5 px-3.5">Role</th>
                    <th className="py-2.5 px-3.5 text-center">Issues Raised</th>
                    <th className="py-2.5 px-3.5">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map((u) => {
                    const issueCount = getUserIssueCount(u.email);
                    return (
                      <tr key={u.id} className="table-row-hover transition-colors">
                        
                        {/* User Details */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
                              {u.fullName.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{u.fullName}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* User UID */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {u.id}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {u.role || 'Citizen'}
                          </span>
                        </td>

                        {/* Issues Raised Count */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            issueCount > 0 
                              ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {issueCount} {issueCount === 1 ? 'ticket' : 'tickets'}
                          </span>
                        </td>

                        {/* Registered Date */}
                        <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Grievances by Citizen (public.grievances) */}
        {activeTab === 'issues' && (
          <div className="flex-1 overflow-y-auto pt-3">
            
            {/* Filter toolbar */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-medium">Filter by Citizen:</span>
                <select
                  value={selectedCitizenEmail}
                  onChange={(e) => setSelectedCitizenEmail(e.target.value)}
                  className="bg-[#0D121D] border border-white/[0.08] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Registered Citizens ({issues.length} tickets)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.email}>
                      {u.fullName} ({getUserIssueCount(u.email)} tickets)
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-500 text-[11px] font-mono">
                Showing {filteredIssues.length} tickets
              </span>
            </div>

            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E131F] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.06] text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Ticket ID</th>
                    <th className="py-2.5 px-3.5">Headline & Landmark</th>
                    <th className="py-2.5 px-3.5">Raised By (Citizen)</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Priority</th>
                    <th className="py-2.5 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="table-row-hover transition-colors">
                      
                      {/* Ticket Code */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-sky-400">
                        #{issue.id.startsWith('g-') ? `CP-${issue.id.replace('g-', '')}` : `CP-${issue.id.slice(0, 5).toUpperCase()}`}
                      </td>

                      {/* Headline */}
                      <td className="py-2.5 px-3.5 min-w-[200px]">
                        <p className="font-semibold text-white line-clamp-1">{issue.title}</p>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="truncate">{issue.location}</span>
                        </p>
                      </td>

                      {/* Raised By */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-200">{issue.reported_by_name || 'Citizen'}</p>
                            <p className="text-[10px] text-slate-400">{issue.reported_by_email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] text-[10px]">
                          {issue.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-slate-300">
                          {issue.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {issue.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 3: Official Supabase Console Guide (Judge Instructions) */}
        {activeTab === 'sql' && (
          <div className="flex-1 overflow-y-auto pt-3 space-y-4 text-xs">
            
            {/* Guide Card 1 */}
            <div className="p-4 rounded-xl bg-[#0D121D] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[11px] font-mono">1</span>
                  <span>How to View Registered Users in Supabase Dashboard</span>
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Log into your Supabase Dashboard (<span className="text-sky-300 font-mono">supabase.com/dashboard</span>) and navigate to:
              </p>
              <div className="p-2.5 rounded-lg bg-[#080B11] border border-white/[0.06] font-mono text-emerald-400 text-[11px]">
                Project Dashboard &rarr; Authentication (in left sidebar) &rarr; Users Table
              </div>
              <p className="text-slate-400 text-[11px]">
                This displays all registered user accounts with their UUID, email address, providers, and last sign-in timestamp.
              </p>
            </div>

            {/* Guide Card 2 */}
            <div className="p-4 rounded-xl bg-[#0D121D] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[11px] font-mono">2</span>
                  <span>How to View Raised Grievances in Supabase Table Editor</span>
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed">
                In your Supabase project dashboard:
              </p>
              <div className="p-2.5 rounded-lg bg-[#080B11] border border-white/[0.06] font-mono text-emerald-400 text-[11px]">
                Project Dashboard &rarr; Table Editor &rarr; "grievances" table
              </div>
              <p className="text-slate-400 text-[11px]">
                Here you can view all reported rows, filter by <span className="font-mono text-slate-300">reported_by_email</span>, edit records directly, or delete rows.
              </p>
            </div>

            {/* Guide Card 3: Ready-to-copy SQL queries */}
            <div className="p-4 rounded-xl bg-[#0D121D] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[11px] font-mono">3</span>
                  <span>Direct SQL Queries for Supabase SQL Editor</span>
                </h4>
                <button
                  onClick={() => handleCopy(`-- 1. Query all registered users\nSELECT id, email, created_at, last_sign_in_at FROM auth.users;\n\n-- 2. Query all raised grievances with reporter details\nSELECT id, title, category, priority, status, reported_by_name, reported_by_email, created_at FROM public.grievances ORDER BY created_at DESC;`, 'all-sql')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                >
                  {copiedQuery === 'all-sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQuery === 'all-sql' ? 'Copied SQL' : 'Copy Queries'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-[#080B11] border border-white/[0.06] font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`-- Query all registered users
SELECT id, email, created_at FROM auth.users;

-- Query grievances and group by reporting citizen
SELECT 
  reported_by_name, 
  reported_by_email, 
  COUNT(*) AS total_tickets_raised
FROM public.grievances
GROUP BY reported_by_name, reported_by_email;`}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

const PRIORITY_BADGES = {
  'Critical': 'text-rose-300 bg-rose-500/10 border-rose-500/30',
  'High': 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  'Medium': 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-slate-300 bg-slate-500/10 border-slate-500/30'
};

const STATUS_BADGES = {
  'Pending Review': 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  'In Progress': 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  'Resolved': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
};

export default function IssueTable({ issues, onUpvote, onStatusChange, onDelete }) {
  if (issues.length === 0) return null;

  return (
    <div className="dashboard-card rounded-xl border border-white/[0.08] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-[#0E131F] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.06] text-[11px]">
            <tr>
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Grievance & Location</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reporter</th>
              <th className="py-3 px-4 text-center">Votes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.04]">
            {issues.map((issue) => {
              const ticketCode = issue.id.startsWith('g-') 
                ? `CP-${issue.id.replace('g-', '')}` 
                : `CP-${issue.id.slice(0, 5).toUpperCase()}`;

              const priorityClass = PRIORITY_BADGES[issue.priority] || PRIORITY_BADGES['Medium'];
              const statusClass = STATUS_BADGES[issue.status] || STATUS_BADGES['Pending Review'];

              return (
                <tr key={issue.id} className="table-row-hover transition-colors">
                  
                  {/* Ticket ID */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-[11px]">
                      #{ticketCode}
                    </span>
                  </td>

                  {/* Title & Location */}
                  <td className="py-3 px-4 min-w-[240px]">
                    <p className="font-semibold text-slate-100 hover:text-sky-300 transition-colors line-clamp-1">
                      {issue.title}
                    </p>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{issue.location}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] text-[11px]">
                      {issue.category}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityClass}`}>
                      {issue.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={issue.status}
                      onChange={(e) => onStatusChange(issue.id, e.target.value)}
                      className={`text-[11px] font-semibold rounded px-2 py-0.5 border cursor-pointer bg-[#111724] focus:outline-none ${statusClass}`}
                    >
                      <option value="Pending Review">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Reporter */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded bg-slate-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {(issue.reported_by_name || 'C').slice(0, 1).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[100px]">{issue.reported_by_name || 'Citizen'}</span>
                    </div>
                  </td>

                  {/* Upvotes */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onUpvote(issue.id, (issue.upvotes || 0) + 1)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/[0.04] hover:bg-sky-500/10 text-slate-300 hover:text-sky-300 border border-white/[0.06] transition-colors"
                      title="Upvote ticket"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="font-mono font-bold">{issue.upvotes || 0}</span>
                    </button>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onDelete(issue.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

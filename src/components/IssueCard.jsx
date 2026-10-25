import React, { useState } from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Trash2, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Check, 
  Clock,
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORY_COLORS = {
  'Roads & Transport': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Sanitation & Waste': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Water Supply & Drainage': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Electrical & Streetlights': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Parks & Public Spaces': 'text-teal-400 bg-teal-500/10 border-teal-500/20'
};

const PRIORITY_COLORS = {
  'Critical': { badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
  'High': { badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
  'Medium': { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'Low': { badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30', dot: 'bg-slate-400' }
};

const STATUS_CONFIGS = {
  'Pending Review': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'In Progress': 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  'Resolved': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
};

export default function IssueCard({ 
  issue, 
  onUpvote, 
  onStatusChange, 
  onDelete, 
  currentUser 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvoteClick = () => {
    if (hasUpvoted) return;
    setHasUpvoted(true);
    onUpvote(issue.id, (issue.upvotes || 0) + 1);
  };

  const handleStatusSelect = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    if (newStatus === 'Resolved') {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    await onStatusChange(issue.id, newStatus);
    setIsUpdating(false);
  };

  const formattedDate = issue.created_at 
    ? new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recent';

  const categoryStyle = CATEGORY_COLORS[issue.category] || 'text-slate-300 bg-slate-800 border-slate-700';
  const priorityStyle = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS['Medium'];
  const statusBadge = STATUS_CONFIGS[issue.status] || 'bg-slate-800 text-slate-300 border-slate-700';

  const ticketCode = issue.id.startsWith('g-') 
    ? `CP-${issue.id.replace('g-', '')}` 
    : `CP-${issue.id.slice(0, 5).toUpperCase()}`;

  return (
    <div className="dashboard-card dashboard-card-hover rounded-xl p-4 border border-white/[0.08] flex flex-col justify-between group">
      
      <div>
        {/* Top Header: Ticket ID + Priority + Status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              #{ticketCode}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center space-x-1 ${priorityStyle.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              <span>{issue.priority}</span>
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadge}`}>
            {issue.status}
          </span>
        </div>

        {/* Category Pill */}
        <div className="mb-2">
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border ${categoryStyle}`}>
            <Tag className="w-3 h-3" />
            <span>{issue.category}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-sky-300 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-xs sm:text-sm mb-3.5 line-clamp-3 leading-relaxed">
          {issue.description}
        </p>

        {/* Attached Photo */}
        {issue.image_url && (
          <div className="mb-3.5 rounded-lg overflow-hidden border border-white/[0.08] relative bg-slate-950 aspect-video">
            <img 
              src={issue.image_url} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Metadata Details Box */}
        <div className="bg-[#0D121D] p-2.5 rounded-lg border border-white/[0.06] space-y-1.5 mb-3.5 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[130px]">{issue.reported_by_name || 'Citizen'}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Resolution Notes */}
        {issue.resolution_notes && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
            <span className="font-semibold text-emerald-300 block mb-0.5">Dispatched Action:</span>
            {issue.resolution_notes}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* Upvote Pill */}
        <button
          onClick={handleUpvoteClick}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
            hasUpvoted 
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
              : 'bg-[#161D2B] text-slate-300 border-white/[0.08] hover:border-white/[0.16] hover:text-white'
          }`}
          title="Upvote grievance"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-sky-400 fill-sky-400' : 'text-slate-400'}`} />
          <span className="font-mono">{issue.upvotes || 0}</span>
        </button>

        {/* Staff Status Dropdown & Delete */}
        <div className="flex items-center space-x-1.5">
          <select
            value={issue.status}
            onChange={handleStatusSelect}
            disabled={isUpdating}
            className="bg-[#161D2B] text-slate-200 text-xs rounded-md px-2 py-1 border border-white/[0.08] focus:outline-none focus:border-sky-500 cursor-pointer"
            title="Change status"
          >
            <option value="Pending Review">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            onClick={() => onDelete(issue.id)}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Withdraw ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

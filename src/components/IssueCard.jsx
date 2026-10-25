import React, { useState } from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Trash2, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Check, 
  ShieldAlert, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORY_STYLES = {
  'Roads & Transport': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Sanitation & Waste': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Water Supply & Drainage': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Electrical & Streetlights': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Parks & Public Spaces': 'bg-teal-500/10 text-teal-400 border-teal-500/20'
};

const PRIORITY_BADGES = {
  'Critical': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'High': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'Low': 'bg-slate-500/10 text-slate-400 border-slate-500/30'
};

const STATUS_BADGES = {
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    await onStatusChange(issue.id, newStatus);
    setIsUpdating(false);
  };

  const formattedDate = issue.created_at 
    ? new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const categoryStyle = CATEGORY_STYLES[issue.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const priorityStyle = PRIORITY_BADGES[issue.priority] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const statusStyle = STATUS_BADGES[issue.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group">
      
      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryStyle}`}>
              {issue.category}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityStyle}`}>
              {issue.priority} Priority
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle}`}>
              {issue.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition-colors leading-snug">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {issue.description}
        </p>

        {/* Attached Photo preview if present */}
        {issue.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden max-h-48 border border-slate-700/50 relative bg-slate-950">
            <img 
              src={issue.image_url} 
              alt={issue.title}
              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Location & Metadata */}
        <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
            <div className="flex items-center space-x-1.5">
              <User className="w-3 h-3 text-slate-400" />
              <span>{issue.reported_by_name || 'Anonymous Citizen'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Resolution Notes if Resolved */}
        {issue.resolution_notes && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200">
            <span className="font-semibold block mb-0.5 text-emerald-300">Municipal Action:</span>
            {issue.resolution_notes}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Upvote Button */}
        <button
          onClick={handleUpvoteClick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            hasUpvoted 
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm' 
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
          title="Upvote this grievance to increase priority"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-sky-400 fill-sky-400' : ''}`} />
          <span>{issue.upvotes || 0}</span>
          <span className="hidden sm:inline">Upvotes</span>
        </button>

        {/* Status Dropdown (Admin / Staff Workflow) */}
        <div className="flex items-center space-x-1.5">
          <select
            value={issue.status}
            onChange={handleStatusSelect}
            disabled={isUpdating}
            className="bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            title="Update grievance status (Staff action)"
          >
            <option value="Pending Review">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Delete Action */}
          <button
            onClick={() => onDelete(issue.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete / Withdraw grievance"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

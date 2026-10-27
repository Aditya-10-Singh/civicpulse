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

// Intelligent resolver that guarantees the user's authentic photos are always used
export function resolveIssueImage(issue) {
  if (!issue) return null;
  const url = issue.image_url;

  // If already one of our local authentic images, use directly
  if (url && url.startsWith('/issues/')) return url;

  const title = (issue.title || '').toLowerCase();
  const cat = (issue.category || '').toLowerCase();

  if (title.includes('pothole') || title.includes('asphalt') || cat.includes('road')) {
    return '/issues/pothole-road.png';
  }
  if (title.includes('drain') || title.includes('garbage') || title.includes('waste') || title.includes('subway') || cat.includes('sanitation')) {
    return '/issues/drain-clog.png';
  }
  if (title.includes('water') || title.includes('pipe') || title.includes('flood') || title.includes('cave') || cat.includes('water')) {
    return '/issues/pipeline-cavein.png';
  }
  if (title.includes('electric') || title.includes('transformer') || title.includes('light') || title.includes('lamp') || cat.includes('electrical')) {
    return '/issues/electric-fire.png';
  }

  return url || '/issues/pothole-road.png';
}

const CATEGORY_COLORS = {
  'Roads & Transport': 'text-purple-300 bg-purple-500/10 border-purple-500/25',
  'Sanitation & Waste': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  'Water Supply & Drainage': 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
  'Electrical & Streetlights': 'text-amber-300 bg-amber-500/10 border-amber-500/25',
  'Parks & Public Spaces': 'text-teal-300 bg-teal-500/10 border-teal-500/25'
};

const PRIORITY_COLORS = {
  'Critical': { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
  'High': { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
  'Medium': { badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  'Low': { badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', dot: 'bg-slate-400' }
};

const STATUS_CONFIGS = {
  'Pending Review': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'In Progress': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Resolved': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
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

  const displayImage = resolveIssueImage(issue);

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
    ? new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recent';

  const categoryStyle = CATEGORY_COLORS[issue.category] || 'text-slate-300 bg-slate-800 border-slate-700';
  const priorityStyle = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS['Medium'];
  const statusBadge = STATUS_CONFIGS[issue.status] || 'bg-slate-800 text-slate-300 border-slate-700';

  const ticketCode = issue.id.startsWith('g-') 
    ? `CP-${issue.id.replace('g-', '')}` 
    : `CP-${issue.id.slice(0, 5).toUpperCase()}`;

  return (
    <div className="mirror-card mirror-card-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between group">
      
      <div>
        {/* Top Header: Ticket ID + Priority + Status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/25">
              #{ticketCode}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center space-x-1 ${priorityStyle.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              <span>{issue.priority}</span>
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusBadge}`}>
            {issue.status}
          </span>
        </div>

        {/* Category Pill */}
        <div className="mb-2">
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryStyle}`}>
            <Tag className="w-3 h-3" />
            <span>{issue.category}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-purple-300 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-xs sm:text-sm mb-3.5 line-clamp-3 leading-relaxed">
          {issue.description}
        </p>

        {/* Attached Photo (Fixed height & perfect framing) */}
        {displayImage && (
          <div className="mb-3.5 rounded-xl overflow-hidden border border-white/[0.08] relative bg-[#07090F] aspect-video">
            <img 
              src={displayImage} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Metadata Details Box */}
        <div className="bg-[#090B12] p-3 rounded-xl border border-white/[0.06] space-y-1.5 mb-3.5 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{issue.reported_by_name || 'Citizen'}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Resolution Notes */}
        {issue.resolution_notes && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
            <span className="font-semibold text-emerald-300 block mb-0.5">Municipal Action:</span>
            {issue.resolution_notes}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* Upvote Pill */}
        <button
          onClick={handleUpvoteClick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            hasUpvoted 
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
              : 'bg-[#141824] text-slate-300 border-white/[0.08] hover:border-purple-500/30 hover:text-white'
          }`}
          title="Upvote grievance"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-purple-400 fill-purple-400' : 'text-slate-400'}`} />
          <span className="font-mono">{issue.upvotes || 0}</span>
          <span className="hidden sm:inline">Votes</span>
        </button>

        {/* Staff Status Dropdown & Delete */}
        <div className="flex items-center space-x-2">
          <select
            value={issue.status}
            onChange={handleStatusSelect}
            disabled={isUpdating}
            className="bg-[#141824] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-white/[0.08] focus:outline-none focus:border-purple-500 cursor-pointer"
            title="Change status"
          >
            <option value="Pending Review">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            onClick={() => onDelete(issue.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Withdraw ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

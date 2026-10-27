import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Inbox, TrendingUp, Sparkles } from 'lucide-react';

export default function StatCards({ issues }) {
  const total = issues.length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const critical = issues.filter(i => i.priority === 'Critical').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      id: "total",
      label: "Total Registered",
      value: total,
      meta: "Across Ward 14 Zones",
      icon: Inbox,
      iconColor: "text-purple-400",
      accent: "border-purple-500/30",
      badge: "Active",
      badgeColor: "bg-purple-500/10 text-purple-300"
    },
    {
      id: "progress",
      label: "Field Inspection Active",
      value: inProgress,
      meta: "Municipal Squads Dispatched",
      icon: Clock,
      iconColor: "text-cyan-400",
      accent: "border-cyan-500/30",
      badge: "In Field",
      badgeColor: "bg-cyan-500/10 text-cyan-300"
    },
    {
      id: "resolved",
      label: "Redressed & Closed",
      value: resolved,
      meta: `${resolutionRate}% overall resolution rate`,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      accent: "border-emerald-500/30",
      badge: `${resolutionRate}% Rate`,
      badgeColor: "bg-emerald-500/10 text-emerald-300"
    },
    {
      id: "critical",
      label: "Critical Emergencies",
      value: critical,
      meta: "Escalated for Priority",
      icon: AlertTriangle,
      iconColor: "text-rose-400",
      accent: "border-rose-500/30",
      badge: "Urgent",
      badgeColor: "bg-rose-500/10 text-rose-300"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div 
            key={s.id}
            className={`mirror-card rounded-2xl p-4 sm:p-5 border ${s.accent} relative overflow-hidden transition-all duration-300 hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {s.value}
              </span>
              <span className="text-xs text-slate-400">
                tickets
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>{s.meta}</span>
              {s.id === 'resolved' && (
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

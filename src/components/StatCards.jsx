import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Inbox, TrendingUp } from 'lucide-react';

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
      meta: "Across 5 Categories",
      icon: Inbox,
      iconColor: "text-slate-300",
      iconBg: "bg-slate-800/80 border-slate-700/60",
      accent: "border-l-sky-500"
    },
    {
      id: "progress",
      label: "Field Inspection Active",
      value: inProgress,
      meta: "Squads dispatched",
      icon: Clock,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      accent: "border-l-amber-500"
    },
    {
      id: "resolved",
      label: "Resolved & Closed",
      value: resolved,
      meta: `${resolutionRate}% completion rate`,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      accent: "border-l-emerald-500"
    },
    {
      id: "critical",
      label: "Critical Hazards",
      value: critical,
      meta: "Escalated for priority",
      icon: AlertTriangle,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      accent: "border-l-rose-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div 
            key={s.id}
            className={`dashboard-card rounded-xl p-4 border border-white/[0.08] border-l-4 ${s.accent} relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${s.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-white font-mono">
                {s.value}
              </span>
              <span className="text-xs text-slate-400">
                tickets
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>{s.meta}</span>
              {s.id === 'resolved' && (
                <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{resolutionRate}%</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

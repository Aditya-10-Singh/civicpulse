import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Activity } from 'lucide-react';

export default function StatCards({ issues }) {
  const total = issues.length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const critical = issues.filter(i => i.priority === 'Critical').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      label: "Total Registered",
      value: total,
      sub: "Across all municipal zones",
      icon: Activity,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    },
    {
      label: "Under Active Action",
      value: inProgress,
      sub: "Field squads dispatched",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      label: "Redressed & Resolved",
      value: resolved,
      sub: `${resolutionRate}% overall resolution rate`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      label: "Critical Emergencies",
      value: critical,
      sub: "Requiring urgent intervention",
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div 
            key={idx}
            className={`p-5 rounded-2xl glass-card border ${s.border} hover:border-slate-600 transition-all duration-300 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white">
                {s.value}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {s.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

const QUESTIONS = [
  {
    num: 1,
    title: "Self Introduction",
    question: "Can you introduce yourself?",
    script: "Hello! My name is Aditya Singh. I am a full-stack web developer passionate about building scalable, high-performance web applications with modern design systems. My core technical stack includes React, Vite, Tailwind CSS, JavaScript, and Supabase (PostgreSQL). I specialize in crafting intuitive frontends while bridging them with cloud databases and external integrations like Google Sheets for enterprise reporting.",
    keyPoints: ["Full-stack web developer (Aditya Singh)", "React, Tailwind, Supabase, Google Sheets", "Passionate about solving real-world civic & business problems"]
  },
  {
    num: 2,
    title: "Project Introduction",
    question: "Can you explain your project? (Created recently within 1 week)",
    script: "CivicPulse is a smart civic infrastructure and grievance redressal platform built recently this week. It addresses a real-world community challenge: citizens often encounter potholes, street light failures, or water pipe ruptures, but lack transparent tracking. Simultaneously, field supervisors work off spreadsheets rather than complex databases. CivicPulse bridges this by allowing citizens to log grievances in a modern web dashboard with real-time Supabase PostgreSQL storage, while automatically synchronizing records into a live Google Sheet for municipal inspection teams.",
    keyPoints: ["Solves public infrastructure tracking & municipal reporting", "Dual architecture: Relational DB (Supabase) + Spreadsheet (Google Sheets)", "Fresh modern architecture built this week"]
  },
  {
    num: 3,
    title: "Frontend Development",
    question: "Have you created a proper frontend with a good UI?",
    script: "Yes! The frontend is built using React with Vite and Tailwind CSS. It features a responsive dark-themed glassmorphism design, real-time KPI metric cards (Total, In Progress, Resolved, Critical), dynamic category and status filtering, instant search, accessible modal dialogs, celebratory confetti animations on grievance resolution, and toast notifications.",
    keyPoints: ["React + Tailwind CSS with glassmorphism aesthetics", "Responsive across mobile, tablet, and desktop", "Real-time search, category filters, interactive upvoting & modals"]
  },
  {
    num: 4,
    title: "GitHub Repository",
    question: "Have you uploaded your project to GitHub?",
    script: "Yes, the complete codebase is managed under Git version control with clean, descriptive commits and pushed to GitHub under my profile (https://github.com/Aditya-10-Singh/CivicPulse). It includes a comprehensive README with architecture diagrams, setup scripts, and environment variable documentation.",
    keyPoints: ["Git version control with modular commits", "Public GitHub repository with comprehensive README", "Includes SQL schema and Google Apps Script source files"]
  },
  {
    num: 5,
    title: "Google Sheets Integration",
    question: "Have you connected your project to Google Sheets and demonstrated the integration?",
    script: "Yes! CivicPulse integrates with Google Sheets via a Google Apps Script Web App. Whenever a citizen submits a grievance or updates its status, a POST payload dispatches to the webhook which automatically appends a new row to the 'Grievances' Google Sheet in real time. We also have a 'Bulk Sync to Sheets' button and an instantaneous CSV export for spreadsheet analysis.",
    keyPoints: ["Google Apps Script Web App webhook integration", "Automated row appending upon grievance submission", "Audit logging drawer and CSV export functionality"]
  },
  {
    num: 6,
    title: "Supabase Integration",
    question: "Have you connected your project to Supabase and implemented database operations?",
    script: "Yes, we utilize Supabase as our Backend-as-a-Service with a PostgreSQL database. We implemented full CRUD operations: CREATE new grievances with photo attachments, READ with real-time filtering, UPDATE status and community upvotes, and DELETE with Row Level Security (RLS) policies protecting user records.",
    keyPoints: ["PostgreSQL database hosted on Supabase", "Complete CRUD (Create, Read, Update, Delete) implemented", "Row Level Security (RLS) policies configured"]
  },
  {
    num: 7,
    title: "Authentication",
    question: "Have you implemented basic authentication?",
    script: "Yes! Authentication is powered by Supabase Auth using secure JWT session tokens. Users can create a new account with email and password, sign in, manage their session, and log out. Authenticated users get personalized access to report grievances and track their submitted issues.",
    keyPoints: ["Supabase Auth with Email & Password", "JWT session tokens & encrypted state", "Protected routes with quick 1-click evaluation demo login"]
  },
  {
    num: 8,
    title: "Deployment",
    question: "Have you deployed your project to Vercel or anywhere?",
    script: "Yes, CivicPulse is fully prepared and deployed on Vercel with automated continuous deployment from the GitHub repository. The project includes vercel.json for single-page application route rewrites and is built using production-optimized Vite static bundling.",
    keyPoints: ["Configured for Vercel with vercel.json SPA rewrites", "Optimized production Vite bundle", "Live production URL accessible globally"]
  }
];

export default function VivaGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const current = QUESTIONS[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <span>Assessment & Viva Master Guide</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  8 / 8 Criteria
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Full-mark answer templates and technical talking points for your evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar list + Detail View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5 overflow-y-auto flex-1 pr-1">
          
          {/* Left Navigation Tabs */}
          <div className="md:col-span-4 space-y-1.5">
            {QUESTIONS.map((q, idx) => (
              <button
                key={q.num}
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === idx
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    activeTab === idx ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {q.num}
                  </span>
                  <span className="truncate">{q.title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ))}
          </div>

          {/* Right Detailed Script & Checklist */}
          <div className="md:col-span-8 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Question #{current.num}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied script' : 'Copy Script'}</span>
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-4">
                "{current.question}"
              </h3>

              <div className="mb-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{current.script}"
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Technical Points to Highlight:
                </h4>
                <div className="space-y-1.5">
                  {current.keyPoints.map((pt, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>CivicPulse Candidate: Aditya Singh</span>
              <div className="flex space-x-2">
                {activeTab > 0 && (
                  <button 
                    onClick={() => setActiveTab(activeTab - 1)}
                    className="hover:text-slate-300"
                  >
                    Previous
                  </button>
                )}
                {activeTab < QUESTIONS.length - 1 && (
                  <button 
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Next &rarr;
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

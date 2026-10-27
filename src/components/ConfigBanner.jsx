import React, { useState } from 'react';
import { X, Database, Key, Check, RotateCcw, Sparkles } from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseConfigured 
} from '../lib/supabaseClient';

export default function ConfigBanner({ isOpen, onClose, onConfigUpdated }) {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onConfigUpdated();
      onClose();
    }, 800);
  };

  const handleReset = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Supabase Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Connect your live PostgreSQL database & authentication service
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

        {/* Informative description */}
        <div className="my-4 p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-sky-300 mb-1">
            💡 Zero-Setup Fallback Enabled:
          </p>
          If you don't have a Supabase project created yet, CivicPulse runs automatically in <strong>Interactive Demo Mode</strong> with realistic civic data, responsive CRUD simulation, and Google Sheets sync!
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Mode</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                <span>{saved ? 'Connected!' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

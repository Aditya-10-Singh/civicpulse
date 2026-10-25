import React, { useState } from 'react';
import { X, Send, MapPin, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

const PRESET_PHOTOS = [
  { label: "Pothole", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" },
  { label: "Garbage", url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80" },
  { label: "Streetlight", url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80" },
  { label: "Water Leak", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80" }
];

export default function IssueModal({ isOpen, onClose, onSubmit, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads & Transport',
    priority: 'Medium',
    location: '',
    description: '',
    image_url: '',
    reported_by_name: currentUser?.user_metadata?.full_name || 'Aditya Singh',
    reported_by_email: currentUser?.email || 'aditya.singh00552@gmail.com'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a brief title describing the civic problem.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the approximate location or street landmark.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for the field inspection team.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        status: 'Pending Review',
        upvotes: 1
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit grievance');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Report a Civic Grievance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Logged to Supabase PostgreSQL & synced with Municipal Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Grievance Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous pothole cluster blocking morning school bus route"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Civic Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Roads & Transport">Roads & Transport</option>
                <option value="Sanitation & Waste">Sanitation & Waste</option>
                <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                <option value="Parks & Public Spaces">Parks & Public Spaces</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority Severity *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Low">Low (General Maintenance)</option>
                <option value="Medium">Medium (Attention Required)</option>
                <option value="High">High (High Public Inconvenience)</option>
                <option value="Critical">Critical (Immediate Hazard)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Exact Landmark / Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Crossway 4 near Sector 18 Community Center"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe what happened, how long the issue has persisted, and any immediate risks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Photo URL & Sample Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Photo URL (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Quick test samples:</span>
            </div>
            
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
              {PRESET_PHOTOS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setFormData({ ...formData, image_url: p.url })}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 whitespace-nowrap transition-colors"
                >
                  + {p.label} Photo
                </button>
              ))}
            </div>

            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reporter Name</label>
              <input
                type="text"
                value={formData.reported_by_name}
                onChange={(e) => setFormData({ ...formData, reported_by_name: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.reported_by_email}
                onChange={(e) => setFormData({ ...formData, reported_by_email: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Grievance...' : 'Submit Grievance'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

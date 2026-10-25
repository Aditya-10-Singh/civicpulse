import React, { useState } from 'react';
import { X, Send, MapPin, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#111724] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Register Civic Grievance Ticket
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatches to Supabase PostgreSQL & syncs with Municipal Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-3.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          {/* Issue Title */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Grievance Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous pothole cluster blocking school bus passage"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Roads & Transport">Roads & Transport</option>
                <option value="Sanitation & Waste">Sanitation & Waste</option>
                <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                <option value="Parks & Public Spaces">Parks & Public Spaces</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
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
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Exact Landmark / Location *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Crossway 4 near Sector 18 Market"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe what occurred, hazards observed, and field team access notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Photo URL & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Photo Attachment (Optional)
              </label>
              <span className="text-[10px] text-slate-400">Quick test sample:</span>
            </div>
            
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
              {PRESET_PHOTOS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setFormData({ ...formData, image_url: p.url })}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#161D2B] hover:bg-[#1E273A] text-sky-400 border border-white/[0.08] whitespace-nowrap transition-colors"
                >
                  + {p.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-400 mb-1">Reporter Name</label>
              <input
                type="text"
                value={formData.reported_by_name}
                onChange={(e) => setFormData({ ...formData, reported_by_name: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-300"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.reported_by_email}
                onChange={(e) => setFormData({ ...formData, reported_by_email: e.target.value })}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-300"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Dispatch Ticket'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

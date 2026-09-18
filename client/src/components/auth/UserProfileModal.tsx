import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import { UserAvatar } from '../common/UserAvatar.js';
import { AlertChip } from '../common/AlertChip.js';
import { Button } from '../common/Button.js';
import {
  X,
  User,
  Briefcase,
  Phone,
  Check,
  RotateCcw,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENT_OPTIONS = [
  'Financial Planning & Analysis (FP&A)',
  'Treasury & Liquidity Management',
  'Corporate Risk & Compliance',
  'Operations & Settlement',
  'Executive Leadership',
  'Audit & Forensic Accounting',
];

const AVATAR_PRESETS = [
  {
    id: 'avatar-teal',
    name: 'Teal Suit Analyst',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Felix&backgroundColor=26a69a',
  },
  {
    id: 'avatar-orange',
    name: 'Orange Curly Executive',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Aneka&backgroundColor=fb8c00',
  },
  {
    id: 'avatar-mustard',
    name: 'Mustard Blazer Lead',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Zoe&backgroundColor=eab308',
  },
  {
    id: 'avatar-green',
    name: 'Green Tie Officer',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Leo&backgroundColor=43a047',
  },
  {
    id: 'avatar-blue',
    name: 'Blue Corporate Director',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Marcus&backgroundColor=1e88e5',
  },
  {
    id: 'avatar-purple',
    name: 'Purple Senior Specialist',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Elena&backgroundColor=8e24aa',
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [department, setDepartment] = useState<string>('Financial Planning & Analysis (FP&A)');
  const [title, setTitle] = useState<string>('Lead Financial Analyst');
  const [phone, setPhone] = useState<string>('+1 (555) 019-2834');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Sync state when user profile loads or changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || 'Financial Planning & Analysis (FP&A)');
      setTitle(user.title || (user.role === 'admin' ? 'Workspace Administrator' : 'Lead Financial Analyst'));
      setPhone(user.phone || '+1 (555) 019-2834');
      setBio(user.bio || 'Managing corporate liquidity oversight, risk mitigation, and executive financial reporting.');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, isOpen]);

  // Keyboard shortcut: Esc to dismiss
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({
      name: name.trim(),
      department,
      title: title.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const handleResetDefaults = () => {
    if (user) {
      setName(user.name);
      setDepartment('Financial Planning & Analysis (FP&A)');
      setTitle(user.role === 'admin' ? 'Workspace Administrator' : 'Lead Financial Analyst');
      setPhone('+1 (555) 019-2834');
      setBio('Managing corporate liquidity oversight, risk mitigation, and executive financial reporting.');
      setAvatarUrl('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateNavy-950/70 backdrop-blur-md animate-fade-in"
    >
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl bg-white border border-slateNavy-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slateNavy-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="user-profile-title" className="text-lg font-bold text-slateNavy-900 font-display">
                  Analyst Profile &amp; Workspace Settings
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>
              </div>
              <p className="text-xs text-slateNavy-500">
                Manage personal profile credentials and workspace role details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slateNavy-400 hover:text-slateNavy-700 hover:bg-slateNavy-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Snapshot Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slateNavy-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <UserAvatar userId={user.id} userProfile={avatarUrl || user.avatarUrl} size="lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slateNavy-900" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-display">{name || user.name}</h4>
                <AlertChip variant={user.role === 'admin' ? 'Admin' : 'Analyst'} size="sm" />
              </div>
              <p className="text-xs text-indigo-200/90 font-medium">{title || 'Financial Analyst'}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">User ID</span>
              <span className="text-xs font-mono font-bold text-indigo-300">USR-{user.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slateNavy-700 mb-2">
              Select Profile Icon
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  avatarUrl === ''
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20'
                    : 'bg-white border-slateNavy-200 text-slateNavy-600 hover:border-slateNavy-300'
                }`}
              >
                Default Initials
              </button>
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.name}
                  onClick={() => setAvatarUrl(preset.url)}
                  className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all shadow-sm ${
                    avatarUrl === preset.url
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-110 shadow-md'
                      : 'border-white hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  {avatarUrl === preset.url && (
                    <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 drop-shadow-md stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slateNavy-700 mb-1">
                Full Legal / Display Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Alexandra Vance"
                  className="w-full px-3 py-2 pl-9 rounded-xl text-xs font-medium bg-slateNavy-50/50 border border-slateNavy-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slateNavy-900"
                />
                <User className="w-4 h-4 text-slateNavy-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slateNavy-700 mb-1">
                Professional Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Lead Financial Analyst"
                  className="w-full px-3 py-2 pl-9 rounded-xl text-xs font-medium bg-slateNavy-50/50 border border-slateNavy-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slateNavy-900"
                />
                <Briefcase className="w-4 h-4 text-slateNavy-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Department & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slateNavy-700 mb-1">
                Department / Business Unit
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slateNavy-50/50 border border-slateNavy-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slateNavy-900"
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slateNavy-700 mb-1">
                Direct Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 pl-9 rounded-xl text-xs font-medium bg-slateNavy-50/50 border border-slateNavy-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slateNavy-900"
                />
                <Phone className="w-4 h-4 text-slateNavy-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bio / Workspace Responsibility */}
          <div>
            <label className="block text-xs font-bold text-slateNavy-700 mb-1">
              Analyst Mandate / Workspace Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your primary financial oversight responsibilities..."
              className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slateNavy-50/50 border border-slateNavy-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slateNavy-900 resize-none"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slateNavy-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetDefaults}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-slateNavy-500 hover:text-slateNavy-900"
            >
              Reset to Defaults
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto shadow-md"
              >
                Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserAvatar } from '../common/UserAvatar.js';
import { AlertChip } from '../common/AlertChip.js';
import { Button } from '../common/Button.js';
import { Download, LogIn, LogOut, Layers, User } from 'lucide-react';

interface NavbarProps {
  onOpenExportModal: () => void;
  selectedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExportModal, selectedCount }) => {
  const { user, isAuthenticated, openLoginModal, openProfileModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <nav
        aria-label="Main Navigation"
        className="glass-pill-nav rounded-2xl px-4 py-3 flex items-center justify-between gap-4 transition-all"
      >
        {/* Brand & Platform Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slateNavy-950 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight text-slateNavy-950">
              Fin<span className="text-indigo-600">Flow</span>
            </span>
            <p className="hidden sm:block text-[11px] text-slateNavy-500 font-medium -mt-0.5">
              Financial Analytics &amp; Ledger
            </p>
          </div>
        </div>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-3">
          {/* Quick Configurable CSV Export Trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenExportModal}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Configure and Export CSV Report"
          >
            <span>Export CSV</span>
            {selectedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                {selectedCount}
              </span>
            )}
          </Button>

          {/* Authentication & User Info */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slateNavy-100 transition-colors focus:outline-none"
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                <UserAvatar userId={user.id} userProfile={user.avatarUrl} size="sm" />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-slateNavy-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slateNavy-500 capitalize">{user.title || user.role}</p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slateNavy-200 shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slateNavy-100">
                    <p className="text-xs font-bold text-slateNavy-900">{user.name}</p>
                    <p className="text-[11px] text-slateNavy-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <AlertChip
                        variant={user.role === 'admin' ? 'Admin' : 'Analyst'}
                        size="sm"
                      />
                      <span className="text-[10px] font-mono text-slateNavy-400 font-semibold">
                        USR-{user.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slateNavy-700 hover:bg-slateNavy-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Edit Profile &amp; Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={openLoginModal}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

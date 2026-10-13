import React from 'react';
import { CheckCircle2, ListFilter, Flame, Settings, Plus, LogOut, Moon, Sun, Laptop, ShieldCheck } from 'lucide-react';
import { ActiveTab, UserSettings } from '../types';
import { User } from '../firebase';
import { CupertinoAvatar } from './CupertinoAvatar';
import { triggerHaptic } from '../utils/haptics';

interface DesktopSidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingTodayCount: number;
  habitsCount: number;
  onOpenCreateHabit: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  user: User | null;
  onSignOut: () => void;
  isOnline: boolean;
  isAdmin?: boolean;
  onOpenAdminPortal?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingTodayCount,
  habitsCount,
  onOpenCreateHabit,
  settings,
  onUpdateSettings,
  user,
  onSignOut,
  isOnline,
  isAdmin = false,
  onOpenAdminPortal,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: CheckCircle2,
      badge: pendingTodayCount > 0 ? pendingTodayCount : undefined,
    },
    {
      id: 'habits',
      label: 'All Habits',
      icon: ListFilter,
      badge: habitsCount > 0 ? habitsCount : undefined,
    },
    {
      id: 'trends',
      label: 'Trends & Stats',
      icon: Flame,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const cycleTheme = () => {
    triggerHaptic('light');
    const nextTheme: 'system' | 'light' | 'dark' =
      settings.theme === 'system' ? 'dark' : settings.theme === 'dark' ? 'light' : 'system';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <aside
      aria-label="Desktop Navigation"
      className="hidden md:flex w-64 lg:w-72 flex-col shrink-0 h-screen sticky top-0 bg-white/75 dark:bg-[#161618]/90 backdrop-blur-2xl border-r border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white flex items-center justify-center shadow-md ring-1 ring-black/5 dark:ring-white/10 shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.4px]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold text-black dark:text-white tracking-tight leading-tight">
                Habits
              </h1>
              <p className="text-[12px] font-medium text-[#8E8E93] truncate">
                Daily Routines
              </p>
            </div>
          </div>

          {/* Quick Theme Switcher */}
          <button
            onClick={cycleTheme}
            title={`Current theme: ${settings.theme}. Click to change.`}
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[#8E8E93] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : settings.theme === 'light' ? (
              <Sun className="w-4 h-4 text-[#FF9500]" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Desktop CTA Button */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            onOpenCreateHabit();
          }}
          className="w-full py-2.5 px-4 bg-[#007AFF] hover:bg-[#007AFF]/90 active:scale-[0.98] text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.8px]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto ios-scroller">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-2">
          Workspace
        </p>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('light');
                onTabChange(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white stroke-[2.4px]' : 'text-[#8E8E93]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : item.id === 'today'
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Offline status indicator in sidebar */}
        {!isOnline && (
          <div className="mt-4 px-3 py-2 rounded-[12px] bg-[#FF9500]/10 border border-[#FF9500]/20 text-[#FF9500] text-[12px] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse" />
            <span>Offline mode active</span>
          </div>
        )}

        {/* Separated Admin Portal Access Button */}
        {onOpenAdminPortal && (
          <div className="pt-3">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenAdminPortal();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] font-semibold text-[#AF52DE] bg-[#AF52DE]/10 hover:bg-[#AF52DE]/15 border border-[#AF52DE]/20 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.2px]" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#AF52DE] text-white">
                Console
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* User Account / Footer Card */}
      {user && (
        <div className="p-3 border-t border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)]">
          <div className="p-2.5 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] flex items-center justify-between gap-2.5">
            <div
              onClick={() => onTabChange('settings')}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <CupertinoAvatar settings={settings} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-black dark:text-white truncate leading-tight">
                    {user.displayName || settings.name || 'User'}
                  </p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#AF52DE]/15 text-[#AF52DE] border border-[#AF52DE]/30 shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8E93] truncate leading-tight mt-0.5">
                  {user.email || 'Google Account'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('warning');
                onSignOut();
              }}
              title="Sign Out"
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

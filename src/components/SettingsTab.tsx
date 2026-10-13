import React, { useState } from 'react';
import { UserSettings, Habit, HabitLogsState } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';
import {
  Sun,
  Moon,
  Smartphone,
  Volume2,
  Vibrate,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CupertinoAvatar } from './CupertinoAvatar';
import { CupertinoEditProfileModal } from './CupertinoEditProfileModal';
import { User } from '../firebase';

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  habits: Habit[];
  logs: HabitLogsState;
  onResetData: () => void;
  onImportData: (habits: Habit[], logs: HabitLogsState) => void;
  user?: User | null;
  onSignOut?: () => void;
  isAdmin?: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  habits,
  logs,
  onResetData,
  onImportData,
  user,
  onSignOut,
  isAdmin = false,
}) => {
  const { isInstalled, isIOS, isInstallable, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleToggle = (key: keyof UserSettings) => {
    triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    triggerHaptic('medium');
    onUpdateSettings({
      ...settings,
      theme,
    });
  };

  // Export JSON backup
  const handleExportData = () => {
    triggerHaptic('medium');
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      habits,
      logs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.habits && json.logs) {
          triggerHaptic('success');
          onImportData(json.habits, json.logs);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        }
      } catch (err) {
        console.error('Failed to import JSON data:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 pb-safe-nav md:pb-12 overflow-y-auto ios-scroller">
      {/* Header */}
      <div className="pt-safe px-4 md:px-8 pb-2 md:py-4 sticky top-0 z-30 bg-[#F2F2F7]/95 dark:bg-[#000000]/95 backdrop-blur-xl border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-3 md:py-6 space-y-5 md:space-y-6">
        {/* User Profile Card */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setIsEditProfileOpen(true);
          }}
          className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] flex items-center justify-between gap-3.5 cursor-pointer active:bg-black/5 dark:active:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <CupertinoAvatar settings={settings} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-black dark:text-white truncate">
                  {settings.name}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#AF52DE]/15 text-[#AF52DE] border border-[#AF52DE]/30 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#8E8E93] truncate">
                {settings.bio || `${habits.length} habits tracked`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstalled && (
              <span className="text-[11px] font-semibold text-[#34C759] bg-[#34C759]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                App
              </span>
            )}
            <span className="text-[14px] font-semibold text-[#007AFF] group-hover:opacity-80">
              Edit
            </span>
            <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
          </div>
        </div>

        {/* Inset Section: Appearance (iOS Display & Brightness Style) */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-2">
            Appearance
          </h3>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div
                  className={`w-full aspect-[4/5] rounded-[14px] p-2 bg-[#F2F2F7] border-2 flex flex-col justify-between transition-all shadow-xs ${
                    settings.theme === 'light'
                      ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20'
                      : 'border-[rgba(60,60,67,0.12)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sun className="w-3.5 h-3.5 text-[#FF9500]" />
                    <div className="w-6 h-1.5 bg-[#C7C7CC] rounded-full" />
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="w-full h-2.5 bg-white rounded-[4px] shadow-xs" />
                    <div className="w-4/5 h-2.5 bg-white rounded-[4px] shadow-xs" />
                    <div className="w-3/5 h-2.5 bg-white rounded-[4px] shadow-xs" />
                  </div>
                  <div className="w-full h-1 bg-[#007AFF] rounded-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      settings.theme === 'light'
                        ? 'border-[#007AFF] bg-[#007AFF]'
                        : 'border-[#C7C7CC] dark:border-[#48484A]'
                    }`}
                  >
                    {settings.theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-[13px] ${settings.theme === 'light' ? 'font-semibold text-black dark:text-white' : 'text-[#8E8E93]'}`}>
                    Light
                  </span>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div
                  className={`w-full aspect-[4/5] rounded-[14px] p-2 bg-[#000000] border-2 flex flex-col justify-between transition-all shadow-xs ${
                    settings.theme === 'dark'
                      ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20'
                      : 'border-[rgba(84,84,88,0.36)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Moon className="w-3.5 h-3.5 text-[#007AFF]" />
                    <div className="w-6 h-1.5 bg-[#3A3A3C] rounded-full" />
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="w-full h-2.5 bg-[#1C1C1E] rounded-[4px]" />
                    <div className="w-4/5 h-2.5 bg-[#1C1C1E] rounded-[4px]" />
                    <div className="w-3/5 h-2.5 bg-[#1C1C1E] rounded-[4px]" />
                  </div>
                  <div className="w-full h-1 bg-[#007AFF] rounded-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      settings.theme === 'dark'
                        ? 'border-[#007AFF] bg-[#007AFF]'
                        : 'border-[#C7C7CC] dark:border-[#48484A]'
                    }`}
                  >
                    {settings.theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-[13px] ${settings.theme === 'dark' ? 'font-semibold text-black dark:text-white' : 'text-[#8E8E93]'}`}>
                    Dark
                  </span>
                </div>
              </button>

              {/* System Automatic Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div
                  className={`w-full aspect-[4/5] rounded-[14px] p-2 bg-gradient-to-r from-[#F2F2F7] 50% to-[#000000] 50% border-2 flex flex-col justify-between transition-all shadow-xs ${
                    settings.theme === 'system'
                      ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20'
                      : 'border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="w-3.5 h-3.5 text-[#007AFF]" />
                    <div className="w-6 h-1.5 bg-[#8E8E93] rounded-full" />
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="w-full h-2.5 bg-gradient-to-r from-white 50% to-[#1C1C1E] 50% rounded-[4px]" />
                    <div className="w-4/5 h-2.5 bg-gradient-to-r from-white 50% to-[#1C1C1E] 50% rounded-[4px]" />
                    <div className="w-3/5 h-2.5 bg-gradient-to-r from-white 50% to-[#1C1C1E] 50% rounded-[4px]" />
                  </div>
                  <div className="w-full h-1 bg-[#007AFF] rounded-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      settings.theme === 'system'
                        ? 'border-[#007AFF] bg-[#007AFF]'
                        : 'border-[#C7C7CC] dark:border-[#48484A]'
                    }`}
                  >
                    {settings.theme === 'system' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-[13px] ${settings.theme === 'system' ? 'font-semibold text-black dark:text-white' : 'text-[#8E8E93]'}`}>
                    Auto
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Inset Section: Feedback & Animation */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-1.5">
            Feel &amp; Feedback
          </h3>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] divide-y divide-[rgba(60,60,67,0.1)] dark:divide-[rgba(84,84,88,0.3)]">
            {/* Audio Effects */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#34C759] text-white flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">Sound Effects</p>
                  <p className="text-[12px] text-[#8E8E93]">Subtle native ticks on completion</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sound')}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  settings.sound ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.sound ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">Haptic Vibration</p>
                  <p className="text-[12px] text-[#8E8E93]">Taptic engine tap response</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('haptics')}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  settings.haptics ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.haptics ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Celebration Confetti */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#FF9500] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">Confetti</p>
                  <p className="text-[12px] text-[#8E8E93]">Celebrate daily milestones</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('confetti')}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  settings.confetti ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.confetti ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Inset Section: PWA Standalone Mode */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-1.5">
            iOS Home Screen (PWA)
          </h3>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)]">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">
                    {isInstalled ? 'Installed as App' : 'Add to Home Screen'}
                  </p>
                  <p className="text-[12px] text-[#8E8E93]">
                    {isInstalled
                      ? 'Running in standalone Cupertino mode'
                      : 'Hides Safari URL bar & enables notch safe area'}
                  </p>
                </div>
              </div>

              {!isInstalled && (
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    if (isInstallable) {
                      install();
                    } else {
                      setShowIOSPrompt(!showIOSPrompt);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#007AFF] text-white text-[13px] font-semibold rounded-[10px] active:scale-95 transition-transform"
                >
                  {isInstallable ? 'Install' : 'Guide'}
                </button>
              )}
            </div>

            {showIOSPrompt && !isInstalled && (
              <div className="p-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] border-t border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.3)] text-[13px] text-black dark:text-white space-y-2">
                <p className="font-semibold">How to install on iOS Safari:</p>
                <ol className="list-decimal list-inside space-y-1 text-[#8E8E93]">
                  <li>Tap the <span className="font-semibold text-[#007AFF]">Share</span> icon in Safari toolbar</li>
                  <li>Scroll down and select <span className="font-semibold text-black dark:text-white">Add to Home Screen</span></li>
                  <li>Tap <span className="font-semibold text-[#007AFF]">Add</span> in the top right</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Inset Section: Data & Backup */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-1.5">
            Data &amp; Storage
          </h3>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] divide-y divide-[rgba(60,60,67,0.1)] dark:divide-[rgba(84,84,88,0.3)]">
            {/* Export */}
            <button
              onClick={handleExportData}
              className="w-full p-3.5 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#30B0C7] text-white flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">Export Backup</p>
                  <p className="text-[12px] text-[#8E8E93]">Download all habits and logs as JSON</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            {/* Import */}
            <label className="w-full p-3.5 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#AF52DE] text-white flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black dark:text-white">Import Backup</p>
                  <p className="text-[12px] text-[#8E8E93]">
                    {importSuccess ? '✓ Successfully restored data!' : 'Restore habits from a JSON file'}
                  </p>
                </div>
              </div>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset all habits and history to initial sample data?')) {
                  triggerHaptic('warning');
                  onResetData();
                }
              }}
              className="w-full p-3.5 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#FF3B30] text-white flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-[#FF3B30]">Reset to Sample Data</p>
                  <p className="text-[12px] text-[#8E8E93]">Reload initial habits and 14-day history</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>
          </div>
        </div>

        {/* Inset Section: Account & Sign Out */}
        {user && onSignOut && (
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-1.5">
              Account
            </h3>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] divide-y divide-[rgba(60,60,67,0.1)] dark:divide-[rgba(84,84,88,0.3)]">
              {/* Signed In User Info */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-black dark:text-white truncate">
                      {user.displayName || 'Google User'}
                    </p>
                    <p className="text-[12px] text-[#8E8E93] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#34C759] bg-[#34C759]/15 px-2 py-0.5 rounded-full shrink-0">
                  Connected
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  triggerHaptic('warning');
                  onSignOut();
                }}
                className="w-full p-3.5 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 text-[#FF3B30] flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[16px] font-medium text-[#FF3B30]">Sign Out</p>
                    <p className="text-[12px] text-[#8E8E93]">Disconnect from this device</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 pb-6 text-center text-[12px] text-[#8E8E93] space-y-1">
          <p className="font-semibold">Habits iOS Edition • v1.0</p>
          <p>Designed strictly mimicking native Apple Human Interface Guidelines</p>
          <p>Safe Area Inset • Standalone PWA • Offline First</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <CupertinoEditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        settings={settings}
        onSave={onUpdateSettings}
      />
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, Habit, HabitCategory, HabitLogsState, UserSettings, CATEGORIES } from './types';
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from './utils/storage';
import {
  subscribeHabits,
  saveHabitToFirestore,
  deleteHabitFromFirestore,
  subscribeLogs,
  saveHabitLogValueToFirestore,
  saveAllLogsToFirestore,
  resetFirestoreData,
} from './services/habitsFirestore';
import {
  subscribeAuthState,
  signOutUser,
  type User,
} from './firebase';
import { toDateKey, isHabitScheduledForDate, parseDateKey } from './utils/date';
import { CupertinoTabBar } from './components/CupertinoTabBar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { TodayTab } from './components/TodayTab';
import { HabitsTab } from './components/HabitsTab';
import { TrendsTab } from './components/TrendsTab';
import { SettingsTab } from './components/SettingsTab';
import { CupertinoAddHabitModal } from './components/CupertinoAddHabitModal';
import { CupertinoSignInScreen } from './components/CupertinoSignInScreen';
import { WifiOff } from 'lucide-react';
import { checkIsAdmin, syncUserProfile } from './services/adminService';
import { AdminPortal } from './components/admin/AdminPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => toDateKey(new Date()));
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogsState>({});
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Dedicated Admin Portal mode: active if path is /admin or hash is #admin
  const [isPortalAdmin, setIsPortalAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  // Listen to browser navigation changes
  useEffect(() => {
    const handleUrlChange = () => {
      setIsPortalAdmin(
        window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      );
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
    setIsPortalAdmin(true);
  };

  const navigateToApp = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setIsPortalAdmin(false);
  };

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubAuth = subscribeAuthState(async (user) => {
      console.log('👤 [Auth] State changed:', user ? `${user.email} (${user.uid})` : 'Signed out');
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        // Non-destructive user profile sync (stores metadata without altering roles or habits)
        syncUserProfile(user).catch((err) => {
          console.warn('⚠️ [Profile Sync] Non-critical warning:', err);
        });

        // Single source of truth: check whether /admins/{uid} exists
        try {
          const adminAuthorized = await checkIsAdmin(user.uid);
          setIsAdmin(adminAuthorized);
          if (adminAuthorized) {
            console.log('🛡️ [Admin Status] Administrator privileges confirmed.');
          }
        } catch (err) {
          console.warn('⚠️ [Admin Check] Error verifying admin document:', err);
          setIsAdmin(false);
        }

        // Adopt Google profile display name & avatar if user has them
        setSettings((prev) => {
          if (user.displayName && (!prev.name || prev.name === 'Faez')) {
            const updated: UserSettings = {
              ...prev,
              name: user.displayName,
              avatarUrl: user.photoURL || prev.avatarUrl,
            };
            saveSettings(updated);
            return updated;
          }
          return prev;
        });
      } else {
        // Clear habits, logs and admin state from memory when signed out
        setIsAdmin(false);
        setHabits([]);
        setLogs({});
      }
    });

    return () => unsubAuth();
  }, []);

  // Real-time Firestore subscriptions for the authenticated user's private habits and logs
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    console.log(`📡 [Firestore] Subscribing to habits for user: ${uid}`);
    const unsubHabits = subscribeHabits(
      uid,
      (items) => {
        setHabits(items);
      },
      (error) => {
        console.error(`🔥 [Firestore Habits Subscription Error for ${uid}]:`, error);
      }
    );

    console.log(`📡 [Firestore] Subscribing to habit_logs for user: ${uid}`);
    const unsubLogs = subscribeLogs(
      uid,
      (dailyLogs) => {
        setLogs(dailyLogs);
      },
      (error) => {
        console.error(`🔥 [Firestore Logs Subscription Error for ${uid}]:`, error);
      }
    );

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [currentUser]);

  // Sync dark mode class on HTML document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }

      // Sync status bar theme-color
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach((m) => {
        m.setAttribute('content', isDark ? '#000000' : '#F2F2F7');
      });
    };

    applyTheme();
    const listener = () => {
      if (settings.theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate remaining incomplete habits for TODAY
  const pendingTodayCount = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const todayDate = parseDateKey(todayKey);
    const scheduled = habits.filter(
      (h) => !h.archived && isHabitScheduledForDate(h.frequency, todayDate)
    );
    const todayLog = logs[todayKey] || {};

    let done = 0;
    scheduled.forEach((h) => {
      const v = todayLog[h.id];
      if (h.targetType === 'boolean' && v) done++;
      else if (h.targetType === 'numeric' && typeof v === 'number' && v >= (h.targetValue || 1)) done++;
    });

    return Math.max(0, scheduled.length - done);
  }, [habits, logs]);

  // Handler for habit log value update (User-scoped Firestore)
  const handleUpdateValue = async (habitId: string, value: number | boolean) => {
    if (!currentUser) return;
    const currentDayLogs = logs[selectedDateKey] || {};

    // Optimistic UI update
    setLogs((prev) => {
      const dayLogs = { ...(prev[selectedDateKey] || {}) };
      dayLogs[habitId] = value;
      return {
        ...prev,
        [selectedDateKey]: dayLogs,
      };
    });

    try {
      await saveHabitLogValueToFirestore(currentUser.uid, selectedDateKey, habitId, value, currentDayLogs);
    } catch (err) {
      console.error(`🔥 [Firestore] Failed to save habit log (${habitId}):`, err);
    }
  };

  // Handler for habit creation / edit (User-scoped Firestore)
  const handleSaveHabit = async (savedHabit: Habit) => {
    if (!currentUser) return;
    const habitToSave: Habit = {
      ...savedHabit,
      id: savedHabit.id || `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: savedHabit.createdAt || new Date().toISOString(),
    };

    // Optimistic UI update
    setHabits((prev) => {
      const exists = prev.some((h) => h.id === habitToSave.id);
      if (exists) {
        return prev.map((h) => (h.id === habitToSave.id ? habitToSave : h));
      }
      return [...prev, habitToSave];
    });
    setEditingHabit(null);

    try {
      await saveHabitToFirestore(currentUser.uid, habitToSave);
      console.log('✅ [Firestore] Successfully saved habit:', habitToSave.title);
    } catch (err) {
      console.error('🔥 [Firestore] Error saving habit to Firestore:', err);
    }
  };

  // Handler for habit deletion (User-scoped Firestore)
  const handleDeleteHabit = async (habitId: string) => {
    if (!currentUser) return;

    // Optimistic UI update
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setEditingHabit(null);

    try {
      await deleteHabitFromFirestore(currentUser.uid, habitId);
      console.log('✅ [Firestore] Successfully deleted habit from Firestore:', habitId);
    } catch (err) {
      console.error('🔥 [Firestore] Error deleting habit from Firestore:', err);
    }
  };

  // Handler for settings updates
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Reset to sample initial data (User-scoped Firestore)
  const handleResetData = async () => {
    if (!currentUser) return;
    try {
      await resetFirestoreData(currentUser.uid);
      setSettings(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
      setSelectedDateKey(toDateKey(new Date()));
      console.log('✅ [Firestore] Database reset to sample initial data for current user.');
    } catch (err) {
      console.error('🔥 [Firestore] Error resetting Firestore data:', err);
    }
  };

  // Import backup data (User-scoped Firestore)
  const handleImportData = async (importedHabits: Habit[], importedLogs: HabitLogsState) => {
    if (!currentUser) return;
    try {
      for (const h of importedHabits) {
        await saveHabitToFirestore(currentUser.uid, h);
      }
      await saveAllLogsToFirestore(currentUser.uid, importedLogs);
      console.log('✅ [Firestore] Successfully imported backup data into current user.');
    } catch (err) {
      console.error('🔥 [Firestore] Error importing data into Firestore:', err);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setActiveTab('today');
    } catch (err) {
      console.error('🔥 [Auth Error] Failed to sign out:', err);
    }
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleOpenCreateHabit = (defaultCategory?: HabitCategory) => {
    if (defaultCategory) {
      const catMeta = CATEGORIES.find((c) => c.id === defaultCategory);
      setEditingHabit({
        id: '',
        title: '',
        category: defaultCategory,
        color: catMeta?.color || '#007AFF',
        icon: catMeta?.defaultIcon || 'water',
        timeOfDay: 'anytime',
        frequency: 'daily',
        targetType: 'boolean',
        createdAt: new Date().toISOString(),
      });
    } else {
      setEditingHabit(null);
    }
    setIsAddModalOpen(true);
  };

  // Loading Screen while Firebase Auth initializes
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#F2F2F7] dark:bg-[#000000]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-[#8E8E93]">Connecting to Habits...</p>
        </div>
      </div>
    );
  }

  // Dedicated Admin Portal view: renders standalone when isPortalAdmin is active
  if (isPortalAdmin) {
    return (
      <AdminPortal
        currentUser={currentUser}
        onExitAdmin={navigateToApp}
        settings={settings}
      />
    );
  }

  // Not authenticated: render Cupertino Google Sign-In Screen
  if (!currentUser) {
    return <CupertinoSignInScreen />;
  }

  return (
    <div className="flex w-full h-screen bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white overflow-hidden">
      {/* Desktop Sidebar: Visible on md+ (768px+) screens */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTodayCount={pendingTodayCount}
        habitsCount={habits.length}
        onOpenCreateHabit={() => handleOpenCreateHabit()}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        user={currentUser}
        onSignOut={handleSignOut}
        isOnline={isOnline}
        isAdmin={isAdmin}
        onOpenAdminPortal={navigateToAdmin}
      />

      {/* Main Viewport Container: Full width on desktop, phone-centered on mobile */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden w-full bg-[#F2F2F7] dark:bg-[#000000]">
        {/* Offline Indicator pill on Mobile */}
        {!isOnline && (
          <div className="md:hidden absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 bg-[#FF9500] text-white text-[12px] font-semibold rounded-full shadow-lg animate-in fade-in">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline • Saving locally</span>
          </div>
        )}

        {/* Tab Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'today' && (
            <TodayTab
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDateKey}
              habits={habits}
              logs={logs}
              settings={settings}
              onUpdateValue={handleUpdateValue}
              onOpenAddModal={handleOpenCreateHabit}
              onEditHabit={handleOpenEditHabit}
              onOpenProfile={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsTab
              habits={habits}
              onOpenAddModal={handleOpenCreateHabit}
              onEditHabit={handleOpenEditHabit}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsTab
              habits={habits}
              logs={logs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              habits={habits}
              logs={logs}
              onResetData={handleResetData}
              onImportData={handleImportData}
              user={currentUser}
              onSignOut={handleSignOut}
              isAdmin={isAdmin}
            />
          )}
        </main>

        {/* Mobile Cupertino Bottom Tab Bar: Hidden on md+ (768px+) screens */}
        <div className="md:hidden">
          <CupertinoTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingTodayCount={pendingTodayCount}
          />
        </div>

        {/* Cupertino Add / Edit Habit Modal Dialog */}
        <CupertinoAddHabitModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHabit(null);
          }}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          editingHabit={editingHabit}
        />
      </div>
    </div>
  );
}

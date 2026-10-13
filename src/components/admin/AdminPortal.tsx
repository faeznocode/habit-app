import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  BarChart3,
  Sliders,
  Activity,
  ArrowLeft,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Mail,
  Flame,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Info,
  Plus,
  Edit2,
  Trash2,
  X,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { User, signInWithGoogle, signOutUser } from '../../firebase';
import {
  checkIsAdminDetailed,
  AdminCheckDetails,
  fetchRegisteredUsers,
  UserProfile,
} from '../../services/adminService';
import { UserSettings, CategoryInfo } from '../../types';
import { loadCategories, saveCategories, resetCategoriesToDefaults } from '../../utils/categories';
import { IOS_SYSTEM_COLORS, HABIT_ICONS } from '../../utils/icons';
import { triggerHaptic } from '../../utils/haptics';

interface AdminPortalProps {
  currentUser: User | null;
  onExitAdmin: () => void;
  settings: UserSettings;
}

type AdminSection = 'overview' | 'users' | 'analytics' | 'settings' | 'diagnostics';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onExitAdmin,
  settings,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [adminDetails, setAdminDetails] = useState<AdminCheckDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [copiedUid, setCopiedUid] = useState(false);

  // Data states
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Application Settings state
  const [appName, setAppName] = useState('Habits');
  const [welcomeMessage, setWelcomeMessage] = useState('Build lasting routines, one day at a time.');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Category management state
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>(() => loadCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('🌟');
  const [categoryColor, setCategoryColor] = useState('#007AFF');
  const [categoryIcon, setCategoryIcon] = useState('target');
  const [categoryFormError, setCategoryFormError] = useState('');

  const handleOpenAddCategory = () => {
    triggerHaptic('light');
    setEditingCategory(null);
    setCategoryLabel('');
    setCategoryEmoji('✨');
    setCategoryColor('#007AFF');
    setCategoryIcon('target');
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryInfo) => {
    triggerHaptic('light');
    setEditingCategory(cat);
    setCategoryLabel(cat.label);
    setCategoryEmoji(cat.emoji);
    setCategoryColor(cat.color);
    setCategoryIcon(cat.defaultIcon || 'target');
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    const trimmed = categoryLabel.trim();
    if (!trimmed) {
      setCategoryFormError('Category name is required.');
      return;
    }

    triggerHaptic('success');
    if (editingCategory) {
      const updated = categoriesList.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              label: trimmed,
              emoji: categoryEmoji || '✨',
              color: categoryColor,
              defaultIcon: categoryIcon,
            }
          : c
      );
      setCategoriesList(updated);
      saveCategories(updated);
    } else {
      const slug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueId = categoriesList.some((c) => c.id === slug)
        ? `${slug}-${Date.now().toString().slice(-4)}`
        : slug;

      const newCat: CategoryInfo = {
        id: uniqueId,
        label: trimmed,
        emoji: categoryEmoji || '✨',
        color: categoryColor,
        defaultIcon: categoryIcon,
        isCustom: true,
      };

      const updated = [...categoriesList, newCat];
      setCategoriesList(updated);
      saveCategories(updated);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    triggerHaptic('warning');
    const updated = categoriesList.filter((c) => c.id !== catId);
    setCategoriesList(updated);
    saveCategories(updated);
  };

  const handleResetCategories = () => {
    triggerHaptic('medium');
    const defaults = resetCategoriesToDefaults();
    setCategoriesList(defaults);
  };

  // Check admin verification status
  const runVerification = async () => {
    if (!currentUser) {
      setIsVerifying(false);
      return;
    }
    setIsVerifying(true);
    const details = await checkIsAdminDetailed(currentUser.uid, currentUser.email);
    setAdminDetails(details);
    setIsVerifying(false);

    if (details.isAdmin) {
      loadAdminData();
    }
  };

  useEffect(() => {
    runVerification();
  }, [currentUser]);

  // Load admin data
  const loadAdminData = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await fetchRegisteredUsers();
      setUsersList(users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCopyUid = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    triggerHaptic('success');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const query = userSearchQuery.toLowerCase();
    const matchesSearch =
      u.displayName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.uid.includes(query);
    const matchesRole =
      selectedRoleFilter === 'all'
        ? true
        : selectedRoleFilter === 'admin'
        ? u.role === 'admin'
        : u.role !== 'admin';
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsersCount = usersList.length;
  const activeRecentlyCount = usersList.filter((u) => {
    if (!u.lastActiveAt) return false;
    const diffDays = (Date.now() - new Date(u.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  // Not signed in state
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] p-4 text-black dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] rounded-[24px] p-8 shadow-xl border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] text-center space-y-6">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Admin Portal</h1>
            <p className="text-[14px] text-[#8E8E93] mt-1.5">
              Please sign in with your authorized administrator account to access the administration console.
            </p>
          </div>
          <button
            onClick={() => signInWithGoogle()}
            className="w-full py-3.5 px-4 bg-[#007AFF] hover:bg-[#007AFF]/90 active:scale-[0.98] text-white text-[15px] font-semibold rounded-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Sign In with Google</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="text-[13px] text-[#8E8E93] hover:text-[#007AFF] transition-colors"
          >
            ← Return to Habit Tracker
          </button>
        </div>
      </div>
    );
  }

  // Verification loading
  if (isVerifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-[#8E8E93]">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // Not an Admin: Clean Access Gatekeeper & Diagnostics Screen
  if (!adminDetails?.isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] p-4 text-black dark:text-white">
        <div className="max-w-lg w-full bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 md:p-8 shadow-xl border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-black dark:text-white leading-tight">
                Administrator Access Required
              </h1>
              <p className="text-[13px] text-[#8E8E93] mt-0.5">
                The current signed-in account is not registered in the protected admin directory.
              </p>
            </div>
          </div>

          {/* Diagnostic Card */}
          <div className="p-4 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)] space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#8E8E93]">Signed in as:</span>
              <span className="font-medium text-black dark:text-white truncate max-w-[220px]">
                {currentUser.email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#8E8E93]">Firestore Database:</span>
              <span className="font-mono text-[11px] text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-md truncate max-w-[220px]">
                {adminDetails?.databaseId}
              </span>
            </div>

            <div className="pt-2 border-t border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)]">
              <span className="font-semibold text-[#8E8E93] block mb-1">Your Firebase Auth UID:</span>
              <div className="flex items-center justify-between gap-2 p-2 rounded-[10px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 font-mono text-[12px] break-all">
                <span className="select-all">{currentUser.uid}</span>
                <button
                  onClick={handleCopyUid}
                  className="px-2 py-1 rounded-[6px] bg-[#007AFF] text-white text-[11px] font-semibold shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUid ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] text-[12px]">
              <span className="font-semibold text-[#8E8E93] block mb-0.5">Verification Status:</span>
              <p className="text-[#FF3B30] font-medium">
                {adminDetails?.errorMessage || `Document /admins/${currentUser.uid} not found.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={runVerification}
              className="flex-1 py-3 px-4 bg-[#007AFF] text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#007AFF]/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-check Admin Status</span>
            </button>
            <button
              onClick={onExitAdmin}
              className="py-3 px-4 bg-black/5 dark:bg-white/10 text-black dark:text-white text-[14px] font-medium rounded-[12px] hover:bg-black/10 dark:hover:bg-white/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              Back to Habit Tracker
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Administrator: Render Full Standalone Admin Portal
  return (
    <div className="flex h-screen w-full bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col shrink-0 h-screen bg-white/80 dark:bg-[#161618]/90 backdrop-blur-2xl border-r border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.25)] select-none">
        {/* Header Branding */}
        <div className="p-5 border-b border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#AF52DE] to-[#5856D6] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 stroke-[2.4px]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[17px] font-bold text-black dark:text-white tracking-tight leading-tight">
                  Admin Portal
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#AF52DE]/15 text-[#AF52DE] border border-[#AF52DE]/30">
                  PRO
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E93] truncate">Habits Management</p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="mt-4 w-full py-2 px-3 rounded-[10px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[13px] font-medium text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Habit Tracker</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-2">
            Console
          </p>

          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users, badge: totalUsersCount },
            { id: 'analytics', label: 'Habit Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Application Settings', icon: Sliders },
            { id: 'diagnostics', label: 'System Diagnostics', icon: Database },
          ].map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveSection(item.id as AdminSection);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white stroke-[2.4px]' : 'text-[#8E8E93]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Current Admin User Footprint */}
        <div className="p-3 border-t border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)]">
          <div className="p-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#AF52DE] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
              {currentUser.displayName?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-black dark:text-white truncate">
                {currentUser.displayName || 'Administrator'}
              </p>
              <p className="text-[11px] text-[#8E8E93] truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F2F2F7] dark:bg-[#000000]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-[#161618]/90 backdrop-blur-xl border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.25)] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={onExitAdmin}
              className="p-1.5 rounded-[8px] bg-black/5 dark:bg-white/10 text-[#8E8E93]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-[16px] font-bold">Admin Portal</h1>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['overview', 'users', 'analytics', 'settings'] as AdminSection[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`px-2.5 py-1 rounded-[8px] text-[12px] font-semibold capitalize whitespace-nowrap ${
                  activeSection === tab ? 'bg-[#007AFF] text-white' : 'text-[#8E8E93]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Subview Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 ios-scroller">
          {/* SECTION 1: DASHBOARD OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-[24px] font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-[13px] text-[#8E8E93]">
                  Platform metrics and live operational status across your application.
                </p>
              </div>

              {/* 4 Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-2">
                  <div className="flex items-center justify-between text-[#007AFF]">
                    <span className="text-[13px] font-semibold text-[#8E8E93]">Registered Users</span>
                    <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[32px] font-extrabold tracking-tight tabular-nums">
                    {totalUsersCount}
                  </div>
                  <p className="text-[12px] text-[#8E8E93] flex items-center gap-1">
                    <span className="text-[#34C759] font-semibold">● Live</span> Profiles synchronized
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-2">
                  <div className="flex items-center justify-between text-[#34C759]">
                    <span className="text-[13px] font-semibold text-[#8E8E93]">Active Users</span>
                    <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/10 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[32px] font-extrabold tracking-tight tabular-nums">
                    {activeRecentlyCount}
                  </div>
                  <p className="text-[12px] text-[#8E8E93]">Active within last 7 days</p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-2">
                  <div className="flex items-center justify-between text-[#FF9500]">
                    <span className="text-[13px] font-semibold text-[#8E8E93]">Habit Categories</span>
                    <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/10 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[32px] font-extrabold tracking-tight tabular-nums">
                    {categoriesList.length}
                  </div>
                  <p className="text-[12px] text-[#8E8E93]">Active system categories</p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-2">
                  <div className="flex items-center justify-between text-[#AF52DE]">
                    <span className="text-[13px] font-semibold text-[#8E8E93]">Security Mode</span>
                    <div className="w-8 h-8 rounded-[10px] bg-[#AF52DE]/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[26px] font-bold tracking-tight text-[#AF52DE]">Enforced</div>
                  <p className="text-[12px] text-[#8E8E93]">RBAC via /admins/{'{uid}'}</p>
                </div>
              </div>

              {/* Quick Actions & Recent Users Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-bold">Recently Active Users</h3>
                      <p className="text-[12px] text-[#8E8E93]">Latest authenticated user activity</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('users')}
                      className="text-[13px] text-[#007AFF] font-semibold flex items-center gap-1 hover:underline"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {usersList.length === 0 ? (
                    <div className="text-center py-8 text-[#8E8E93] text-[13px]">
                      No synced user profiles found yet. They will appear here as users log in.
                    </div>
                  ) : (
                    <div className="divide-y divide-[rgba(60,60,67,0.06)] dark:divide-[rgba(84,84,88,0.15)]">
                      {usersList.slice(0, 5).map((user) => (
                        <div key={user.uid} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#007AFF]/15 text-[#007AFF] font-bold text-[13px] flex items-center justify-center shrink-0">
                              {user.displayName[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-black dark:text-white truncate">
                                {user.displayName}
                              </p>
                              <p className="text-[12px] text-[#8E8E93] truncate">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-[12px] text-[#8E8E93] shrink-0 font-medium">
                            {new Date(user.lastActiveAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-4">
                  <h3 className="text-[16px] font-bold">System Health</h3>
                  <div className="space-y-3 text-[13px]">
                    <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03]">
                      <span className="text-[#8E8E93]">Firestore Connection</span>
                      <span className="text-[#34C759] font-semibold flex items-center gap-1">
                        ● Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03]">
                      <span className="text-[#8E8E93]">Auth Provider</span>
                      <span className="font-semibold">Google OAuth</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03]">
                      <span className="text-[#8E8E93]">Active Admin UID</span>
                      <span className="font-mono text-[11px] truncate max-w-[130px]">
                        {currentUser.uid}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: USER MANAGEMENT */}
          {activeSection === 'users' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-[24px] font-bold tracking-tight">User Management</h2>
                  <p className="text-[13px] text-[#8E8E93]">
                    Search and inspect registered users across the platform (Read-only).
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="px-3.5 py-2 rounded-[12px] bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[13px] font-semibold flex items-center gap-1.5 self-start cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or UID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.25)] rounded-[14px] text-[14px] outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1E] p-1 rounded-[14px] border border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.25)] self-stretch sm:self-auto">
                  {(['all', 'admin', 'user'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold capitalize transition-colors ${
                        selectedRoleFilter === role
                          ? 'bg-[#007AFF] text-white'
                          : 'text-[#8E8E93] hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] text-[#8E8E93] uppercase font-semibold text-[11px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Registered</th>
                        <th className="px-5 py-3.5">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(60,60,67,0.06)] dark:divide-[rgba(84,84,88,0.15)]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-[#8E8E93]">
                            No users found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#007AFF]/15 text-[#007AFF] font-bold text-[12px] flex items-center justify-center shrink-0">
                                  {user.displayName[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="font-semibold text-black dark:text-white truncate max-w-[150px]">
                                  {user.displayName}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#8E8E93] truncate max-w-[200px]">
                              {user.email}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  user.role === 'admin' || user.uid === currentUser.uid
                                    ? 'bg-[#AF52DE]/15 text-[#AF52DE] border-[#AF52DE]/30'
                                    : 'bg-black/5 dark:bg-white/10 text-[#8E8E93] border-transparent'
                                }`}
                              >
                                {user.uid === currentUser.uid ? 'Admin (You)' : user.role || 'User'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-[#8E8E93]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 text-[#8E8E93]">
                              {new Date(user.lastActiveAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: HABIT ANALYTICS */}
          {activeSection === 'analytics' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-[24px] font-bold tracking-tight">Habit Analytics</h2>
                <p className="text-[13px] text-[#8E8E93]">
                  Platform-wide habit distribution, popular categories, and usage patterns.
                </p>
              </div>

              {/* Editable Categories Manager */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-bold">Manage Habit Categories</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF]">
                        {categoriesList.length} Categories
                      </span>
                    </div>
                    <p className="text-[12px] text-[#8E8E93]">
                      Add, edit, or customize categories available across the habit tracking app.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCategories}
                      title="Reset all categories to factory defaults"
                      className="px-3 py-2 rounded-[12px] bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[12px] font-semibold text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      onClick={handleOpenAddCategory}
                      className="px-3.5 py-2 rounded-[12px] bg-[#007AFF] hover:bg-[#007AFF]/90 active:scale-[0.98] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.8px]" />
                      <span>Add Category</span>
                    </button>
                  </div>
                </div>

                {/* Categories Grid with Edit / Delete actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.03] border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] flex items-center justify-between gap-3 group hover:border-[#007AFF]/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] shadow-xs shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.emoji}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-black dark:text-white truncate">
                            {cat.label}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-[11px] text-[#8E8E93] truncate font-mono">
                              {cat.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          title="Edit Category"
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {cat.isCustom && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            title="Delete Custom Category"
                            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3">
                  <div className="flex items-center gap-2 text-[#FF9500]">
                    <Flame className="w-5 h-5" />
                    <h3 className="text-[16px] font-bold text-black dark:text-white">Active Routines</h3>
                  </div>
                  <p className="text-[13px] text-[#8E8E93]">
                    Users track habits most actively in the morning and evening routines. Health, Mind, and Fitness continue to lead total logs.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3">
                  <div className="flex items-center gap-2 text-[#007AFF]">
                    <Award className="w-5 h-5" />
                    <h3 className="text-[16px] font-bold text-black dark:text-white">Completion Health</h3>
                  </div>
                  <p className="text-[13px] text-[#8E8E93]">
                    Privacy architecture guarantees user habits remain private to user subcollections while providing platform aggregates safely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: APPLICATION SETTINGS */}
          {activeSection === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-[24px] font-bold tracking-tight">Application Settings</h2>
                <p className="text-[13px] text-[#8E8E93]">
                  Configure global application branding, welcome banners, and user announcements.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-5">
                <div>
                  <label className="text-[13px] font-semibold text-[#8E8E93] block mb-1.5">
                    Application Display Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.3)] text-[14px] font-medium outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#8E8E93] block mb-1.5">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.3)] text-[14px] font-medium outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div className="pt-4 border-t border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[14px] font-bold block">Broadcast Announcement Banner</span>
                      <span className="text-[12px] text-[#8E8E93]">
                        Display an alert banner at the top of the habit tracker for all active users.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="w-5 h-5 accent-[#007AFF] rounded cursor-pointer"
                    />
                  </div>

                  {announcementActive && (
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. Scheduled maintenance this Sunday at 2 AM UTC..."
                      className="w-full px-4 py-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.3)] text-[14px] outline-none focus:border-[#007AFF]"
                    />
                  )}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      setSettingsSavedSuccess(true);
                      setTimeout(() => setSettingsSavedSuccess(false), 2500);
                    }}
                    className="py-2.5 px-5 bg-[#007AFF] hover:bg-[#007AFF]/90 active:scale-[0.98] text-white text-[14px] font-semibold rounded-[12px] transition-all cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                  {settingsSavedSuccess && (
                    <span className="text-[13px] text-[#34C759] font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Settings saved successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SYSTEM DIAGNOSTICS */}
          {activeSection === 'diagnostics' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-[24px] font-bold tracking-tight">System & Security Diagnostics</h2>
                <p className="text-[13px] text-[#8E8E93]">
                  Technical verification parameters and database inspection tools.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)]">
                  <span className="text-[13px] font-semibold text-[#8E8E93]">Administrator UID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] select-all">{currentUser.uid}</span>
                    <button
                      onClick={handleCopyUid}
                      className="px-2 py-1 rounded-[6px] bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUid ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)]">
                  <span className="text-[13px] font-semibold text-[#8E8E93]">Connected Database</span>
                  <span className="font-mono text-[12px] text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-0.5 rounded-md">
                    {adminDetails?.databaseId}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.15)]">
                  <span className="text-[13px] font-semibold text-[#8E8E93]">Authorization Source</span>
                  <span className="text-[13px] font-medium">
                    /admins/{currentUser.uid} (Verified {adminDetails?.checkedAt})
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={runVerification}
                    className="py-2.5 px-4 rounded-[12px] bg-[#007AFF] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-[#007AFF]/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-verify Connection Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Category Editor Modal Dialog */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-2xl border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)]">
              <h3 className="text-[18px] font-bold text-black dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Pill */}
            <div className="p-3.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.2)] flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#8E8E93]">Live Preview:</span>
              <div
                className="px-3.5 py-1.5 rounded-[12px] flex items-center gap-2 font-semibold text-[13px] shadow-xs"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                <span className="text-[16px]">{categoryEmoji || '✨'}</span>
                <span>{categoryLabel || 'Category Name'}</span>
              </div>
            </div>

            {/* Category Name */}
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => {
                  setCategoryLabel(e.target.value);
                  setCategoryFormError('');
                }}
                placeholder="e.g. Creativity, Social, Nutrition..."
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.05] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.3)] text-[14px] font-medium outline-none focus:border-[#007AFF]"
              />
              {categoryFormError && (
                <p className="text-[12px] text-[#FF3B30] mt-1 font-medium">{categoryFormError}</p>
              )}
            </div>

            {/* Emoji Selector */}
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                Emoji Icon
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={categoryEmoji}
                  onChange={(e) => setCategoryEmoji(e.target.value)}
                  maxLength={4}
                  className="w-16 text-center text-[22px] py-1.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.05] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.3)] outline-none"
                />
                <span className="text-[12px] text-[#8E8E93]">Type any emoji or pick below:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['🎨', '🌿', '🥗', '🌙', '💼', '🏊', '🎮', '🐕', '🎵', '✈️', '☕', '🧘', '📚', '💡', '🔥', '🏆'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setCategoryEmoji(em)}
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[16px] hover:scale-110 active:scale-95 transition-transform cursor-pointer ${
                      categoryEmoji === em ? 'bg-[#007AFF]/20 ring-2 ring-[#007AFF]' : 'bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2">
                {IOS_SYSTEM_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCategoryColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer ${
                      categoryColor === c.hex ? 'ring-3 ring-black/20 dark:ring-white/40 scale-110' : ''
                    }`}
                  >
                    {categoryColor === c.hex && <Check className="w-4 h-4 stroke-[3px]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-1 py-2.5 rounded-[12px] bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[14px] font-semibold text-black dark:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="flex-1 py-2.5 rounded-[12px] bg-[#007AFF] hover:bg-[#007AFF]/90 active:scale-[0.98] text-[14px] font-semibold text-white transition-all shadow-xs cursor-pointer"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

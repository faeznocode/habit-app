import React from 'react';
import { CheckCircle2, ListFilter, Flame, Settings } from 'lucide-react';
import { ActiveTab } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface CupertinoTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingTodayCount: number;
}

export const CupertinoTabBar: React.FC<CupertinoTabBarProps> = ({
  activeTab,
  onTabChange,
  pendingTodayCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: CheckCircle2 },
    { id: 'habits', label: 'Habits', icon: ListFilter },
    { id: 'trends', label: 'Trends', icon: Flame },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    if (activeTab !== tabId) {
      triggerHaptic('light');
      onTabChange(tabId);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1C1C1E] border-t border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.4)] pb-safe transition-colors md:hidden"
    >
      <div className="max-w-md mx-auto flex items-center justify-around pt-1.5 pb-1 px-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 touch-manipulation ${
                isActive ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#3C3C43] dark:hover:text-[#EBEBF5]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {tab.id === 'today' && pendingTodayCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 bg-[#FF3B30] text-white text-[11px] font-semibold flex items-center justify-center rounded-full shadow-sm">
                    {pendingTodayCount > 9 ? '9+' : pendingTodayCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'font-semibold text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

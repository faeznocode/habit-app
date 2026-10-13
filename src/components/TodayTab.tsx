import React from 'react';
import { Habit, HabitLogsState, UserSettings } from '../types';
import { CupertinoCalendarStrip } from './CupertinoCalendarStrip';
import { CupertinoHabitCard } from './CupertinoHabitCard';
import { CupertinoProgressRing } from './CupertinoProgressRing';
import { CupertinoAvatar } from './CupertinoAvatar';
import { PWAInstallSheet } from './PWAInstallSheet';
import { formatIOSDateHeader, isHabitScheduledForDate, parseDateKey, calculateHabitStreak, toDateKey } from '../utils/date';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface TodayTabProps {
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
  habits: Habit[];
  logs: HabitLogsState;
  settings: UserSettings;
  onUpdateValue: (habitId: string, value: number | boolean) => void;
  onOpenAddModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onOpenProfile?: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  selectedDateKey,
  onSelectDate,
  habits,
  logs,
  settings,
  onUpdateValue,
  onOpenAddModal,
  onEditHabit,
  onOpenProfile,
}) => {
  const selectedDate = parseDateKey(selectedDateKey);
  const { subtitle, title } = formatIOSDateHeader(selectedDateKey);
  const todayKey = toDateKey(new Date());
  const isToday = selectedDateKey === todayKey;

  // Filter habits active & scheduled for this date
  const activeHabits = habits.filter(
    (h) => !h.archived && isHabitScheduledForDate(h.frequency, selectedDate)
  );

  const dayLogs = logs[selectedDateKey] || {};

  // Compute completion stats
  let completedCount = 0;
  activeHabits.forEach((h) => {
    const val = dayLogs[h.id];
    if (h.targetType === 'boolean' && val) completedCount++;
    else if (h.targetType === 'numeric' && typeof val === 'number' && val >= (h.targetValue || 1)) {
      completedCount++;
    }
  });

  const completionRatio = activeHabits.length > 0 ? completedCount / activeHabits.length : 0;
  const completionPercent = Math.round(completionRatio * 100);

  // Group by Time of Day
  const timeSections: { key: 'morning' | 'afternoon' | 'evening' | 'anytime'; label: string; emoji: string }[] = [
    { key: 'morning', label: 'Morning', emoji: '🌅' },
    { key: 'afternoon', label: 'Afternoon', emoji: '☀️' },
    { key: 'evening', label: 'Evening', emoji: '🌙' },
    { key: 'anytime', label: 'Anytime', emoji: '✨' },
  ];

  return (
    <div className="flex-1 pb-safe-nav md:pb-12 overflow-y-auto ios-scroller">
      {/* Clean Header */}
      <div className="pt-safe px-4 md:px-8 pb-2 md:py-4 sticky top-0 z-30 bg-[#F2F2F7]/95 dark:bg-[#000000]/95 backdrop-blur-xl border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              {subtitle}
            </p>
            <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onSelectDate(todayKey);
                }}
                className="px-3 py-1.5 text-[13px] font-semibold text-[#007AFF] bg-white/90 dark:bg-[#1C1C1E]/90 hover:bg-white dark:hover:bg-[#2C2C2E] rounded-[10px] border border-[rgba(60,60,67,0.1)] shadow-xs transition-colors cursor-pointer"
              >
                Today
              </button>
            )}
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenAddModal();
              }}
              aria-label="Add Habit"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.8px]" />
            </button>
            {onOpenProfile && (
              <div className="md:hidden">
                <CupertinoAvatar
                  settings={settings}
                  size="sm"
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenProfile();
                  }}
                  className="cursor-pointer active:scale-95 shadow-xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Calendar Strip */}
        <div className="md:px-4">
          <CupertinoCalendarStrip
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
            habits={habits}
            logs={logs}
          />
        </div>

        {/* PWA Prompt / Offline support */}
        <PWAInstallSheet />

        {/* Today's Summary Card */}
        {activeHabits.length > 0 && (
          <div className="mx-4 md:mx-8 mb-4 md:mb-6 p-4 md:p-5 bg-white dark:bg-[#1C1C1E] rounded-[18px] md:rounded-[20px] ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-5">
              <CupertinoProgressRing
                progress={completionRatio}
                size={68}
                strokeWidth={7}
                color={completionRatio >= 1 ? '#34C759' : '#007AFF'}
              >
                <span className="text-[14px] md:text-[15px] font-bold text-black dark:text-white tabular-nums">
                  {completionPercent}%
                </span>
              </CupertinoProgressRing>

              <div>
                <h2 className="text-[16px] md:text-[18px] font-bold text-black dark:text-white tracking-tight">
                  {completionRatio >= 1
                    ? 'All Habits Completed! 🎉'
                    : `${completedCount} of ${activeHabits.length} Done`}
                </h2>
                <p className="text-[13px] md:text-[14px] text-[#8E8E93] mt-0.5">
                  {completionRatio >= 1
                    ? 'Incredible consistency today. Keep the streak alive!'
                    : `${activeHabits.length - completedCount} remaining for today`}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 dark:bg-[#FF9500]/20 rounded-[12px] text-[#FF9500]">
              <Flame className="w-4 h-4 fill-[#FF9500]" />
              <span className="text-[13px] md:text-[14px] font-bold">Streak</span>
            </div>
          </div>
        )}

        {/* Habits Grouped by Time of Day */}
        {activeHabits.length === 0 ? (
          <div className="mx-4 md:mx-8 my-8 p-8 md:p-12 text-center bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-[rgba(60,60,67,0.08)] max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold text-black dark:text-white">No Habits Scheduled</h3>
            <p className="text-[14px] text-[#8E8E93] mt-1.5 max-w-sm mx-auto">
              You don't have any habits scheduled for this date. Create one or select another day!
            </p>
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenAddModal();
              }}
              className="mt-5 px-6 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-[15px] font-semibold rounded-[14px] active:scale-95 transition-transform cursor-pointer shadow-xs"
            >
              Create Habit
            </button>
          </div>
        ) : (
          <div className="space-y-6 px-4 md:px-8 pb-6">
            {timeSections.map((sec) => {
              const sectionHabits = activeHabits.filter((h) => h.timeOfDay === sec.key);
              if (sectionHabits.length === 0) return null;

              return (
                <div key={sec.key} className="space-y-2.5">
                  <div className="flex items-center gap-1.5 px-1 pt-1">
                    <span className="text-[14px]">{sec.emoji}</span>
                    <h3 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                      {sec.label}
                    </h3>
                  </div>

                  {/* Responsive grid: 1 col on mobile, 2 cols on desktop/laptop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sectionHabits.map((habit) => {
                      const streakInfo = calculateHabitStreak(
                        habit.id,
                        logs,
                        habit.targetType,
                        habit.targetValue
                      );

                      return (
                        <CupertinoHabitCard
                          key={habit.id}
                          habit={habit}
                          value={dayLogs[habit.id]}
                          streak={streakInfo.currentStreak}
                          soundEnabled={settings.sound}
                          hapticsEnabled={settings.haptics}
                          confettiEnabled={settings.confetti}
                          onUpdateValue={(val) => onUpdateValue(habit.id, val)}
                          onEdit={onEditHabit}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

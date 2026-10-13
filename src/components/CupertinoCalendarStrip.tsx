import React from 'react';
import { getCalendarDays, toDateKey } from '../utils/date';
import { Habit, HabitLogsState } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface CupertinoCalendarStripProps {
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
  habits: Habit[];
  logs: HabitLogsState;
}

export const CupertinoCalendarStrip: React.FC<CupertinoCalendarStripProps> = ({
  selectedDateKey,
  onSelectDate,
  habits,
  logs,
}) => {
  // Let's generate 7 days centered on the selected date or current week
  const todayKey = toDateKey(new Date());
  const centerDate = new Date();
  const days = getCalendarDays(centerDate, 7);

  // Helper to get completion ratio for a specific dateKey
  const getDayCompletion = (dateKey: string) => {
    const activeHabits = habits.filter((h) => !h.archived);
    if (activeHabits.length === 0) return 0;
    const dayLog = logs[dateKey] || {};
    let completed = 0;
    for (const h of activeHabits) {
      const val = dayLog[h.id];
      if (h.targetType === 'boolean' && val) completed++;
      else if (h.targetType === 'numeric' && typeof val === 'number' && val >= (h.targetValue || 1)) completed++;
    }
    return completed / activeHabits.length;
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-[#1C1C1E] p-1.5 rounded-[18px] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
        {days.map((day) => {
          const isSelected = day.key === selectedDateKey;
          const ratio = getDayCompletion(day.key);
          const isFull = ratio >= 1;

          return (
            <button
              key={day.key}
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(day.key);
              }}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-[14px] transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-sm font-semibold'
                  : 'text-[#8E8E93] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className={`text-[11px] font-medium uppercase ${isSelected ? 'text-white/90' : 'text-[#8E8E93]'}`}>
                {day.dayName}
              </span>
              <span className={`text-base tracking-tight my-0.5 ${isSelected ? 'font-bold text-white' : day.isToday ? 'font-bold text-[#007AFF]' : 'font-medium text-black dark:text-white'}`}>
                {day.dayNumber}
              </span>

              {/* Mini Status Dot / Ring */}
              <div className="h-2 w-2 mt-0.5 flex items-center justify-center">
                {isFull ? (
                  <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#34C759]'}`} />
                ) : ratio > 0 ? (
                  <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-[#007AFF]'}`} />
                ) : (
                  <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-transparent'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

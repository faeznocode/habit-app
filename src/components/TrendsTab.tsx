import React from 'react';
import { Habit, HabitLogsState } from '../types';
import { toDateKey, calculateHabitStreak, parseDateKey } from '../utils/date';
import { getHabitIcon } from '../utils/icons';
import { Flame, Trophy, CheckCircle2, TrendingUp } from 'lucide-react';

interface TrendsTabProps {
  habits: Habit[];
  logs: HabitLogsState;
}

export const TrendsTab: React.FC<TrendsTabProps> = ({ habits, logs }) => {
  const activeHabits = habits.filter((h) => !h.archived);

  // Compute 7-day completion rates
  const today = new Date();
  const weekDaysData: { dayName: string; dateKey: string; percent: number; count: number; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    const dayLog = logs[key] || {};

    let done = 0;
    activeHabits.forEach((h) => {
      const v = dayLog[h.id];
      if (h.targetType === 'boolean' && v) done++;
      else if (h.targetType === 'numeric' && typeof v === 'number' && v >= (h.targetValue || 1)) done++;
    });

    const percent = activeHabits.length > 0 ? Math.round((done / activeHabits.length) * 100) : 0;
    weekDaysData.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dateKey: key,
      percent,
      count: done,
      total: activeHabits.length,
    });
  }

  // Aggregate stats across all habits
  let maxBestStreak = 0;
  let activeStreakCount = 0;
  let totalCompletions = 0;
  let consistencySum = 0;

  const habitStats = activeHabits.map((h) => {
    const stat = calculateHabitStreak(h.id, logs, h.targetType, h.targetValue);
    if (stat.bestStreak > maxBestStreak) maxBestStreak = stat.bestStreak;
    if (stat.currentStreak > 0) activeStreakCount++;
    consistencySum += stat.completionRate;
    return { habit: h, ...stat };
  });

  // Count total completions in all logs
  Object.values(logs).forEach((dayLog) => {
    Object.entries(dayLog).forEach(([hId, val]) => {
      const found = habits.find((h) => h.id === hId);
      if (found) {
        if (found.targetType === 'boolean' && val) totalCompletions++;
        else if (found.targetType === 'numeric' && typeof val === 'number' && val >= (found.targetValue || 1)) {
          totalCompletions++;
        }
      }
    });
  });

  const avgConsistency = activeHabits.length > 0 ? Math.round(consistencySum / activeHabits.length) : 0;

  // 28-day Activity Dot Matrix (4 weeks)
  const past28Days: { key: string; ratio: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    const dayLog = logs[key] || {};
    let done = 0;
    activeHabits.forEach((h) => {
      const v = dayLog[h.id];
      if (h.targetType === 'boolean' && v) done++;
      else if (h.targetType === 'numeric' && typeof v === 'number' && v >= (h.targetValue || 1)) done++;
    });
    const ratio = activeHabits.length > 0 ? done / activeHabits.length : 0;
    past28Days.push({ key, ratio });
  }

  return (
    <div className="flex-1 pb-safe-nav md:pb-12 overflow-y-auto ios-scroller">
      {/* Header */}
      <div className="pt-safe px-4 md:px-8 pb-2 md:py-4 sticky top-0 z-30 bg-[#F2F2F7]/95 dark:bg-[#000000]/95 backdrop-blur-xl border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
            Analytics &amp; Streaks
          </p>
          <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
            Trends
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-3 md:py-6 space-y-4 md:space-y-6">
        {/* Metric Grid (2x2 on mobile, 4-col row on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] md:rounded-[18px] p-3.5 md:p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)]">
            <div className="flex items-center gap-2 text-[#007AFF] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[12px] font-semibold uppercase text-[#8E8E93]">Consistency</span>
            </div>
            <p className="text-[28px] md:text-[32px] font-extrabold text-black dark:text-white tracking-tight tabular-nums">
              {avgConsistency}%
            </p>
            <p className="text-[11px] md:text-[12px] text-[#8E8E93] mt-0.5">30-day average</p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] md:rounded-[18px] p-3.5 md:p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)]">
            <div className="flex items-center gap-2 text-[#FF9500] mb-1">
              <Flame className="w-4 h-4 fill-[#FF9500]" />
              <span className="text-[12px] font-semibold uppercase text-[#8E8E93]">Best Streak</span>
            </div>
            <p className="text-[28px] md:text-[32px] font-extrabold text-black dark:text-white tracking-tight tabular-nums">
              {maxBestStreak} <span className="text-[14px] md:text-[15px] font-semibold text-[#8E8E93]">days</span>
            </p>
            <p className="text-[11px] md:text-[12px] text-[#8E8E93] mt-0.5">Personal record</p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] md:rounded-[18px] p-3.5 md:p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)]">
            <div className="flex items-center gap-2 text-[#34C759] mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[12px] font-semibold uppercase text-[#8E8E93]">Completions</span>
            </div>
            <p className="text-[28px] md:text-[32px] font-extrabold text-black dark:text-white tracking-tight tabular-nums">
              {totalCompletions}
            </p>
            <p className="text-[11px] md:text-[12px] text-[#8E8E93] mt-0.5">Total checked off</p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] md:rounded-[18px] p-3.5 md:p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)]">
            <div className="flex items-center gap-2 text-[#AF52DE] mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[12px] font-semibold uppercase text-[#8E8E93]">Active</span>
            </div>
            <p className="text-[28px] md:text-[32px] font-extrabold text-black dark:text-white tracking-tight tabular-nums">
              {activeStreakCount} <span className="text-[14px] md:text-[15px] font-semibold text-[#8E8E93]">habits</span>
            </p>
            <p className="text-[11px] md:text-[12px] text-[#8E8E93] mt-0.5">Currently on streak</p>
          </div>
        </div>

        {/* Desktop Split Layout (Stacked on mobile, side-by-side on lg screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
          {/* Left Column: Charts */}
          <div className="space-y-4 md:space-y-6">
            {/* 7-Day Bar Chart */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] p-4 md:p-5 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] md:text-[16px] font-semibold text-black dark:text-white">Past 7 Days Activity</h3>
                <span className="text-[12px] font-medium text-[#8E8E93]">Daily completion</span>
              </div>

              <div className="flex items-end justify-between gap-2 h-36 pt-2 pb-1">
                {weekDaysData.map((d, idx) => {
                  const isToday = idx === weekDaysData.length - 1;
                  const barHeight = Math.max(8, (d.percent / 100) * 100);

                  return (
                    <div key={d.dateKey} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] md:text-[11px] text-[#8E8E93] font-medium tabular-nums">
                        {d.percent}%
                      </span>
                      <div className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full h-[100px] flex items-end p-0.5">
                        <div
                          className={`w-full rounded-full transition-all duration-500 ease-out ${
                            isToday
                              ? 'bg-[#007AFF]'
                              : d.percent >= 80
                              ? 'bg-[#34C759]'
                              : d.percent >= 40
                              ? 'bg-[#007AFF]'
                              : 'bg-[#FF9500]'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                      </div>
                      <span className={`text-[12px] md:text-[13px] ${isToday ? 'font-bold text-[#007AFF]' : 'text-[#8E8E93] font-medium'}`}>
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 28-Day Heatmap Grid */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] p-4 md:p-5 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] md:text-[16px] font-semibold text-black dark:text-white">Consistency Matrix</h3>
                <span className="text-[12px] text-[#8E8E93]">Past 4 weeks</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 md:gap-2 pt-1">
                {past28Days.map((item) => {
                  let bg = 'bg-[#E5E5EA] dark:bg-[#2C2C2E]';
                  if (item.ratio >= 0.8) bg = 'bg-[#34C759]';
                  else if (item.ratio >= 0.5) bg = 'bg-[#007AFF]';
                  else if (item.ratio > 0) bg = 'bg-[#30B0C7]/60';

                  const dateObj = parseDateKey(item.key);
                  const dayStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={item.key}
                      title={`${dayStr}: ${Math.round(item.ratio * 100)}%`}
                      className={`h-7 md:h-8 rounded-[8px] flex items-center justify-center text-[10px] md:text-[11px] font-semibold text-white transition-transform hover:scale-105 ${bg}`}
                    >
                      {dateObj.getDate()}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-3 pt-1 text-[11px] text-[#8E8E93]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[4px] bg-[#E5E5EA] dark:bg-[#2C2C2E]" /> 0%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[4px] bg-[#30B0C7]/60" /> 1-49%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[4px] bg-[#007AFF]" /> 50-79%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[4px] bg-[#34C759]" /> 80%+
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Individual Habit Streaks & Win Rates */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] p-4 md:p-5 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] md:text-[16px] font-semibold text-black dark:text-white">Habit Performance</h3>
              <span className="text-[12px] text-[#8E8E93]">{activeHabits.length} habits tracked</span>
            </div>

            <div className="space-y-3.5 divide-y divide-[rgba(60,60,67,0.08)] dark:divide-[rgba(84,84,88,0.25)]">
              {habitStats.map(({ habit, currentStreak, bestStreak, completionRate }) => {
                const IconComp = getHabitIcon(habit.icon);

                return (
                  <div key={habit.id} className="pt-3.5 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 text-white shadow-xs"
                          style={{ backgroundColor: habit.color }}
                        >
                          <IconComp className="w-4 h-4 stroke-[2.2px]" />
                        </div>
                        <span className="text-[14px] md:text-[15px] font-semibold text-black dark:text-white truncate">
                          {habit.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-[#FF9500]" />
                          {currentStreak}d
                        </span>
                        <span className="text-[13px] font-bold text-black dark:text-white tabular-nums">
                          {completionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${completionRate}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] md:text-[12px] text-[#8E8E93]">
                      <span>Best streak: {bestStreak} days</span>
                      <span>Target: {habit.frequency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

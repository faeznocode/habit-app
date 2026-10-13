export function toDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatIOSDateHeader(dateKey: string): { subtitle: string; title: string } {
  const date = parseDateKey(dateKey);
  const todayKey = toDateKey(new Date());

  const daysDiff = Math.round((parseDateKey(todayKey).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  const optionsSubtitle: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  const subtitle = date.toLocaleDateString('en-US', optionsSubtitle).toUpperCase();

  let title = 'Today';
  if (daysDiff === 1) title = 'Yesterday';
  else if (daysDiff === -1) title = 'Tomorrow';
  else if (daysDiff !== 0) {
    title = date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return { subtitle, title };
}

export interface DayInfo {
  key: string;
  date: Date;
  dayName: string; // 'M', 'T', 'W', etc.
  dayNumber: number; // 23
  isToday: boolean;
  isFuture: boolean;
}

export function getCalendarDays(centerDate: Date, count: number = 7): DayInfo[] {
  const todayKey = toDateKey(new Date());
  const days: DayInfo[] = [];

  // We want current week or count days centered
  // Let's create an offset of -3 to +3 around centerDate or Mon-Sun
  const startOffset = -Math.floor(count / 2);

  for (let i = 0; i < count; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + (startOffset + i));
    const key = toDateKey(d);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    days.push({
      key,
      date: d,
      dayName,
      dayNumber: d.getDate(),
      isToday: key === todayKey,
      isFuture: d.getTime() > new Date().setHours(23, 59, 59, 999),
    });
  }

  return days;
}

export function isHabitScheduledForDate(frequency: 'daily' | 'weekdays' | 'weekends', date: Date): boolean {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (frequency === 'daily') return true;
  if (frequency === 'weekdays') return day >= 1 && day <= 5;
  if (frequency === 'weekends') return day === 0 || day === 6;
  return true;
}

// Calculate streaks for a habit
export function calculateHabitStreak(
  habitId: string,
  logs: Record<string, Record<string, number | boolean>>,
  habitTargetType: 'boolean' | 'numeric',
  targetValue: number = 1
): { currentStreak: number; bestStreak: number; completionRate: number } {
  const today = new Date();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let totalScheduled = 0;
  let totalCompleted = 0;

  // Inspect past 60 days
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = toDateKey(d);

    const dayVal = logs[dateKey]?.[habitId];
    let isCompleted = false;
    if (habitTargetType === 'boolean') {
      isCompleted = Boolean(dayVal);
    } else {
      isCompleted = typeof dayVal === 'number' && dayVal >= targetValue;
    }

    totalScheduled++;
    if (isCompleted) {
      totalCompleted++;
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      // If today is not yet completed, don't break current streak if yesterday was completed
      if (i === 0) {
        // Today not completed yet, keep checking past days for current streak
        continue;
      } else {
        tempStreak = 0;
      }
    }
  }

  // Calculate current streak accurately from today/yesterday backwards
  currentStreak = 0;
  let checkDate = new Date();
  let todayKey = toDateKey(checkDate);
  let todayVal = logs[todayKey]?.[habitId];
  let todayDone = habitTargetType === 'boolean' ? Boolean(todayVal) : typeof todayVal === 'number' && todayVal >= targetValue;

  if (todayDone) {
    currentStreak++;
  }

  // Check backwards from yesterday
  for (let i = 1; i < 60; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    const val = logs[key]?.[habitId];
    const isDone = habitTargetType === 'boolean' ? Boolean(val) : typeof val === 'number' && val >= targetValue;

    if (isDone) {
      currentStreak++;
    } else {
      break;
    }
  }

  const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak), completionRate };
}

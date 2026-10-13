export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mind'
  | 'productivity'
  | 'lifestyle'
  | 'learning'
  | 'finance'
  | (string & {});

export interface CategoryInfo {
  id: string;
  label: string;
  emoji: string;
  color: string;
  defaultIcon: string;
  isCustom?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'health', label: 'Health', emoji: '🍎', color: '#34C759', defaultIcon: 'water' },
  { id: 'fitness', label: 'Fitness', emoji: '⚡', color: '#FF9500', defaultIcon: 'run' },
  { id: 'mind', label: 'Mind', emoji: '🧘', color: '#AF52DE', defaultIcon: 'meditate' },
  { id: 'productivity', label: 'Productivity', emoji: '🎯', color: '#007AFF', defaultIcon: 'target' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '✨', color: '#5856D6', defaultIcon: 'moon' },
  { id: 'learning', label: 'Learning', emoji: '📚', color: '#30B0C7', defaultIcon: 'book' },
  { id: 'finance', label: 'Finance', emoji: '💰', color: '#FFCC00', defaultIcon: 'zap' },
];

export const CATEGORIES: CategoryInfo[] = DEFAULT_CATEGORIES;

export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening';

export type TargetType = 'boolean' | 'numeric';

export interface Habit {
  id: string;
  title: string;
  cue?: string;
  category: HabitCategory;
  color: string;
  icon: string;
  timeOfDay: TimeOfDay;
  frequency: 'daily' | 'weekdays' | 'weekends';
  targetType: TargetType;
  targetValue?: number;
  unit?: string;
  createdAt: string;
  archived?: boolean;
}

export interface DayHabitLogs {
  [habitId: string]: number | boolean;
}

export interface HabitLogsState {
  [dateKey: string]: DayHabitLogs; // YYYY-MM-DD
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  haptics: boolean;
  sound: boolean;
  confetti: boolean;
  name: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  bio?: string;
}

export type ActiveTab = 'today' | 'habits' | 'trends' | 'settings';

import { Habit, HabitLogsState, UserSettings } from '../types';
import { toDateKey } from './date';

const HABITS_STORAGE_KEY = 'ios_habits_tracker_habits_v1';
const LOGS_STORAGE_KEY = 'ios_habits_tracker_logs_v1';
const SETTINGS_STORAGE_KEY = 'ios_habits_tracker_settings_v1';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-water',
    title: 'Hydrate 2,000 ml',
    cue: 'Drink water first thing and with meals',
    category: 'health',
    color: '#007AFF', // System Blue
    icon: 'water',
    timeOfDay: 'anytime',
    frequency: 'daily',
    targetType: 'numeric',
    targetValue: 2000,
    unit: 'ml',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-meditate',
    title: 'Morning Mindfulness',
    cue: '10 minutes breathwork before phone screen',
    category: 'mind',
    color: '#AF52DE', // System Purple
    icon: 'meditate',
    timeOfDay: 'morning',
    frequency: 'daily',
    targetType: 'numeric',
    targetValue: 10,
    unit: 'min',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-workout',
    title: 'Daily Workout or Walk',
    cue: 'Strength session or 30-min brisk walk',
    category: 'fitness',
    color: '#FF9500', // System Orange
    icon: 'run',
    timeOfDay: 'afternoon',
    frequency: 'daily',
    targetType: 'boolean',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-reading',
    title: 'Read 20 Pages',
    cue: 'Evening reading before unwinding',
    category: 'productivity',
    color: '#30B0C7', // System Teal
    icon: 'book',
    timeOfDay: 'evening',
    frequency: 'daily',
    targetType: 'numeric',
    targetValue: 20,
    unit: 'pages',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-sleep',
    title: 'Screen Off by 11 PM',
    cue: 'Leave phone on nightstand away from bed',
    category: 'lifestyle',
    color: '#5856D6', // System Indigo
    icon: 'moon',
    timeOfDay: 'evening',
    frequency: 'daily',
    targetType: 'boolean',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  haptics: true,
  sound: true,
  confetti: true,
  name: 'Faez',
};

// Generate rich mock history for the past 14 days so the app is instantly rewarding to explore
function generateInitialLogs(): HabitLogsState {
  const logs: HabitLogsState = {};
  const today = new Date();

  for (let i = 0; i <= 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);

    logs[key] = {
      'habit-water': i === 0 ? 1500 : i % 4 === 0 ? 1250 : 2000,
      'habit-meditate': i === 0 ? 10 : i % 5 === 0 ? 0 : 10,
      'habit-workout': i === 0 ? true : i % 3 !== 0,
      'habit-reading': i === 0 ? 12 : i % 4 !== 0 ? 20 : 10,
      'habit-sleep': i === 0 ? false : i % 2 === 0,
    };
  }

  return logs;
}

export function loadHabits(): Habit[] {
  try {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading habits:', e);
  }
  return DEFAULT_HABITS;
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits:', e);
  }
}

export function loadLogs(): HabitLogsState {
  try {
    const stored = localStorage.getItem(LOGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading logs:', e);
  }
  const initial = generateInitialLogs();
  saveLogs(initial);
  return initial;
}

export function saveLogs(logs: HabitLogsState): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs:', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

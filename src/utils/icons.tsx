import React from 'react';
import {
  Droplets,
  Sparkles,
  Footprints,
  BookOpen,
  Moon,
  Dumbbell,
  Code2,
  Apple,
  Coffee,
  BedDouble,
  Bike,
  Sun,
  Heart,
  PenLine,
  Smile,
  Clock,
  CheckCircle2,
  Flame,
  Target,
  Zap,
} from 'lucide-react';

export const HABIT_ICONS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  water: { label: 'Water', icon: Droplets },
  meditate: { label: 'Mind', icon: Sparkles },
  run: { label: 'Fitness', icon: Footprints },
  dumbbell: { label: 'Workout', icon: Dumbbell },
  book: { label: 'Reading', icon: BookOpen },
  moon: { label: 'Sleep', icon: Moon },
  bed: { label: 'Rest', icon: BedDouble },
  sun: { label: 'Morning', icon: Sun },
  apple: { label: 'Nutrition', icon: Apple },
  coffee: { label: 'Habit', icon: Coffee },
  bike: { label: 'Cycling', icon: Bike },
  code: { label: 'Coding', icon: Code2 },
  heart: { label: 'Health', icon: Heart },
  pencil: { label: 'Journal', icon: PenLine },
  smile: { label: 'Mood', icon: Smile },
  target: { label: 'Goal', icon: Target },
  flame: { label: 'Streak', icon: Flame },
  zap: { label: 'Energy', icon: Zap },
  clock: { label: 'Routine', icon: Clock },
};

export const IOS_SYSTEM_COLORS = [
  { name: 'Blue', hex: '#007AFF', bg: 'bg-[#007AFF]', text: 'text-[#007AFF]' },
  { name: 'Green', hex: '#34C759', bg: 'bg-[#34C759]', text: 'text-[#34C759]' },
  { name: 'Orange', hex: '#FF9500', bg: 'bg-[#FF9500]', text: 'text-[#FF9500]' },
  { name: 'Red', hex: '#FF3B30', bg: 'bg-[#FF3B30]', text: 'text-[#FF3B30]' },
  { name: 'Purple', hex: '#AF52DE', bg: 'bg-[#AF52DE]', text: 'text-[#AF52DE]' },
  { name: 'Pink', hex: '#FF2D55', bg: 'bg-[#FF2D55]', text: 'text-[#FF2D55]' },
  { name: 'Teal', hex: '#30B0C7', bg: 'bg-[#30B0C7]', text: 'text-[#30B0C7]' },
  { name: 'Indigo', hex: '#5856D6', bg: 'bg-[#5856D6]', text: 'text-[#5856D6]' },
  { name: 'Yellow', hex: '#FFCC00', bg: 'bg-[#FFCC00]', text: 'text-[#FFCC00]' },
];

export function getHabitIcon(iconKey: string): React.ComponentType<{ className?: string }> {
  return HABIT_ICONS[iconKey]?.icon || CheckCircle2;
}

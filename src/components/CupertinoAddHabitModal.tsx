import React, { useState, useEffect } from 'react';
import { Habit, HabitCategory, TargetType, TimeOfDay } from '../types';
import { loadCategories, subscribeCategories } from '../utils/categories';
import { HABIT_ICONS, IOS_SYSTEM_COLORS } from '../utils/icons';
import { X, Trash2, Sparkles, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CupertinoAddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  editingHabit?: Habit | null;
}

const TEMPLATES: Partial<Habit>[] = [
  { title: 'Drink 2L Water', icon: 'water', category: 'health', color: '#007AFF', targetType: 'numeric', targetValue: 2000, unit: 'ml', timeOfDay: 'anytime' },
  { title: '10-Min Meditation', icon: 'meditate', category: 'mind', color: '#AF52DE', targetType: 'numeric', targetValue: 10, unit: 'min', timeOfDay: 'morning' },
  { title: 'Gym / 30m Workout', icon: 'dumbbell', category: 'fitness', color: '#FF9500', targetType: 'boolean', timeOfDay: 'afternoon' },
  { title: 'Read 20 Pages', icon: 'book', category: 'learning', color: '#30B0C7', targetType: 'numeric', targetValue: 20, unit: 'pages', timeOfDay: 'evening' },
  { title: 'Track Expenses', icon: 'zap', category: 'finance', color: '#FFCC00', targetType: 'boolean', timeOfDay: 'evening' },
  { title: 'Walk 8,000 Steps', icon: 'run', category: 'fitness', color: '#34C759', targetType: 'numeric', targetValue: 8000, unit: 'steps', timeOfDay: 'anytime' },
  { title: 'No Screens Before Sleep', icon: 'moon', category: 'lifestyle', color: '#5856D6', targetType: 'boolean', timeOfDay: 'evening' },
];

export const CupertinoAddHabitModal: React.FC<CupertinoAddHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingHabit,
}) => {
  const isEditing = Boolean(editingHabit && editingHabit.id);
  const [categoriesList, setCategoriesList] = useState(() => loadCategories());

  useEffect(() => {
    const unsubscribe = subscribeCategories((cats) => {
      setCategoriesList(cats);
    });

    return () => unsubscribe();
  }, []);
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [color, setColor] = useState('#007AFF');
  const [icon, setIcon] = useState('water');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');
  const [targetType, setTargetType] = useState<TargetType>('boolean');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [unit, setUnit] = useState<string>('min');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setCue(editingHabit.cue || '');
      setCategory(editingHabit.category || 'health');
      setColor(editingHabit.color);
      setIcon(editingHabit.icon);
      setTimeOfDay(editingHabit.timeOfDay);
      setFrequency(editingHabit.frequency);
      setTargetType(editingHabit.targetType);
      setTargetValue(editingHabit.targetValue || 1);
      setUnit(editingHabit.unit || '');
    } else {
      // Default new habit
      setTitle('');
      setCue('');
      setCategory('health');
      setColor('#007AFF');
      setIcon('water');
      setTimeOfDay('anytime');
      setFrequency('daily');
      setTargetType('boolean');
      setTargetValue(1);
      setUnit('');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: Partial<Habit>) => {
    triggerHaptic('light');
    if (tpl.title) setTitle(tpl.title);
    if (tpl.category) setCategory(tpl.category);
    if (tpl.color) setColor(tpl.color);
    if (tpl.icon) setIcon(tpl.icon);
    if (tpl.targetType) setTargetType(tpl.targetType);
    if (tpl.targetValue !== undefined) setTargetValue(tpl.targetValue);
    if (tpl.unit !== undefined) setUnit(tpl.unit);
    if (tpl.timeOfDay) setTimeOfDay(tpl.timeOfDay);
  };

  const handleCategorySelect = (catId: HabitCategory) => {
    triggerHaptic('light');
    setCategory(catId);

    // If adding a new habit and current color is default blue, adopt category's signature color
    if (!editingHabit) {
      const match = categoriesList.find((c) => c.id === catId);
      if (match) {
        setColor(match.color);
        if (match.defaultIcon && HABIT_ICONS[match.defaultIcon]) {
          setIcon(match.defaultIcon);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic('medium');
    const habitData: Habit = {
      id: isEditing && editingHabit?.id ? editingHabit.id : `habit-${Date.now()}`,
      title: title.trim(),
      cue: cue.trim() || undefined,
      category,
      color,
      icon,
      timeOfDay,
      frequency,
      targetType,
      targetValue: targetType === 'numeric' ? Number(targetValue) || 1 : undefined,
      unit: targetType === 'numeric' ? unit.trim() : undefined,
      createdAt: isEditing && editingHabit?.createdAt ? editingHabit.createdAt : new Date().toISOString(),
    };

    onSave(habitData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-[#F2F2F7] dark:bg-[#000000] rounded-t-[24px] sm:rounded-[24px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)]"
      >
        {/* Grabber for iOS Sheet */}
        <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#C7C7CC] dark:bg-[#48484A] rounded-full" />
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="text-[17px] text-[#007AFF] hover:opacity-75 active:opacity-50 transition-opacity font-normal"
          >
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-black dark:text-white">
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="text-[17px] font-semibold text-[#007AFF] hover:opacity-75 active:opacity-50 disabled:opacity-35 transition-opacity"
          >
            {isEditing ? 'Done' : 'Add'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-5 ios-scroller">
          {/* Quick Presets (Only if creating new) */}
          {!isEditing && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9500]" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                  Quick Starters
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="shrink-0 px-3 py-1.5 rounded-[12px] bg-white dark:bg-[#1C1C1E] text-[13px] font-medium text-black dark:text-white border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.3)] shadow-xs active:scale-95 transition-transform"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inset Grouped Section: Basic Info */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
            <div className="p-3.5 flex items-center border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.3)]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Habit Title (e.g., Drink Water)"
                className="w-full text-[17px] bg-transparent outline-none text-black dark:text-white placeholder-[#C7C7CC] dark:placeholder-[#636366]"
                required
                autoFocus={!editingHabit}
              />
              {title && (
                <button
                  type="button"
                  onClick={() => setTitle('')}
                  className="p-1 text-[#8E8E93] hover:text-black dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-3.5 flex items-center">
              <input
                type="text"
                value={cue}
                onChange={(e) => setCue(e.target.value)}
                placeholder="Motivation / Cue (e.g., Right after waking up)"
                className="w-full text-[15px] bg-transparent outline-none text-black dark:text-white placeholder-[#C7C7CC] dark:placeholder-[#636366]"
              />
            </div>
          </div>

          {/* Cupertino Category Picker Section */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Category
              </label>
              <span className="text-[12px] font-medium text-[#007AFF] capitalize">
                {categoriesList.find((c) => c.id === category)?.emoji} {category}
              </span>
            </div>

            {/* Visual Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoriesList.map((cat) => {
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-[12px] text-left transition-all duration-150 active:scale-95 ${isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]'
                      }`}
                  >
                    <span className="text-base shrink-0">{cat.emoji}</span>
                    <span className="text-[13px] truncate flex-1">{cat.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inset Grouped Section: Color & Icon */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs space-y-4">
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-2">
                System Color
              </label>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
                {IOS_SYSTEM_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setColor(c.hex);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform shrink-0 ${color === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-[#007AFF] dark:ring-offset-black' : 'hover:scale-105'
                      }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-2">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
                {Object.entries(HABIT_ICONS).map(([key, item]) => {
                  const IconComp = item.icon;
                  const isSelected = icon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setIcon(key);
                      }}
                      className={`p-2.5 rounded-[12px] flex items-center justify-center transition-all ${isSelected
                          ? 'bg-[#007AFF] text-white shadow-xs'
                          : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2px]" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inset Grouped Section: Goal Type */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] p-3.5 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[16px] text-black dark:text-white font-medium">Tracking Type</span>
              {/* iOS Segmented Control */}
              <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-[9px]">
                <button
                  type="button"
                  onClick={() => setTargetType('boolean')}
                  className={`px-3 py-1 text-[13px] font-medium rounded-[7px] transition-all ${targetType === 'boolean'
                      ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs'
                      : 'text-[#8E8E93]'
                    }`}
                >
                  Yes / No
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('numeric')}
                  className={`px-3 py-1 text-[13px] font-medium rounded-[7px] transition-all ${targetType === 'numeric'
                      ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-xs'
                      : 'text-[#8E8E93]'
                    }`}
                >
                  Target Goal
                </button>
              </div>
            </div>

            {targetType === 'numeric' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.3)]">
                <div>
                  <label className="text-[12px] text-[#8E8E93] block mb-1">Target Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full p-2 rounded-[10px] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white text-[15px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#8E8E93] block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. ml, min, pages"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 rounded-[10px] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-black dark:text-white text-[15px] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Inset Grouped Section: Schedule */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
            {/* Time of Day */}
            <div className="p-3.5 flex items-center justify-between border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.3)]">
              <span className="text-[16px] text-black dark:text-white font-medium">Time of Day</span>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="bg-transparent text-[15px] text-[#007AFF] font-medium outline-none cursor-pointer text-right"
              >
                <option value="anytime">Anytime</option>
                <option value="morning">Morning 🌅</option>
                <option value="afternoon">Afternoon ☀️</option>
                <option value="evening">Evening 🌙</option>
              </select>
            </div>

            {/* Frequency */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-[16px] text-black dark:text-white font-medium">Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekdays' | 'weekends')}
                className="bg-transparent text-[15px] text-[#007AFF] font-medium outline-none cursor-pointer text-right"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>
          </div>

          {/* Delete Action if editing */}
          {isEditing && editingHabit && onDelete && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('warning');
                onDelete(editingHabit.id);
                onClose();
              }}
              className="w-full py-3.5 bg-white dark:bg-[#1C1C1E] text-[#FF3B30] rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] active:bg-[#FF3B30]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Habit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Habit, HabitCategory } from '../types';
import { loadCategories, subscribeCategories } from '../utils/categories';
import { getHabitIcon } from '../utils/icons';
import { Plus, ChevronRight, Filter, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HabitsTabProps {
  habits: Habit[];
  onOpenAddModal: (defaultCategory?: HabitCategory) => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({
  habits,
  onOpenAddModal,
  onEditHabit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [categoriesList, setCategoriesList] = useState(() => loadCategories());

  useEffect(() => {
    const unsubscribe = subscribeCategories((cats) => {
      setCategoriesList(cats);
    });

    return () => unsubscribe();
  }, []);

  // Filter items
  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Calculate count per category
  const categoryCounts = habits.reduce<Record<string, number>>((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1;
    return acc;
  }, {});

  const currentCategoryInfo = categoriesList.find((c) => c.id === selectedCategory);

  return (
    <div className="flex-1 pb-safe-nav md:pb-12 overflow-y-auto ios-scroller">
      {/* Header */}
      <div className="pt-safe px-4 md:px-8 pb-2 md:py-4 sticky top-0 z-30 bg-[#F2F2F7]/95 dark:bg-[#000000]/95 backdrop-blur-xl border-b border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Routines &amp; Goals
            </p>
            <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
              All Habits
            </h1>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenAddModal(selectedCategory !== 'all' ? selectedCategory : undefined);
            }}
            aria-label="Add Habit"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.8px]" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {/* Category Filter Pills Bar */}
        <div className="px-4 md:px-8 py-3 flex items-center gap-1.5 md:gap-2 overflow-x-auto md:flex-wrap no-scrollbar">
          {/* All Habits Pill */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-[12px] text-[13px] font-medium shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${selectedCategory === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'bg-white dark:bg-[#1C1C1E] text-[#8E8E93] hover:text-black dark:hover:text-white border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)]'
              }`}
          >
            <span>All</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all'
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black font-bold'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93]'
                }`}
            >
              {habits.length}
            </span>
          </button>

          {/* Specific Categories */}
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-[12px] text-[13px] font-medium shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${isSelected
                    ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white hover:border-[#007AFF]/50 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)]'
                  }`}
              >
                <span className="text-[13px]">{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${isSelected
                        ? 'bg-white/25 text-white font-bold'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93]'
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filter Banner if not 'all' */}
        {selectedCategory !== 'all' && currentCategoryInfo && (
          <div className="px-4 md:px-8 pb-3 flex items-center justify-between text-[12px] md:text-[13px] text-[#8E8E93]">
            <span className="flex items-center gap-1 font-medium">
              Filtering by <strong className="text-black dark:text-white capitalize">{currentCategoryInfo.label}</strong> ({filteredHabits.length})
            </span>
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-1 text-[#007AFF] hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Show All
            </button>
          </div>
        )}

        {/* Habits Content Container */}
        <div className="px-4 md:px-8 py-1">
          {filteredHabits.length === 0 ? (
            <div className="py-12 md:py-16 text-center bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 md:p-10 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs max-w-lg mx-auto">
              <Filter className="w-10 h-10 text-[#8E8E93] mx-auto mb-3 opacity-50" />
              <p className="text-[17px] md:text-[19px] font-semibold text-black dark:text-white">
                No {selectedCategory !== 'all' ? currentCategoryInfo?.label : ''} habits
              </p>
              <p className="text-[13px] md:text-[14px] text-[#8E8E93] mt-1.5 max-w-xs mx-auto">
                {selectedCategory !== 'all'
                  ? `You don't have any habits in the ${currentCategoryInfo?.label} category yet.`
                  : 'You have not created any habits yet.'}
              </p>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenAddModal(selectedCategory !== 'all' ? selectedCategory : undefined);
                }}
                className="mt-5 px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-[14px] font-semibold rounded-[12px] active:scale-95 transition-transform cursor-pointer"
              >
                Add {selectedCategory !== 'all' ? currentCategoryInfo?.label : ''} Habit
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View: Classic Cupertino Inset Grouped Table */}
              <div className="md:hidden bg-white dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] ios-card-shadow divide-y divide-[rgba(60,60,67,0.1)] dark:divide-[rgba(84,84,88,0.3)]">
                {filteredHabits.map((habit) => {
                  const IconComp = getHabitIcon(habit.icon);
                  const catMeta = categoriesList.find((c) => c.id === habit.category);

                  return (
                    <div
                      key={habit.id}
                      onClick={() => {
                        triggerHaptic('light');
                        onEditHabit(habit);
                      }}
                      className="p-3.5 flex items-center justify-between gap-3 active:bg-black/5 dark:active:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-xs text-white"
                          style={{ backgroundColor: habit.color }}
                        >
                          <IconComp className="w-5 h-5 text-white stroke-[2.2px]" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold text-black dark:text-white truncate">
                            {habit.title}
                          </p>
                          <div className="flex items-center gap-2 text-[12px] text-[#8E8E93] mt-0.5">
                            <span className="inline-flex items-center gap-0.5 font-medium text-black/70 dark:text-white/70 bg-[#F2F2F7] dark:bg-[#2C2C2E] px-1.5 py-0.2 rounded-[6px]">
                              {catMeta?.emoji} {catMeta?.label || habit.category}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{habit.frequency}</span>
                            <span>•</span>
                            <span className="capitalize">{habit.timeOfDay}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[#8E8E93]">
                        {habit.targetType === 'numeric' && (
                          <span className="text-[13px] font-medium text-black dark:text-white bg-[#F2F2F7] dark:bg-[#2C2C2E] px-2 py-0.5 rounded-[8px]">
                            {habit.targetValue} {habit.unit}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Laptop View: Responsive Grid Cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHabits.map((habit) => {
                  const IconComp = getHabitIcon(habit.icon);
                  const catMeta = categoriesList.find((c) => c.id === habit.category);

                  return (
                    <div
                      key={habit.id}
                      onClick={() => {
                        triggerHaptic('light');
                        onEditHabit(habit);
                      }}
                      className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[18px] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] hover:border-[#007AFF]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: habit.color }}
                          >
                            <IconComp className="w-6 h-6 text-white stroke-[2.2px]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[16px] font-bold text-black dark:text-white truncate">
                              {habit.title}
                            </h3>
                            {habit.cue && (
                              <p className="text-[12px] text-[#8E8E93] truncate mt-0.5">
                                {habit.cue}
                              </p>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#007AFF] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>

                      <div className="pt-2 border-t border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)] flex items-center justify-between text-[12px]">
                        <span className="inline-flex items-center gap-1 font-medium text-[#8E8E93]">
                          <span>{catMeta?.emoji}</span>
                          <span>{catMeta?.label || habit.category}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[#8E8E93] capitalize">
                            {habit.frequency}
                          </span>
                          {habit.targetType === 'numeric' && (
                            <span className="font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-[6px]">
                              {habit.targetValue} {habit.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Tip footer */}
        <div className="px-6 py-5 text-center">
          <p className="text-[12px] md:text-[13px] text-[#8E8E93]">
            Click any habit to adjust frequency, schedule, target value, or delete it.
          </p>
        </div>
      </div>
    </div>
  );
};

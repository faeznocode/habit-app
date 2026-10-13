import React from 'react';
import { Habit } from '../types';
import { getHabitIcon } from '../utils/icons';
import { Check, Plus, Minus, Flame } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CupertinoHabitCardProps {
  habit: Habit;
  value: number | boolean | undefined;
  streak: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  confettiEnabled: boolean;
  onUpdateValue: (val: number | boolean) => void;
  onEdit?: (habit: Habit) => void;
}

export const CupertinoHabitCard: React.FC<CupertinoHabitCardProps> = ({
  habit,
  value,
  streak,
  soundEnabled,
  hapticsEnabled,
  confettiEnabled,
  onUpdateValue,
  onEdit,
}) => {
  const IconComponent = getHabitIcon(habit.icon);
  const isNumeric = habit.targetType === 'numeric';
  const target = habit.targetValue || 1;
  const numValue = typeof value === 'number' ? value : 0;
  const isDone = isNumeric ? numValue >= target : Boolean(value);

  const handleToggleBoolean = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !isDone;
    if (nextVal) {
      if (soundEnabled) sounds.playTick();
      if (hapticsEnabled) triggerHaptic('medium');
      if (confettiEnabled && streak > 0 && streak % 3 === 0) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: [habit.color, '#007AFF', '#34C759', '#FFD60A'],
        });
      }
    } else {
      if (hapticsEnabled) triggerHaptic('light');
    }
    onUpdateValue(nextVal);
  };

  const handleNumericStep = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const step = habit.unit === 'ml' ? 250 : habit.unit === 'min' ? 5 : habit.unit === 'pages' ? 5 : 1;
    const nextVal = Math.max(0, numValue + delta * step);

    if (nextVal >= target && numValue < target) {
      // Just achieved goal!
      if (soundEnabled) sounds.playSuccess();
      if (hapticsEnabled) triggerHaptic('success');
      if (confettiEnabled) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      if (soundEnabled) sounds.playTick();
      if (hapticsEnabled) triggerHaptic('light');
    }

    onUpdateValue(nextVal);
  };

  const progressPercent = isNumeric ? Math.min(100, Math.round((numValue / target) * 100)) : isDone ? 100 : 0;

  return (
    <div
      onClick={() => onEdit?.(habit)}
      className="group relative bg-white dark:bg-[#1C1C1E] rounded-[16px] p-4 ios-card-shadow border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] transition-all duration-150 active:scale-[0.99] touch-manipulation select-none cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* iOS Squircle Icon Container */}
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 shadow-xs transition-transform group-active:scale-95 text-white"
            style={{ backgroundColor: habit.color }}
          >
            <IconComponent className="w-6 h-6 text-white stroke-[2.2px]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`text-[17px] font-semibold tracking-tight truncate ${isDone ? 'text-black/80 dark:text-white/80 line-through decoration-black/30 dark:decoration-white/30' : 'text-black dark:text-white'}`}>
                {habit.title}
              </h3>
              {streak > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 dark:bg-[#FF9500]/20 px-1.5 py-0.5 rounded-full shrink-0">
                  <Flame className="w-3 h-3 fill-[#FF9500]" />
                  {streak}
                </span>
              )}
            </div>

            {/* Cue / Time of day */}
            <div className="flex items-center gap-2 mt-0.5 text-[13px] text-[#8E8E93]">
              {habit.cue ? (
                <span className="truncate">{habit.cue}</span>
              ) : (
                <span className="capitalize">{habit.timeOfDay}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions (Checkbox or Stepper) */}
        <div className="shrink-0 flex items-center">
          {isNumeric ? (
            <div className="flex flex-col items-end gap-1">
              {/* Stepper Control */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[10px] p-0.5 border border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.3)] shadow-xs"
              >
                <button
                  onClick={(e) => handleNumericStep(e, -1)}
                  disabled={numValue <= 0}
                  aria-label="Decrease value"
                  className="w-8 h-7 flex items-center justify-center text-black dark:text-white rounded-[8px] active:bg-black/10 dark:active:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-4 h-4 stroke-[2.5px]" />
                </button>
                <div className="w-[1px] h-4 bg-[rgba(60,60,67,0.15)] dark:bg-[rgba(84,84,88,0.4)] mx-0.5" />
                <button
                  onClick={(e) => handleNumericStep(e, 1)}
                  aria-label="Increase value"
                  className="w-8 h-7 flex items-center justify-center text-black dark:text-white rounded-[8px] active:bg-black/10 dark:active:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              {/* Progress text */}
              <div className="text-[12px] font-medium text-[#8E8E93] tabular-nums">
                <span className={isDone ? 'text-[#34C759] font-semibold' : 'text-black dark:text-white font-semibold'}>
                  {numValue.toLocaleString()}
                </span>
                <span className="text-[11px]"> / {target.toLocaleString()} {habit.unit || ''}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleToggleBoolean}
              aria-label={isDone ? 'Mark habit uncompleted' : 'Mark habit completed'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isDone
                  ? 'shadow-sm text-white'
                  : 'border-2 border-[#C7C7CC] dark:border-[#48484A] bg-transparent hover:border-[#8E8E93]'
              }`}
              style={{
                backgroundColor: isDone ? habit.color : 'transparent',
                borderColor: isDone ? habit.color : undefined,
              }}
            >
              {isDone && <Check className="w-5 h-5 text-white stroke-[3px] animate-in zoom-in-50 duration-150" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar for Numeric Habits */}
      {isNumeric && (
        <div className="mt-3 w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isDone ? '#34C759' : habit.color,
            }}
          />
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Share, PlusSquare, Smartphone, X, Download } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const PWAInstallSheet: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // If already running standalone, hide completely
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {/* Top Banner on Today Screen (unless dismissed) */}
      {!dismissedBanner && (
        <div className="mx-4 mb-3 p-3 bg-gradient-to-r from-[#007AFF]/10 to-[#5856D6]/10 dark:from-[#007AFF]/20 dark:to-[#5856D6]/20 rounded-[16px] border border-[#007AFF]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[11px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-black dark:text-white leading-tight">
                Add to Home Screen
              </p>
              <p className="text-[12px] text-[#8E8E93] leading-snug">
                Experience fullscreen without browser bars
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#007AFF] text-white text-[13px] font-semibold rounded-[10px] active:scale-95 transition-transform flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={() => setDismissedBanner(true)}
              className="p-1.5 text-[#8E8E93] hover:text-black dark:hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Sheet */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-sm bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] animate-in slide-in-from-bottom duration-250">
            <div className="w-10 h-1 bg-[#C7C7CC] dark:bg-[#48484A] rounded-full mx-auto -mt-2 mb-4" />

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-[#007AFF] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-[19px] font-bold text-black dark:text-white tracking-tight">
                Install Habits on iPhone
              </h3>
              <p className="text-[13px] text-[#8E8E93] mt-1">
                Install as a standalone iOS app for quick launch and offline habit tracking.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] rounded-[16px] p-4 space-y-4 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] text-[14px]">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold text-[13px] shrink-0">
                  1
                </div>
                <div className="pt-0.5">
                  <p className="text-black dark:text-white font-medium flex items-center gap-1.5 flex-wrap">
                    Tap the <span className="inline-flex items-center gap-1 text-[#007AFF] font-semibold bg-[#007AFF]/10 px-1.5 py-0.5 rounded-md"><Share className="w-3.5 h-3.5" /> Share</span> icon
                  </p>
                  <p className="text-[12px] text-[#8E8E93]">In your Safari browser bottom toolbar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold text-[13px] shrink-0">
                  2
                </div>
                <div className="pt-0.5">
                  <p className="text-black dark:text-white font-medium flex items-center gap-1.5 flex-wrap">
                    Select <span className="inline-flex items-center gap-1 text-black dark:text-white font-semibold bg-[#F2F2F7] dark:bg-[#1C1C1E] px-1.5 py-0.5 rounded-md"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</span>
                  </p>
                  <p className="text-[12px] text-[#8E8E93]">Scroll down the share sheet menu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold text-[13px] shrink-0">
                  3
                </div>
                <div className="pt-0.5">
                  <p className="text-black dark:text-white font-medium">
                    Tap <span className="font-semibold text-[#007AFF]">Add</span> in the top right
                  </p>
                  <p className="text-[12px] text-[#8E8E93]">The icon will appear on your Home Screen</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-3.5 rounded-[16px] bg-[#007AFF] text-white font-semibold text-[16px] shadow-sm active:opacity-85 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

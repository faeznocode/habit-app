import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { triggerHaptic } from '../utils/haptics';
import { Sparkles, Shield, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';

interface CupertinoSignInScreenProps {
  onSignInSuccess?: () => void;
}

export const CupertinoSignInScreen: React.FC<CupertinoSignInScreenProps> = ({ onSignInSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      triggerHaptic('medium');
      setIsLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
      triggerHaptic('success');
      if (onSignInSuccess) onSignInSuccess();
    } catch (error: any) {
      console.error('🔥 [Auth Error] Google Sign-In failed:', error);
      triggerHaptic('warning');
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in was cancelled. Please try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup was blocked. Please allow popups for this site.');
      } else {
        setErrorMessage(error?.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-center selection:bg-[#007AFF]/20">
      
      {/* ========================================================================= */}
      {/* DESKTOP & LAPTOP VIEW: Proper two-column web layout (md+ screens)        */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-5xl mx-auto items-center justify-between gap-12 lg:gap-16 px-8 lg:px-12 py-12">
        {/* Left Column: Branding, Description, Privacy & Sync info */}
        <div className="flex-1 space-y-8 pr-4">
          <div className="space-y-4">
            {/* App Icon Lockup */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] shadow-xl flex items-center justify-center text-white ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                <Sparkles className="w-8 h-8 drop-shadow-md" />
              </div>
              <div>
                <p className="text-[12px] font-bold tracking-wider text-[#007AFF] uppercase">
                  Daily Routines & Streaks
                </p>
                <h1 className="text-[36px] lg:text-[42px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
                  Habits
                </h1>
              </div>
            </div>

            <h2 className="text-[26px] lg:text-[30px] font-bold tracking-tight text-black dark:text-white leading-snug">
              Build routines that last, one day at a time.
            </h2>
            <p className="text-[16px] text-[#8E8E93] leading-relaxed max-w-lg">
              Designed with Cupertino elegance, mindful daily tracking, streak stats, and private cloud synchronization across all your devices.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3.5 max-w-lg">
            <div className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#007AFF]/20 flex items-center justify-center text-[#007AFF] shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">100% Private to Your Account</h3>
                <p className="text-[13px] text-[#8E8E93] mt-0.5 leading-relaxed">
                  Your habit schedules, targets, and logs are isolated strictly under your user ID with zero cross-user exposure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 dark:bg-[#34C759]/20 flex items-center justify-center text-[#34C759] shrink-0 mt-0.5">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Real-Time Cloud Sync</h3>
                <p className="text-[13px] text-[#8E8E93] mt-0.5 leading-relaxed">
                  Seamlessly track progress from any computer, phone, or tablet with instant Firestore live updates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.25)] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#AF52DE]/10 dark:bg-[#AF52DE]/20 flex items-center justify-center text-[#AF52DE] shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Streaks & Habit Analytics</h3>
                <p className="text-[13px] text-[#8E8E93] mt-0.5 leading-relaxed">
                  Stay motivated with 7-day activity charts, 28-day consistency matrices, and interactive sound & confetti feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Sign-In Card */}
        <div className="w-full max-w-[420px] bg-white dark:bg-[#1C1C1E] rounded-[24px] p-8 lg:p-9 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xl shrink-0 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-[24px] font-bold text-black dark:text-white tracking-tight">
              Get Started
            </h2>
            <p className="text-[14px] text-[#8E8E93]">
              Sign in with your Google account to access your personal habits and streaks.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-[13px] text-center">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-[#2C2C2E] text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.36)] font-semibold text-[15px] shadow-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Connecting with Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)] flex items-center justify-center gap-4 text-[12px] text-[#8E8E93]">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#34C759]" />
              Secure Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#007AFF]" />
              Cloud Firestore
            </span>
          </div>

          <p className="text-[12px] text-[#8E8E93] text-center leading-relaxed">
            By signing in, you sync your private habit tracking data with Cloud Firestore.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEW: Unchanged single-column phone layout (< md screens)          */}
      {/* ========================================================================= */}
      <div className="md:hidden min-h-screen w-full flex flex-col justify-between px-6 pt-safe pb-safe">
        {/* Top spacing */}
        <div className="pt-8 sm:pt-16 flex flex-col items-center text-center">
          {/* App Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22%] bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] shadow-xl flex items-center justify-center text-white mb-6 ring-1 ring-black/5 dark:ring-white/10">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
          </div>

          {/* Title & Subtitle */}
          <p className="text-[13px] font-semibold tracking-wider text-[#007AFF] uppercase mb-1">
            Daily Routines & Streaks
          </p>
          <h1 className="text-[34px] sm:text-[40px] font-extrabold tracking-tight text-black dark:text-white leading-tight">
            Habits
          </h1>
          <p className="mt-3 text-[16px] text-[#8E8E93] max-w-xs sm:max-w-sm leading-relaxed">
            Build lasting routines with mindful daily tracking, streak stats, and private cloud sync.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="my-8 max-w-sm mx-auto w-full space-y-3">
          <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#007AFF]/20 flex items-center justify-center text-[#007AFF] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-[14px] font-semibold text-black dark:text-white">100% Private to You</h3>
              <p className="text-[12px] text-[#8E8E93]">Your habits and history are strictly isolated to your account.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[rgba(60,60,67,0.06)] dark:border-[rgba(84,84,88,0.2)] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 dark:bg-[#34C759]/20 flex items-center justify-center text-[#34C759] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-[14px] font-semibold text-black dark:text-white">Real-Time Cloud Sync</h3>
              <p className="text-[12px] text-[#8E8E93]">Seamlessly track progress across any phone, tablet, or browser.</p>
            </div>
          </div>
        </div>

        {/* Bottom Sign-In Action */}
        <div className="w-full max-w-sm mx-auto pb-6 sm:pb-10 flex flex-col items-center">
          {errorMessage && (
            <div className="mb-4 w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-[13px] text-center">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-[#1C1C1E] text-black dark:text-white border border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.36)] font-semibold text-[16px] shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
                <span>Connecting with Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="mt-4 text-[12px] text-[#8E8E93] text-center">
            By signing in, you agree to sync your habit tracking data with Cloud Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

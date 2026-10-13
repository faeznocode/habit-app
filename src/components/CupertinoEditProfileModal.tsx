import React, { useState, useRef, useEffect } from 'react';
import { UserSettings } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { Camera, Image as ImageIcon, Smile, Trash2, X, Check } from 'lucide-react';
import { CupertinoAvatar } from './CupertinoAvatar';

interface CupertinoEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (updated: UserSettings) => void;
}

const PRESET_EMOJIS = [
  '⚡', '🚀', '🧘', '🎯', '👑', '🦁', '🦊', '🐱', '🥑', '☕', '🎧', '🏃', '🌟', '💡', '🔥', '🌊'
];

export const CupertinoEditProfileModal: React.FC<CupertinoEditProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [name, setName] = useState(settings.name || '');
  const [bio, setBio] = useState(settings.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(settings.avatarUrl);
  const [avatarEmoji, setAvatarEmoji] = useState<string | undefined>(settings.avatarEmoji);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(settings.name || '');
      setBio(settings.bio || '');
      setAvatarUrl(settings.avatarUrl);
      setAvatarEmoji(settings.avatarEmoji);
      setShowEmojiPicker(false);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle image upload and resize to max 256x256 for smooth performance
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setAvatarEmoji(undefined);
          triggerHaptic('success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = (emoji: string) => {
    triggerHaptic('light');
    setAvatarEmoji(emoji);
    setAvatarUrl(undefined);
    setShowEmojiPicker(false);
  };

  const handleClearAvatar = () => {
    triggerHaptic('medium');
    setAvatarUrl(undefined);
    setAvatarEmoji(undefined);
    setShowEmojiPicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic('medium');
    onSave({
      ...settings,
      name: name.trim(),
      bio: bio.trim() || undefined,
      avatarUrl,
      avatarEmoji,
    });
    onClose();
  };

  const previewSettings: UserSettings = {
    ...settings,
    name: name || 'User',
    avatarUrl,
    avatarEmoji,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic('light');
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[420px] bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[24px] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[rgba(60,60,67,0.15)] dark:border-[rgba(84,84,88,0.36)] my-auto mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] bg-white dark:bg-[#2C2C2E] shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="text-[17px] text-[#007AFF] hover:opacity-75 active:opacity-50 transition-opacity font-normal py-0.5"
          >
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-black dark:text-white">
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!name.trim()}
            className="text-[17px] font-semibold text-[#007AFF] hover:opacity-75 active:opacity-50 disabled:opacity-35 transition-opacity py-0.5"
          >
            Done
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 ios-scroller overscroll-contain">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <CupertinoAvatar settings={previewSettings} size="xl" className="ring-4 ring-white dark:ring-[#2C2C2E] shadow-md" />
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                aria-label="Upload photo"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Camera className="w-4 h-4 stroke-[2.2px]" />
              </button>
            </div>

            {/* Avatar Action Pills */}
            <div className="flex items-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-[#007AFF] text-[13px] font-semibold rounded-[12px] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-black dark:text-white text-[13px] font-semibold rounded-[12px] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Smile className="w-3.5 h-3.5 text-[#FF9500]" />
                <span>Emoji</span>
              </button>

              {(avatarUrl || avatarEmoji) && (
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] text-[#FF3B30] text-[13px] font-semibold rounded-[12px] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Initials</span>
                </button>
              )}
            </div>

            {/* Quick Emoji Picker Drawer */}
            {showEmojiPicker && (
              <div className="w-full bg-white dark:bg-[#2C2C2E] rounded-[16px] p-3 border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[12px] font-semibold text-[#8E8E93] uppercase">
                    Choose Profile Emoji
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-[#8E8E93] hover:text-black dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className={`text-[22px] p-1.5 rounded-[10px] hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform ${
                        avatarEmoji === emoji ? 'bg-[#007AFF]/15 ring-2 ring-[#007AFF]' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inset Grouped Section: Personal Information */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93] px-3 mb-1.5">
              Personal Information
            </h3>
            <div className="bg-white dark:bg-[#2C2C2E] rounded-[16px] overflow-hidden border border-[rgba(60,60,67,0.08)] dark:border-[rgba(84,84,88,0.25)] shadow-xs divide-y divide-[rgba(60,60,67,0.1)] dark:divide-[rgba(84,84,88,0.3)]">
              {/* Full Name */}
              <div className="p-3.5 flex items-center gap-3">
                <span className="text-[16px] text-black dark:text-white font-medium w-16 shrink-0">
                  Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Your Name"
                  className="flex-1 bg-transparent text-[16px] text-black dark:text-white outline-none placeholder-[#C7C7CC] dark:placeholder-[#636366]"
                  required
                />
                {name && (
                  <button
                    type="button"
                    onClick={() => setName('')}
                    className="p-1 text-[#8E8E93] hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Personal Mantra / Bio */}
              <div className="p-3.5 flex items-center gap-3">
                <span className="text-[16px] text-black dark:text-white font-medium w-16 shrink-0">
                  Mantra
                </span>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g. 1% better every day"
                  className="flex-1 bg-transparent text-[15px] text-black dark:text-white outline-none placeholder-[#C7C7CC] dark:placeholder-[#636366]"
                />
                {bio && (
                  <button
                    type="button"
                    onClick={() => setBio('')}
                    className="p-1 text-[#8E8E93] hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[12px] text-[#8E8E93] px-3 mt-1.5">
              Your name and profile photo are saved locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

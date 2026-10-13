import React from 'react';
import { UserSettings } from '../types';

interface CupertinoAvatarProps {
  settings: UserSettings;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const CupertinoAvatar: React.FC<CupertinoAvatarProps> = ({
  settings,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-12 h-12 text-[18px]',
    lg: 'w-16 h-16 text-[22px]',
    xl: 'w-24 h-24 text-[32px]',
  };

  const initials = (settings.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const baseClasses = `relative rounded-full shrink-0 flex items-center justify-center font-bold overflow-hidden select-none transition-transform ${sizeClasses[size]} ${className}`;

  if (settings.avatarUrl) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} bg-[#E5E5EA] dark:bg-[#2C2C2E] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] shadow-xs ${
          onClick ? 'cursor-pointer active:scale-95' : ''
        }`}
      >
        <img
          src={settings.avatarUrl}
          alt={settings.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (settings.avatarEmoji) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-[rgba(60,60,67,0.12)] dark:border-[rgba(84,84,88,0.36)] shadow-xs ${
          onClick ? 'cursor-pointer active:scale-95' : ''
        }`}
      >
        <span className="leading-none">{settings.avatarEmoji}</span>
      </div>
    );
  }

  // Fallback: iOS system gradient with initials
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white shadow-sm ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      }`}
    >
      <span>{initials}</span>
    </div>
  );
};

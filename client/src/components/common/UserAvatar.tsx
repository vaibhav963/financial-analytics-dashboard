import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  userId: string;
  userProfile?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  userProfile,
  size = 'md',
  className = '',
  showTooltip = false,
}) => {
  // Deterministic vector avatar based on userId
  const fallbackUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
    userId || 'user'
  )}&backgroundColor=319795,dd6b20,d69e2e,38a169,3182ce,805ad5`;

  // Detect dummy or placeholder endpoints that shouldn't be requested
  const isDummyUrl =
    !userProfile ||
    userProfile.startsWith('/') ||
    userProfile.startsWith('/api') ||
    userProfile.includes('thispersondoesnotexist.com') ||
    userProfile.includes('images.unsplash.com');

  const [useFallback, setUseFallback] = useState<boolean>(isDummyUrl);
  const [fallbackFailed, setFallbackFailed] = useState<boolean>(false);

  useEffect(() => {
    setUseFallback(isDummyUrl);
    setFallbackFailed(false);
  }, [userId, userProfile, isDummyUrl]);

  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : size === 'lg'
      ? 'w-11 h-11 text-sm'
      : size === 'xl'
      ? 'w-16 h-16 text-base'
      : 'w-9 h-9 text-xs';

  const avatarSrc = useFallback ? fallbackUrl : (userProfile || fallbackUrl);

  const handleError = () => {
    if (!useFallback) {
      // Primary custom URL failed, switch to deterministic DiceBear avatar
      setUseFallback(true);
    } else {
      // Even DiceBear failed (e.g. completely offline), show initials
      setFallbackFailed(true);
    }
  };

  const getInitials = (id: string) => {
    if (!id) return 'U';
    const match = id.match(/user_0*(\d+)/i);
    if (match) return `U${match[1]}`;
    return id.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(userId);

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center rounded-full bg-loopr-100 dark:bg-slateNavy-800 text-loopr-800 font-bold border border-white dark:border-slateNavy-700 shadow-sm overflow-hidden ${sizeClasses} ${className}`}
      title={showTooltip ? `User ID: ${userId}` : undefined}
    >
      {!fallbackFailed ? (
        <img
          src={avatarSrc}
          alt={`Profile of ${userId}`}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

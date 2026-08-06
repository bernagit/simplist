'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useState } from 'react';

const LOCAL_STORAGE_KEY = 'simplist_last_seen_version';

export function useChangelog() {
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
  const rawChangelog = process.env.NEXT_PUBLIC_CHANGELOG || '';
  const [lastSeenVersion, setLastSeenVersion] = useLocalStorage<string>({
    key: LOCAL_STORAGE_KEY,
    defaultValue: currentVersion,
  });

  // Initialize state lazily on initial render
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false; // Server safety check
    try {
      return !lastSeenVersion || lastSeenVersion !== currentVersion;
    } catch {
      return false;
    }
  });

  const markAsRead = () => {
    try {
      setLastSeenVersion(currentVersion);
    } catch (e) {
      console.warn('Could not save version to localStorage', e);
    }
    setIsOpen(false);
  };

  return {
    isOpen,
    currentVersion,
    rawChangelog,
    markAsRead,
    openManually: () => setIsOpen(true),
  };
}
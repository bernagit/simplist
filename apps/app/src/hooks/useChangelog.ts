'use client';

import { useLocalStorage } from '@mantine/hooks';

const LOCAL_STORAGE_KEY = 'simplist_last_seen_version';

export function useChangelog() {
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
  const rawChangelog = process.env.NEXT_PUBLIC_CHANGELOG || '';

  const [lastSeenVersion, setLastSeenVersion] = useLocalStorage<string>({
    key: LOCAL_STORAGE_KEY,
    defaultValue: '',
    getInitialValueInEffect: true, // ensures client-side read without hydration mismatch
  });

  const markAsRead = () => {
    setLastSeenVersion(currentVersion);
  };

  return {
    currentVersion,
    lastSeenVersion,
    rawChangelog,
    markAsRead,
  };
}
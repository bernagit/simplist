'use client'

import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { compareVersions, RELEASES } from '@/models/releaseNotes'

const LOCAL_STORAGE_KEY = 'simplist_last_seen_version'

export function useChangelog() {
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'

  const [lastSeenVersion, setLastSeenVersion] = useLocalStorage<string>({
    key: LOCAL_STORAGE_KEY,
    defaultValue: '',
    getInitialValueInEffect: true // client-side read, no hydration mismatch
  })

  /** Releases since the version this browser last saw, up to the running one. */
  const unseenReleases = useMemo(
    () =>
      lastSeenVersion
        ? RELEASES.filter(
            release =>
              compareVersions(release.version, lastSeenVersion) > 0 &&
              compareVersions(release.version, currentVersion) <= 0
          )
        : [],
    [lastSeenVersion, currentVersion]
  )

  const releases = useMemo(
    () => RELEASES.filter(release => compareVersions(release.version, currentVersion) <= 0),
    [currentVersion]
  )

  const markAsRead = useCallback(
    () => setLastSeenVersion(currentVersion),
    [setLastSeenVersion, currentVersion]
  )

  return {
    currentVersion,
    lastSeenVersion,
    releases,
    unseenReleases,
    markAsRead
  }
}

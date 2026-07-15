'use client'

import {
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
  useComputedColorScheme,
  rem,
  MantineColorScheme,
  Switch,
  MantineColor
} from '@mantine/core'
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react'
import { AVAILABLE_THEME_COLORS, useThemeColor } from '@/providers/ThemeColorProvider'
import { usePreferences, useUpdatePreferences } from '@/queries/preferences'
import { useAuth } from '@/providers/AuthProvider'
import { useCallback } from 'react'

const COLOR_SCHEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
  { value: 'auto', label: 'System', icon: IconDeviceDesktop }
] as const

export function AppearanceSection() {
  const { isAuthenticated } = useAuth()
  const { themeColor, setThemeColor } = useThemeColor()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')
  const { data, isLoading: loading } = usePreferences(isAuthenticated)
  const preferences = data?.data
  const updatePreferences = useUpdatePreferences()
  const syncAppearance = isAuthenticated
    ? ((preferences?.settings?.syncAppearance as boolean | undefined) ?? false)
    : false

  const handleColorSchemeChange = useCallback((scheme: MantineColorScheme) => {
    setColorScheme(scheme)

    if (!isAuthenticated || !syncAppearance) return

    updatePreferences.mutate({
      colorScheme: scheme
    })
  }, [isAuthenticated, setColorScheme, syncAppearance, updatePreferences])

  const handleThemeColorChange = useCallback((color: MantineColor) => {
    setThemeColor(color)

    if (!isAuthenticated || !syncAppearance) return

    updatePreferences.mutate({
      themeColor: color
    })
  }, [isAuthenticated, setThemeColor, syncAppearance, updatePreferences])

  const handleSyncToggle = useCallback((checked: boolean) => {
    if (!isAuthenticated) return

    updatePreferences.mutate({
      settings: {
        ...preferences?.settings,
        syncAppearance: checked
      }
    })
  }, [isAuthenticated, preferences?.settings, updatePreferences])

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            Theme
          </Text>
          <Text size="xs" c="dimmed">
            Choose how Simplist looks on this device.
          </Text>
        </div>
        {isAuthenticated && (
          <Switch
            checked={syncAppearance}
            disabled={loading}
            onChange={event => handleSyncToggle(event.currentTarget.checked)}
            label="Sync appearance across devices"
            description="Save your theme and accent color to your account instead of only this device."
          />
        )}
        <Group gap="sm">
          {COLOR_SCHEME_OPTIONS.map(option => {
            const isActive = colorScheme === option.value
            const Icon = option.icon

            return (
              <UnstyledButton
                key={option.value}
                onClick={() => handleColorSchemeChange(option.value)}
                style={{
                  flex: 1,
                  borderRadius: 'var(--mantine-radius-md)',
                  border: `1px solid ${
                    isActive
                      ? `var(--mantine-color-${themeColor}-6)`
                      : 'var(--mantine-color-default-border)'
                  }`,
                  backgroundColor: isActive
                    ? `var(--mantine-color-${themeColor}-light)`
                    : 'var(--mantine-color-body)',
                  padding: 'var(--mantine-spacing-md)',
                  transition: 'border-color 120ms ease, background-color 120ms ease'
                }}
              >
                <Stack align="center" gap={6}>
                  <Icon
                    size={20}
                    color={
                      isActive
                        ? `var(--mantine-color-${themeColor}-6)`
                        : 'var(--mantine-color-dimmed)'
                    }
                  />
                  <Text
                    size="sm"
                    fw={isActive ? 600 : 400}
                    c={isActive ? `${themeColor}.6` : 'dimmed'}
                  >
                    {option.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            )
          })}
        </Group>
      </Stack>

      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            Accent color
          </Text>
          <Text size="xs" c="dimmed">
            Pick the primary color used across buttons, links and highlights.
          </Text>
        </div>

        <Group gap="sm" ml={4}>
          {AVAILABLE_THEME_COLORS.map(color => {
            const isActive = themeColor === color

            return (
              <UnstyledButton
                key={color}
                onClick={() => handleThemeColorChange(color)}
                aria-label={`Use ${color} as accent color`}
                style={{
                  width: rem(36),
                  height: rem(36),
                  borderRadius: 'var(--mantine-radius-md)',
                  backgroundColor: `var(--mantine-color-${color}-6)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: isActive
                    ? `2px solid var(--mantine-color-${
                        computedColorScheme === 'dark' ? 'dark-0' : 'dark-9'
                      })`
                    : '2px solid transparent',
                  outlineOffset: 2,
                  transition: 'outline-color 120ms ease, transform 120ms ease'
                }}
              >
                {isActive && <IconCheck size={16} color="white" stroke={3} />}
              </UnstyledButton>
            )
          })}
        </Group>
      </Stack>
    </Stack>
  )
}

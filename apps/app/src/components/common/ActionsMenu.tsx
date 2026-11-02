'use client'

import { ActionIcon, ActionIconProps, Menu } from '@mantine/core'
import { IconDots } from '@tabler/icons-react'
import type { ContextMenuItemOptions } from 'mantine-contextmenu'
import { useTranslations } from 'next-intl'
import { CSSProperties } from 'react'

type ActionsMenuProps = {
  /** Same option shape used by `showContextMenu`, so actions are defined once. */
  items: ContextMenuItemOptions[]
  /** Optional heading shown at the top of the dropdown. */
  label?: React.ReactNode
  size?: ActionIconProps['size']
  style?: CSSProperties
  onOpenChange?: (opened: boolean) => void
}

/**
 * Visible "more actions" button. Touch devices can't rely on right-click /
 * long-press (`contextmenu` is unreliable on iOS Safari), so every action
 * offered through a context menu must also be reachable from here.
 */
export function ActionsMenu({ items, label, size = 'md', style, onOpenChange }: ActionsMenuProps) {
  const t = useTranslations('Common')
  const visibleItems = items.filter(item => !item.hidden)

  return (
    <Menu
      shadow="md"
      width={200}
      position="bottom-end"
      withinPortal
      onOpen={() => onOpenChange?.(true)}
      onClose={() => onOpenChange?.(false)}
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={size}
          aria-label={t('moreActions')}
          style={style}
          // The menu usually lives inside a clickable row/card: don't trigger it.
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>

      {/* React events bubble through portals, so stop clicks from reaching the parent card. */}
      <Menu.Dropdown onClick={e => e.stopPropagation()}>
        {label && <Menu.Label>{label}</Menu.Label>}
        {visibleItems.map(item => {
          if (!item.onClick && !item.items) {
            return <Menu.Divider key={item.key} />
          }
          return (
            <Menu.Item
              key={item.key}
              leftSection={item.icon}
              rightSection={item.iconRight}
              disabled={item.disabled ?? false}
              {...(item.color ? { color: item.color } : {})}
              {...(item.onClick ? { onClick: item.onClick } : {})}
            >
              {item.title}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}

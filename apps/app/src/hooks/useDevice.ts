import { useMediaQuery } from '@mantine/hooks'
import { MOBILE_QUERY, TOUCH_QUERY } from '@/providers/SidebarProvider'

/**
 * Phone layout and touch input, from media queries. Same values as useSidebar(), but usable
 * anywhere: modals are rendered by ModalsProvider, outside SidebarProvider.
 */
export function useDevice() {
  const isMobile = useMediaQuery(MOBILE_QUERY) ?? false
  const isTouch = useMediaQuery(TOUCH_QUERY) ?? false
  return { isMobile, isTouch }
}

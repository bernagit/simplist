import { PointerEvent, useMemo, useState } from 'react'

/** True for real mouse pointers only. Taps also fire enter events, but never the matching leave. */
export function isMousePointer(e: PointerEvent) {
  return e.pointerType === 'mouse'
}

/**
 * Hover state that ignores touch and pen. `onMouseEnter` also fires on tap, and on touch
 * devices the matching `onMouseLeave` often never arrives, so the hover style sticks.
 * Spread `hoverProps` on the element to track.
 */
export function useMouseHover() {
  const [hovered, setHovered] = useState(false)

  const hoverProps = useMemo(
    () => ({
      onPointerEnter: (e: PointerEvent) => {
        if (isMousePointer(e)) setHovered(true)
      },
      onPointerLeave: () => setHovered(false)
    }),
    []
  )

  return { hovered, hoverProps }
}

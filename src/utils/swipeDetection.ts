// スワイプ検知

import type { Ref } from 'vue'

export function useSwipeDetection(
  pageContainer: Ref<HTMLElement | null>,
  onSwipe: (direction: string) => void
) {
  let isMouseDown = false
  let startX = 0
  let currentX = 0
  let offsetX = 0

  const handleMouseDown = (e: MouseEvent) => {
    isMouseDown = true
    startX = e.clientX
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) return
    e.preventDefault()
    currentX = e.clientX
    offsetX = currentX - startX
  }

  const handleMouseUp = () => {
    isMouseDown = false
    if (
      Math.abs(offsetX) >
      (pageContainer.value ? pageContainer.value.offsetWidth : window.innerWidth) / 4
    ) {
      if (offsetX > 0) {
        onSwipe('right')
      } else if (offsetX < 0) {
        onSwipe('left')
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isMouseDown) return
    isMouseDown = false
  }

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    currentX = e.touches[0].clientX
    offsetX = currentX - startX
  }

  const handleTouchEnd = () => {
    if (
      Math.abs(offsetX) >
      (pageContainer.value ? pageContainer.value.offsetWidth : window.innerWidth) / 4
    ) {
      if (offsetX > 0) {
        onSwipe('right')
      } else if (offsetX < 0) {
        onSwipe('left')
      }
    }
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}

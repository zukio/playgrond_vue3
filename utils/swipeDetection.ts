// スワイプ検知

export function useSwipeDetection(pageContainer: Ref<HTMLElement | null>, onSwipe: (direction: string) => void) {
  let isMouseDown = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let startTime = 0;
  const minSwipeDistance = 50; // 最小スワイプ距離（ピクセル）
  const maxSwipeTime = 300; // 最大スワイプ時間（ミリ秒）
  const clickThreshold = 5; // クリックと判定する最大移動距離（ピクセル）

  const handleStart = (clientX: number, clientY: number) => {
    isMouseDown = true;
    startX = clientX;
    startY = clientY;
    currentX = clientX;
    currentY = clientY;
    startTime = Date.now();
  };

  const handleEnd = () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    const distanceX = currentX - startX;
    const distanceY = currentY - startY;
    const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (timeElapsed <= maxSwipeTime && Math.abs(distanceX) >= minSwipeDistance && totalDistance > clickThreshold) {
      if (Math.abs(distanceX) > Math.abs(distanceY)) {
        if (distanceX > 0) {
          onSwipe("right");
        } else {
          onSwipe("left");
        }
      }
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) return;
    currentX = e.clientX;
    currentY = e.clientY;
  };

  const handleMouseUp = (e: MouseEvent) => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isMouseDown) {
      handleEnd();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isMouseDown) return;
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

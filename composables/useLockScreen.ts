// ===============================================
// 画面のロック（ローディング）状態を管理する
// ===============================================
export const useLockScreen = () => {
  const layoutLock = useState<boolean>("layoutLock", () => true);
  const pageLock = useState<boolean>("pageLock", () => true);
  // -----------------------------------------------
  // getters
  const getLockStatus = (): boolean => {
    return layoutLock.value || pageLock.value;
  };
  // -----------------------------------------------
  // Setters
  const setPageLock = (status: boolean) => {
    pageLock.value = status;
  };
  const setLayoutLock = (status: boolean) => {
    layoutLock.value = status;
  };
  // -----------------------------------------------
  // Action
  const unLock = () => {
    layoutLock.value = false;
    pageLock.value = false;
  };
  return {
    unLock: unLock,
    getLockStatus: getLockStatus,
    setPageLock: setPageLock,
    getPageLock: readonly(pageLock),
    setLayoutLock: setLayoutLock,
    getLayoutLock: readonly(layoutLock),
  };
};

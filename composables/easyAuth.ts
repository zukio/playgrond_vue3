// ===============================================
// 画面のロック（ローディング）状態を管理する
// ===============================================
import { useState } from "nuxt/app";

export const useEasyAuth = () => {
  const easyPassword = useState<string>("easyPassword", () => "password");
  const easyAuthenticated = useState<boolean>("easyAuthenticated", () => false);
  // -----------------------------------------------
  // getters
  const getEasyAuthenticated = (): boolean => {
    return easyAuthenticated.value || easyAuthenticated.value;
  };
  // -----------------------------------------------
  // Setters
  const testEasyPassword = (userpassword: string) => {
    if (userpassword === easyPassword.value) {
      easyAuthenticated.value = true;
    } else {
      easyAuthenticated.value = false;
    }
    return easyAuthenticated.value;
  };
  // -----------------------------------------------
  // Action
  return {
    getEasyAuthenticated: getEasyAuthenticated,
    testEasyPassword: testEasyPassword,
  };
};

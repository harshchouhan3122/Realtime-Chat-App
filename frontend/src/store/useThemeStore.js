import { create } from "zustand";

// The theme is persisted across page reloads using localStorage, so when the user returns, the theme they selected will still be applied.
// Check it in the Developer mode -> Applications-> LocalStorage

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "business",
  setTheme: (theme) => {                                      // It updates the theme both in the store (via the set method) and in the browser's localStorage
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppTab } from "@/types";

type UIStore = {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),
      searchTerm: "",
      setSearchTerm: (term) => set({ searchTerm: term }),
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "grocery-ui" }
  )
);

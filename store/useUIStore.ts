import { create } from "zustand";
import { AppTab } from "@/types";

type UIStore = {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

export const useUIStore = create<UIStore>()((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
}));

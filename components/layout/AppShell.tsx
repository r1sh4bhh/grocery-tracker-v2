"use client";

import { useUIStore } from "@/store/useUIStore";
import BottomNav from "./BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import ProductsScreen from "@/components/screens/ProductsScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import ReportsScreen from "@/components/screens/ReportsScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

const SCREEN_MAP = {
  home:     HomeScreen,
  products: ProductsScreen,
  history:  HistoryScreen,
  reports:  ReportsScreen,
  settings: SettingsScreen,
};

export default function AppShell() {
  const { activeTab, darkMode } = useUIStore();
  const Screen = SCREEN_MAP[activeTab];

  return (
    <div className={`min-h-screen font-sans transition-colors ${
      darkMode
        ? "bg-gray-900 text-gray-50"
        : "bg-gray-50 text-gray-900"
    }`}>
      <main className="max-w-lg mx-auto pb-24">
        <Screen />
      </main>
      <BottomNav />
    </div>
  );
}

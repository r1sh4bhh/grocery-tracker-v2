"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import BottomNav from "./BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import ProductsScreen from "@/components/screens/ProductsScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import ReportsScreen from "@/components/screens/ReportsScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import OnlineIndicator from "./OnlineIndicator";

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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors ${
      darkMode
        ? "bg-gray-900 text-gray-50"
        : "bg-gray-50 text-gray-900"
    }`}>
      {!isOnline && <OnlineIndicator />}
      <main className="max-w-lg mx-auto pb-24">
        <Screen />
      </main>
      <BottomNav />
    </div>
  );
}

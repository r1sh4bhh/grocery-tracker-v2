"use client";

import { useUIStore } from "@/store/useUIStore";
import { AppTab } from "@/types";

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: "home",     label: "Home",     icon: "⊞" },
  { id: "products", label: "Products", icon: "◫" },
  { id: "history",  label: "History",  icon: "◷" },
  { id: "reports",  label: "Reports",  icon: "⊿" },
  { id: "settings", label: "Settings", icon: "⊙" },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, darkMode } = useUIStore();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-colors ${
      darkMode
        ? "bg-gray-800 border-t border-gray-700"
        : "bg-white border-t border-gray-100"
    } pb-safe`}>
      <div className="flex max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active
                  ? "text-emerald-600"
                  : darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className={`text-[10px] font-medium ${active ? "text-emerald-600" : darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

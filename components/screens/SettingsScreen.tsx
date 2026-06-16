"use client";

import { useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useUIStore } from "@/store/useUIStore";

export default function SettingsScreen() {
  const { products, quantities } = useProductStore();
  const { purchases } = usePurchaseStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState("");

  const exportData = () => {
    const data = {
      products,
      quantities,
      purchases,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (data.products && data.purchases !== undefined) {
        localStorage.setItem("grocery-products", JSON.stringify(data.products));
        localStorage.setItem("grocery-purchases", JSON.stringify(data.purchases));
        if (data.quantities) {
          localStorage.setItem("grocery-quantities", JSON.stringify(data.quantities));
        }
        alert("✓ Data imported successfully. Refresh to see changes.");
        setImportData("");
        setShowImport(false);
      } else {
        alert("✗ Invalid backup file format");
      }
    } catch (e) {
      alert("✗ Failed to parse JSON");
    }
  };

  const clearAll = () => {
    if (confirm("⚠️ This will delete all data permanently. Are you sure?")) {
      localStorage.clear();
      alert("✓ All data cleared. Refresh the page.");
    }
  };

  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const inputClass = darkMode ? "bg-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Header */}
      <div className={`${bgClass} px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm border-b ${borderClass} transition-colors`}>
        <h1 className={`text-2xl font-bold ${textClass}`}>Settings</h1>
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"} mt-1`}>Manage your data</p>
      </div>

      <div className="px-4 pt-5 space-y-4 pb-8">
        {/* Dark Mode */}
        <div className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-sm font-semibold ${textClass}`}>Dark Mode</h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-0.5`}>Easier on the eyes</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-7 rounded-full transition-colors flex items-center ${
                darkMode ? "bg-emerald-600" : "bg-gray-200"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Data Summary */}
        <div className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass}`}>
          <h2 className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-400"} uppercase tracking-wider mb-4`}>
            Data Summary
          </h2>
          <div className="space-y-2">
            <DataItem label="Products" value={String(products.length)} darkMode={darkMode} />
            <DataItem label="Purchases" value={String(purchases.length)} darkMode={darkMode} />
            <DataItem
              label="Total Spent"
              value={`₹${purchases.reduce((s, p) => s + p.price, 0)}`}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Backup Section */}
        <div className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass} space-y-3`}>
          <h2 className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-400"} uppercase tracking-wider`}>
            Backup & Restore
          </h2>
          <button
            onClick={() => setShowExport(!showExport)}
            className={`w-full py-3.5 rounded-2xl font-medium text-sm active:scale-95 transition-all ${
              darkMode
                ? "bg-emerald-900 border border-emerald-700 text-emerald-300"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}
          >
            📥 Export Backup
          </button>
          {showExport && (
            <div className={`pt-2 space-y-2 border-t ${borderClass}`}>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Download a JSON file with all your data.
              </p>
              <button
                onClick={exportData}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium text-sm active:scale-95"
              >
                Download
              </button>
            </div>
          )}

          <button
            onClick={() => setShowImport(!showImport)}
            className={`w-full py-3.5 rounded-2xl font-medium text-sm active:scale-95 transition-all ${
              darkMode
                ? "bg-blue-900 border border-blue-700 text-blue-300"
                : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}
          >
            📤 Import Backup
          </button>
          {showImport && (
            <div className={`pt-2 space-y-2 border-t ${borderClass}`}>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Paste JSON from a previous backup.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON here..."
                className={`w-full rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-400 min-h-24 font-mono ${inputClass}`}
              />
              <button
                onClick={handleImport}
                className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm active:scale-95"
              >
                Restore
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className={`${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border rounded-2xl p-5 transition-colors`}>
          <h2 className={`text-xs font-semibold ${darkMode ? "text-red-400" : "text-red-700"} uppercase tracking-wider mb-3`}>
            Danger Zone
          </h2>
          <button
            onClick={clearAll}
            className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-medium text-sm active:scale-95"
          >
            🗑 Delete All Data
          </button>
          <p className={`text-xs ${darkMode ? "text-red-300" : "text-red-600"} mt-2`}>
            This action cannot be undone.
          </p>
        </div>

        {/* About */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-gray-100"} rounded-2xl p-5 text-center transition-colors`}>
          <p className={`text-xs font-semibold ${textClass}`}>
            Grocery Tracker v1.0
          </p>
          <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"} mt-2`}>
            Track locally. No cloud. No ads.
          </p>
        </div>
      </div>
    </div>
  );
}

function DataItem({ label, value, darkMode }: { label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-gray-700" : "border-gray-50"} last:border-0`}>
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <p className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}

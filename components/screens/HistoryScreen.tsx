"use client";

import { useMemo, useState } from "react";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useProductStore } from "@/store/useProductStore";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function HistoryScreen() {
  const { purchases, deletePurchase } = usePurchaseStore();
  const { decrementQuantityRaw } = useProductStore();
  const { darkMode } = useUIStore();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const filtered = useMemo(
    () =>
      purchases
        .filter((p) =>
          p.product.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
          sortBy === "date"
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : b.price - a.price
        ),
    [purchases, search, sortBy]
  );

  const handleDelete = (id: number) => {
    const result = deletePurchase(id);
    if (result) {
      decrementQuantityRaw(result.variantId);
    }
  };

  const totalFiltered = filtered.reduce((sum, p) => sum + p.price, 0);

  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-400";
  const inputClass = darkMode ? "bg-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`${bgClass} px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm border-b ${borderClass} transition-colors`}>
        <h1 className={`text-2xl font-bold ${textClass} mb-4`}>Purchase History</h1>
        <div className="relative mb-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or category..."
            className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${inputClass}`}
          />
        </div>
        {/* Sort buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortBy === "date"
                ? "bg-emerald-100 text-emerald-700"
                : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy("amount")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortBy === "amount"
                ? "bg-emerald-100 text-emerald-700"
                : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
            }`}
          >
            Highest Price
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📋</p>
            <p className={`${secondaryText} text-sm`}>
              {purchases.length === 0
                ? "No purchases yet.\nStart by adding products and logging purchases."
                : "No purchases match your search."}
            </p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className={`${bgClass} rounded-2xl px-4 py-3 mb-3 shadow-sm flex items-center justify-between sticky top-24 z-9 border ${borderClass} transition-colors`}>
              <div>
                <p className={`text-xs font-medium ${secondaryText}`}>
                  {filtered.length} purchase{filtered.length !== 1 ? "s" : ""}
                </p>
                <p className={`text-lg font-bold ${textClass}`}>
                  {formatCurrency(totalFiltered)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${secondaryText}`}>
                  avg per purchase
                </p>
                <p className={`text-lg font-bold ${textClass}`}>
                  {formatCurrency(
                    filtered.length > 0 ? totalFiltered / filtered.length : 0
                  )}
                </p>
              </div>
            </div>

            {/* Purchase list grouped by date */}
            {groupByDate(filtered).map(({ date, purchases: dayPurchases }) => (
              <div key={date}>
                <p className={`text-xs font-semibold ${secondaryText} uppercase tracking-wider px-4 py-2.5`}>
                  {date}
                </p>
                <div className="space-y-1.5">
                  {dayPurchases.map((p) => (
                    <PurchaseCard
                      key={p.id}
                      purchase={p}
                      onDelete={() => handleDelete(p.id)}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function PurchaseCard({
  purchase,
  onDelete,
  darkMode,
}: {
  purchase: any;
  onDelete: () => void;
  darkMode: boolean;
}) {
  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-400";

  return (
    <div className={`${bgClass} rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm group transition-all border ${borderClass}`}>
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
          darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
        }`}>
          {purchase.product[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${textClass}`}>
            {purchase.product}
          </p>
          <p className={`text-xs ${secondaryText}`}>
            {purchase.size} · {purchase.category}
          </p>
          <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-300"} mt-0.5`}>
            {formatDate(purchase.date)} at {formatTime(purchase.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <p className={`font-bold text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{formatCurrency(purchase.price)}</p>
        <button
          onClick={onDelete}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 ${
            darkMode ? "bg-red-900/40 text-red-400" : "bg-red-50 text-red-400"
          }`}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

function groupByDate(
  purchases: any[]
): { date: string; purchases: any[] }[] {
  const grouped: Record<string, any[]> = {};
  purchases.forEach((p) => {
    const date = formatDate(p.date);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(p);
  });
  return Object.entries(grouped).map(([date, purch]) => ({
    date,
    purchases: purch,
  }));
}

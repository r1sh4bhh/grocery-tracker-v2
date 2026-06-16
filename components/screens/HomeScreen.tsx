"use client";

import { useMemo, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useUIStore } from "@/store/useUIStore";
import {
  formatCurrency, formatDate, formatTime,
  getCurrentMonthPurchases, getTotalSpending,
  getTopCategory, getMostPurchasedProduct, getFrequentItems,
} from "@/lib/utils";

export default function HomeScreen() {
  const { products, quantities, incrementQuantity, decrementQuantity } = useProductStore();
  const { purchases, addPurchase, deletePurchase } = usePurchaseStore();
  const { setActiveTab, searchTerm, setSearchTerm, darkMode } = useUIStore();
  const [search, setSearch] = useState("");

  const monthPurchases = useMemo(() => getCurrentMonthPurchases(purchases), [purchases]);
  const monthSpend = useMemo(() => getTotalSpending(monthPurchases), [monthPurchases]);
  const topCat = useMemo(() => getTopCategory(monthPurchases), [monthPurchases]);
  const topProduct = useMemo(() => getMostPurchasedProduct(purchases), [purchases]);
  const frequent = useMemo(() => getFrequentItems(purchases, products), [purchases, products]);

  const recent = purchases.slice(0, 5);

  const handleIncrement = (variantId: number) => {
    incrementQuantity(variantId);
    addPurchase(variantId, products);
  };

  const handleDecrement = (variantId: number) => {
    if ((quantities[variantId] || 0) === 0) return;
    decrementQuantity(variantId);
    const match = purchases.find((p) => p.variantId === variantId);
    if (match) deletePurchase(match.id);
  };

  const searchResults = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-400";
  const inputClass = darkMode ? "bg-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`${bgClass} px-5 pt-12 pb-5 sticky top-0 z-10 shadow-sm border-b ${borderClass} transition-colors`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs font-medium uppercase tracking-widest ${secondaryText}`}>This Month</p>
            <h1 className={`text-3xl font-bold ${textClass}`}>{formatCurrency(monthSpend)}</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            G
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${inputClass}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <section>
            <h2 className={`text-xs font-semibold ${secondaryText} uppercase tracking-wider mb-3`}>Results</h2>
            <div className="space-y-2">
              {searchResults.map((product) =>
                product.variants.map((variant) => (
                  <div key={variant.id} className={`${bgClass} rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border ${borderClass} transition-colors`}>
                    <div>
                      <p className={`font-semibold text-sm ${textClass}`}>{product.name}</p>
                      <p className={`text-xs ${secondaryText}`}>{variant.size} · {formatCurrency(variant.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDecrement(variant.id)} className={`w-8 h-8 rounded-full font-bold flex items-center justify-center active:scale-95 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>−</button>
                      <span className={`w-5 text-center font-semibold text-sm ${textClass}`}>{quantities[variant.id] || 0}</span>
                      <button onClick={() => handleIncrement(variant.id)} className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center active:scale-95 shadow-sm">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard label="Purchases" value={String(monthPurchases.length)} sub="this month" color="emerald" darkMode={darkMode} />
          <StatCard label="Top Category" value={topCat} sub="most spent" color="blue" darkMode={darkMode} />
          <StatCard label="Top Item" value={topProduct} sub="most bought" color="purple" darkMode={darkMode} />
          <StatCard label="Avg. Basket" value={monthPurchases.length > 0 ? formatCurrency(monthSpend / monthPurchases.length) : "₹0"} sub="per purchase" color="orange" darkMode={darkMode} />
        </section>

        {/* Frequent Items */}
        {frequent.length > 0 && (
          <section>
            <h2 className={`text-xs font-semibold ${secondaryText} uppercase tracking-wider mb-3`}>Frequently Bought</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {frequent.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setActiveTab("products")}
                  className={`flex-shrink-0 rounded-2xl px-4 py-3 shadow-sm text-left min-w-[110px] active:scale-95 transition-all ${bgClass} border ${borderClass}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                    darkMode ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {product.name[0]}
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${textClass}`}>{product.name}</p>
                  <p className={`text-[10px] mt-0.5 ${secondaryText}`}>{product.category}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Purchases */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-xs font-semibold ${secondaryText} uppercase tracking-wider`}>Recent Purchases</h2>
            <button onClick={() => setActiveTab("history")} className="text-xs text-emerald-600 font-medium">See all</button>
          </div>
          {recent.length === 0 ? (
            <div className={`${bgClass} rounded-2xl p-8 text-center shadow-sm border ${borderClass} transition-colors`}>
              <p className="text-2xl mb-2">🛒</p>
              <p className={`text-sm ${secondaryText}`}>No purchases yet.<br />Search a product above to add one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <div key={p.id} className={`${bgClass} rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border ${borderClass} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                      darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                    }`}>
                      {p.product[0]}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${textClass}`}>{p.product}</p>
                      <p className={`text-xs ${secondaryText}`}>{p.size} · {formatDate(p.date)} {formatTime(p.date)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{formatCurrency(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-4" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, darkMode }: { label: string; value: string; sub: string; color: string; darkMode: boolean }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: darkMode ? { bg: "bg-emerald-900/40", text: "text-emerald-400" } : { bg: "bg-emerald-50", text: "text-emerald-700" },
    blue: darkMode ? { bg: "bg-blue-900/40", text: "text-blue-400" } : { bg: "bg-blue-50", text: "text-blue-700" },
    purple: darkMode ? { bg: "bg-purple-900/40", text: "text-purple-400" } : { bg: "bg-purple-50", text: "text-purple-700" },
    orange: darkMode ? { bg: "bg-orange-900/40", text: "text-orange-400" } : { bg: "bg-orange-50", text: "text-orange-700" },
  };
  const { bg, text } = colorMap[color];
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${bg} border ${darkMode ? "border-gray-700" : "border-transparent"}`}>
      <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}>{label}</p>
      <p className={`text-lg font-bold truncate ${text}`}>{value}</p>
      <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"} mt-0.5`}>{sub}</p>
    </div>
  );
}

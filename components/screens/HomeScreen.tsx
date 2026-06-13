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
  const { setActiveTab } = useUIStore();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">This Month</p>
            <h1 className="text-3xl font-bold text-gray-900">{formatCurrency(monthSpend)}</h1>
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
            className="w-full bg-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
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
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Results</h2>
            <div className="space-y-2">
              {searchResults.map((product) =>
                product.variants.map((variant) => (
                  <div key={variant.id} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">{variant.size} · {formatCurrency(variant.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDecrement(variant.id)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center active:scale-95">−</button>
                      <span className="w-5 text-center font-semibold text-sm">{quantities[variant.id] || 0}</span>
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
          <StatCard label="Purchases" value={String(monthPurchases.length)} sub="this month" color="bg-emerald-50 text-emerald-700" />
          <StatCard label="Top Category" value={topCat} sub="most spent" color="bg-blue-50 text-blue-700" />
          <StatCard label="Top Item" value={topProduct} sub="most bought" color="bg-purple-50 text-purple-700" />
          <StatCard label="Avg. Basket" value={monthPurchases.length > 0 ? formatCurrency(monthSpend / monthPurchases.length) : "₹0"} sub="per purchase" color="bg-orange-50 text-orange-700" />
        </section>

        {/* Frequent Items */}
        {frequent.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Frequently Bought</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {frequent.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setActiveTab("products")}
                  className="flex-shrink-0 bg-white rounded-2xl px-4 py-3 shadow-sm text-left min-w-[110px] active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm mb-2">
                    {product.name[0]}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{product.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{product.category}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Purchases */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Purchases</h2>
            <button onClick={() => setActiveTab("history")} className="text-xs text-emerald-600 font-medium">See all</button>
          </div>
          {recent.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-2xl mb-2">🛒</p>
              <p className="text-sm text-gray-400">No purchases yet.<br />Search a product above to add one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                      {p.product[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.product}</p>
                      <p className="text-xs text-gray-400">{p.size} · {formatDate(p.date)} {formatTime(p.date)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{formatCurrency(p.price)}</p>
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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${color.includes("bg-") ? color.split(" ")[0] : "bg-white"}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold truncate ${color.split(" ")[1] || "text-gray-800"}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

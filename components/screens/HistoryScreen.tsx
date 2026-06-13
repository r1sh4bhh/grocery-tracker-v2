"use client";

import { useMemo, useState } from "react";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useProductStore } from "@/store/useProductStore";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function HistoryScreen() {
  const { purchases, deletePurchase } = usePurchaseStore();
  const { decrementQuantityRaw } = useProductStore();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase History</h1>
        <div className="relative mb-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or category..."
            className="w-full bg-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        {/* Sort buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortBy === "date"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy("amount")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortBy === "amount"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
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
            <p className="text-gray-400 text-sm">
              {purchases.length === 0
                ? "No purchases yet.\nStart by adding products and logging purchases."
                : "No purchases match your search."}
            </p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm flex items-center justify-between sticky top-20 z-9">
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  {filtered.length} purchase{filtered.length !== 1 ? "s" : ""}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(totalFiltered)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">
                  avg per purchase
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(
                    filtered.length > 0 ? totalFiltered / filtered.length : 0
                  )}
                </p>
              </div>
            </div>

            {/* Purchase list grouped by date */}
            {groupByDate(filtered).map(({ date, purchases: dayPurchases }) => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">
                  {date}
                </p>
                <div className="space-y-1.5">
                  {dayPurchases.map((p) => (
                    <PurchaseCard
                      key={p.id}
                      purchase={p}
                      onDelete={() => handleDelete(p.id)}
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
}: {
  purchase: any;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
          {purchase.product[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {purchase.product}
          </p>
          <p className="text-xs text-gray-400">
            {purchase.size} · {purchase.category}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            {formatDate(purchase.date)} at {formatTime(purchase.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <p className="font-bold text-gray-700 text-sm">{formatCurrency(purchase.price)}</p>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
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

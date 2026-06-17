"use client";

import { useMemo, useState } from "react";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useUIStore } from "@/store/useUIStore";
import {
  formatCurrency,
  getCurrentMonthPurchases,
  getCategoryTotals,
} from "@/lib/utils";

type TimePeriod = "1m" | "3m" | "6m" | "1y";

export default function ReportsScreen() {
  const { purchases } = usePurchaseStore();
  const { darkMode } = useUIStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1m");

  const monthPurchases = useMemo(() => getCurrentMonthPurchases(purchases), [purchases]);
  const categoryTotals = useMemo(() => getCategoryTotals(monthPurchases), [monthPurchases]);

  const getSpendingTrend = (months: number) => {
    const map: Record<string, number> = {};
    
    purchases.forEach((p) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + p.price;
    });

    const allMonths = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    const lastMonths = allMonths.slice(Math.max(0, allMonths.length - months));
    
    return lastMonths.map(([month, total]) => ({ month, total }));
  };

  const trend = useMemo(() => {
    const monthsMap = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };
    return getSpendingTrend(monthsMap[timePeriod]);
  }, [purchases, timePeriod]);

  const totalSpend = monthPurchases.reduce((sum, p) => sum + p.price, 0);
  const maxTrend = Math.max(...(trend.map((t) => t.total) || [1]));
  const maxCategory = Math.max(...(Object.values(categoryTotals) || [1]));

  const categoryEntries = Object.entries(categoryTotals || {})
    .sort(([, a], [, b]) => b - a);

  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Header */}
      <div className={`${bgClass} px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm border-b ${borderClass} transition-colors`}>
        <h1 className={`text-2xl font-bold ${textClass}`}>Reports & Analytics</h1>
        <p className={`text-xs ${secondaryText} mt-1`}>Track your spending patterns</p>
      </div>

      <div className="px-4 pt-4 space-y-5 pb-8">
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📊</p>
            <p className={`${secondaryText} text-sm`}>
              No data yet. Add purchases to see analytics.
            </p>
          </div>
        ) : (
          <>
            {/* This Month Summary */}
            <section className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass}`}>
              <h2 className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-400"} uppercase tracking-wider mb-4`}>
                This Month
              </h2>
              <div className="space-y-3">
                <StatRow label="Total Spending" value={formatCurrency(totalSpend)} accent="text-emerald-600" darkMode={darkMode} />
                <StatRow label="Number of Purchases" value={String(monthPurchases.length)} accent="text-blue-600" darkMode={darkMode} />
                <StatRow
                  label="Average per Purchase"
                  value={formatCurrency(
                    monthPurchases.length > 0 ? totalSpend / monthPurchases.length : 0
                  )}
                  accent="text-orange-600"
                  darkMode={darkMode}
                />
              </div>
            </section>

            {/* Time Period Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(["1m", "3m", "6m", "1y"] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    timePeriod === period
                      ? "bg-emerald-500 text-white"
                      : darkMode
                      ? "bg-gray-800 text-gray-400 border border-gray-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {period === "1m" && "1 Month"}
                  {period === "3m" && "3 Months"}
                  {period === "6m" && "6 Months"}
                  {period === "1y" && "1 Year"}
                </button>
              ))}
            </div>

            {/* Spending Trend Chart */}
            {trend && trend.length > 0 ? (
              <section className={`${bgClass} rounded-2xl p-6 shadow-sm transition-colors border ${borderClass}`}>
                <h2 className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-400"} uppercase tracking-wider mb-6`}>
                  Spending Trend
                </h2>
                <div style={{ height: "280px" }} className="flex items-flex-end justify-between gap-2">
                  {trend.map(({ month, total }) => {
                    const percentage = (total / maxTrend) * 100;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center justify-end h-full gap-3 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                          {formatCurrency(total)}
                        </div>
                        <div
                          className={`w-full rounded-t-lg transition-all group-hover:shadow-lg ${
                            darkMode
                              ? "bg-gradient-to-b from-emerald-500 to-emerald-600"
                              : "bg-gradient-to-b from-emerald-400 to-emerald-500"
                          }`}
                          style={{ height: `${Math.max(percentage, 5)}%` }}
                        />
                        <span className={`text-[11px] font-semibold ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {month.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass}`}>
                <p className={`text-sm ${secondaryText} text-center`}>No data for this period</p>
              </section>
            )}

            {/* Category Breakdown */}
            {categoryEntries.length > 0 && (
              <section className={`${bgClass} rounded-2xl p-5 shadow-sm transition-colors border ${borderClass}`}>
                <h2 className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-400"} uppercase tracking-wider mb-4`}>
                  Category Breakdown (This Month)
                </h2>
                <div className="space-y-4">
                  {categoryEntries.map(([category, amount], idx) => {
                    const width = (amount / maxCategory) * 100;
                    const colors = [
                      "bg-emerald-500",
                      "bg-blue-500",
                      "bg-purple-500",
                      "bg-orange-500",
                      "bg-pink-500",
                      "bg-indigo-500",
                    ];
                    const color = colors[idx % colors.length];
                    const percentage = totalSpend > 0 ? ((amount / totalSpend) * 100).toFixed(1) : "0";
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-medium ${textClass}`}>{category}</p>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${textClass}`}>{formatCurrency(amount)}</p>
                            <p className={`text-xs ${secondaryText}`}>{percentage}%</p>
                          </div>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                          <div
                            className={`h-full ${color} rounded-full transition-all`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Insights */}
            <section className={`${
              darkMode
                ? "bg-emerald-900/30 border-emerald-800"
                : "bg-emerald-50 border-emerald-100"
            } border rounded-2xl p-5 transition-colors`}>
              <h2 className={`text-xs font-semibold ${
                darkMode ? "text-emerald-400" : "text-emerald-700"
              } uppercase tracking-wider mb-3`}>
                Insights
              </h2>
              <ul className={`text-sm ${
                darkMode ? "text-emerald-300" : "text-emerald-700"
              } space-y-1.5`}>
                <li>
                  💡 Top category:{" "}
                  <span className="font-semibold">
                    {categoryEntries[0]?.[0] || "—"}
                  </span>
                </li>
                <li>
                  📈 Total purchases:{" "}
                  <span className="font-semibold">{purchases.length}</span>
                </li>
                <li>
                  🎯 Average basket:{" "}
                  <span className="font-semibold">
                    {formatCurrency(
                      monthPurchases.length > 0 ? totalSpend / monthPurchases.length : 0
                    )}
                  </span>
                </li>
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  accent,
  darkMode,
}: {
  label: string;
  value: string;
  accent: string;
  darkMode: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}

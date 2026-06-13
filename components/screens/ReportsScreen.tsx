"use client";

import { useMemo } from "react";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import {
  formatCurrency,
  getCurrentMonthPurchases,
  getCategoryTotals,
  getMonthlySpendingTrend,
} from "@/lib/utils";

export default function ReportsScreen() {
  const { purchases } = usePurchaseStore();
  const monthPurchases = useMemo(() => getCurrentMonthPurchases(purchases), [purchases]);
  const categoryTotals = useMemo(() => getCategoryTotals(monthPurchases), [monthPurchases]);
  const trend = useMemo(() => getMonthlySpendingTrend(purchases), [purchases]);

  const totalSpend = monthPurchases.reduce((sum, p) => sum + p.price, 0);
  const maxTrend = Math.max(...trend.map((t) => t.total), 1);
  const maxCategory = Math.max(...Object.values(categoryTotals), 1);

  const categoryEntries = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">Track your spending patterns</p>
      </div>

      <div className="px-4 pt-4 space-y-5 pb-8">
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-gray-400 text-sm">
              No data yet. Add purchases to see analytics.
            </p>
          </div>
        ) : (
          <>
            {/* This Month Summary */}
            <section className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                This Month
              </h2>
              <div className="space-y-3">
                <StatRow
                  label="Total Spending"
                  value={formatCurrency(totalSpend)}
                  accent="text-emerald-600"
                />
                <StatRow
                  label="Number of Purchases"
                  value={String(monthPurchases.length)}
                  accent="text-blue-600"
                />
                <StatRow
                  label="Average per Purchase"
                  value={formatCurrency(
                    monthPurchases.length > 0 ? totalSpend / monthPurchases.length : 0
                  )}
                  accent="text-orange-600"
                />
              </div>
            </section>

            {/* 6-Month Trend */}
            {trend.length > 0 && (
              <section className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Spending Trend (Last 6 Months)
                </h2>
                <div className="flex items-end justify-between gap-1.5 h-40">
                  {trend.map(({ month, total }) => {
                    const height = (total / maxTrend) * 100;
                    return (
                      <div
                        key={month}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div
                          className="w-full bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-t-lg transition-all group-hover:shadow-lg"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${month}: ${formatCurrency(total)}`}
                        />
                        <span className="text-[10px] text-gray-400 font-medium">
                          {month.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Hover bars for details
                </p>
              </section>
            )}

            {/* Category Breakdown */}
            {categoryEntries.length > 0 && (
              <section className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Category Breakdown (This Month)
                </h2>
                <div className="space-y-3">
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
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-gray-700">{category}</p>
                          <p className="text-sm font-bold text-gray-700">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full transition-all`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {(
                            (amount / totalSpend) *
                            100
                          ).toFixed(1)}
                          % of total
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Insights */}
            <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                Insights
              </h2>
              <ul className="text-sm text-emerald-700 space-y-1.5">
                <li>
                  💡 Highest spending category:{" "}
                  <span className="font-semibold">
                    {categoryEntries[0]?.[0] || "—"}
                  </span>
                </li>
                <li>
                  📈 You have {purchases.length} total purchase{purchases.length !== 1 ? "s" : ""} on record
                </li>
                <li>
                  🎯 Avg purchase this month:{" "}
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
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}

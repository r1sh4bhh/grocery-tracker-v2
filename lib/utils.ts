import { Purchase, Product } from "@/types";

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export const getCurrentMonthPurchases = (purchases: Purchase[]) => {
  const now = new Date();
  return purchases.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
};

export const getTotalSpending = (purchases: Purchase[]) =>
  purchases.reduce((sum, p) => sum + p.price, 0);

export const getCategoryTotals = (purchases: Purchase[]): Record<string, number> =>
  purchases.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.price;
    return acc;
  }, {} as Record<string, number>);

export const getTopCategory = (purchases: Purchase[]): string => {
  const totals = getCategoryTotals(purchases);
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
};

export const getMostPurchasedProduct = (purchases: Purchase[]): string => {
  const counts = purchases.reduce((acc, p) => {
    acc[p.product] = (acc[p.product] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
};

export const getFrequentItems = (purchases: Purchase[], products: Product[], limit = 6) => {
  const counts = purchases.reduce((acc, p) => {
    acc[p.product] = (acc[p.product] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return products
    .filter((p) => counts[p.name])
    .sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0))
    .slice(0, limit);
};

export const getMonthlySpendingTrend = (purchases: Purchase[]) => {
  const map: Record<string, number> = {};
  purchases.forEach((p) => {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + p.price;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({ month, total }));
};

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Purchase, Product } from "@/types";

type PurchaseStore = {
  purchases: Purchase[];
  addPurchase: (variantId: number, products: Product[]) => void;
  deletePurchase: (id: number) => { variantId: number } | null;
  clearAll: () => void;
  importPurchases: (data: Purchase[]) => void;
};

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      purchases: [],

      addPurchase: (variantId, products) => {
        let product = "";
        let category = "";
        let size = "";
        let price = 0;

        for (const p of products) {
          for (const v of p.variants) {
            if (v.id === variantId) {
              product = p.name;
              category = p.category;
              size = v.size;
              price = v.price;
            }
          }
        }

        const purchase: Purchase = {
          id: Date.now(),
          variantId,
          product,
          category,
          size,
          price,
          date: new Date().toISOString(),
        };

        set((s) => ({ purchases: [purchase, ...s.purchases] }));
      },

      deletePurchase: (id) => {
        const purchase = get().purchases.find((p) => p.id === id);
        if (!purchase) return null;
        set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) }));
        return { variantId: purchase.variantId };
      },

      clearAll: () => set({ purchases: [] }),

      importPurchases: (data) => set({ purchases: data }),
    }),
    { name: "grocery-purchases" }
  )
);

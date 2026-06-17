import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Variant } from "@/types";
import { sampleProducts } from "@/lib/sample-data";

type ProductStore = {
  products: Product[];
  quantities: Record<number, number>;

  addProduct: (name: string, category: string, image?: string) => Product;
  updateProduct: (id: number, name: string, category: string, image?: string) => void;
  deleteProduct: (id: number) => void;

  addVariant: (productId: number, size: string, price: number) => Variant;
  updateVariant: (variantId: number, size: string, price: number) => void;
  deleteVariant: (variantId: number) => void;

  incrementQuantity: (variantId: number) => void;
  decrementQuantity: (variantId: number) => void;
  decrementQuantityRaw: (variantId: number) => void;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: sampleProducts,
      quantities: {},

      addProduct: (name, category, image) => {
        const product: Product = { 
          id: Date.now(), 
          name, 
          category, 
          variants: [],
          image
        };
        set((s) => ({ products: [...s.products, product] }));
        return product;
      },

      updateProduct: (id, name, category, image) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, name, category, image } : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => {
          const product = s.products.find((p) => p.id === id);
          const updated = { ...s.quantities };
          product?.variants.forEach((v) => delete updated[v.id]);
          return { products: s.products.filter((p) => p.id !== id), quantities: updated };
        }),

      addVariant: (productId, size, price) => {
        const variant: Variant = { id: Date.now(), size, price };
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId ? { ...p, variants: [...p.variants, variant] } : p
          ),
        }));
        return variant;
      },

      updateVariant: (variantId, size, price) =>
        set((s) => ({
          products: s.products.map((p) => ({
            ...p,
            variants: p.variants.map((v) => (v.id === variantId ? { ...v, size, price } : v)),
          })),
        })),

      deleteVariant: (variantId) =>
        set((s) => ({
          products: s.products.map((p) => ({
            ...p,
            variants: p.variants.filter((v) => v.id !== variantId),
          })),
        })),

      incrementQuantity: (variantId) =>
        set((s) => ({
          quantities: { ...s.quantities, [variantId]: (s.quantities[variantId] || 0) + 1 },
        })),

      decrementQuantity: (variantId) =>
        set((s) => ({
          quantities: {
            ...s.quantities,
            [variantId]: Math.max((s.quantities[variantId] || 0) - 1, 0),
          },
        })),

      decrementQuantityRaw: (variantId) =>
        set((s) => ({
          quantities: {
            ...s.quantities,
            [variantId]: Math.max((s.quantities[variantId] || 0) - 1, 0),
          },
        })),
    }),
    { name: "grocery-products" }
  )
);

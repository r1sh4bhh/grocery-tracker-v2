"use client";

import { useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { formatCurrency } from "@/lib/utils";
import { Product, Variant } from "@/types";

type Sheet =
  | { type: "addProduct" }
  | { type: "addVariant"; productId: number }
  | { type: "editProduct"; product: Product }
  | { type: "editVariant"; variant: Variant; productId: number }
  | null;

export default function ProductsScreen() {
  const { products, quantities, incrementQuantity, decrementQuantity,
    addProduct, updateProduct, deleteProduct,
    addVariant, updateVariant, deleteVariant } = useProductStore();
  const { purchases, addPurchase, deletePurchase } = usePurchaseStore();
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openSheet = (s: Sheet) => {
    setName(""); setCategory(""); setSize(""); setPrice("");
    if (s?.type === "editProduct") { setName(s.product.name); setCategory(s.product.category); }
    if (s?.type === "editVariant") { setSize(s.variant.size); setPrice(String(s.variant.price)); }
    setSheet(s);
  };

  const handleSubmit = () => {
    if (!sheet) return;
    if (sheet.type === "addProduct" && name && category) {
      addProduct(name, category);
    } else if (sheet.type === "addVariant" && size && price) {
      addVariant(sheet.productId, size, Number(price));
    } else if (sheet.type === "editProduct" && name && category) {
      updateProduct(sheet.product.id, name, category);
    } else if (sheet.type === "editVariant" && size && price) {
      updateVariant(sheet.variant.id, size, Number(price));
    }
    setSheet(null);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button
            onClick={() => openSheet({ type: "addProduct" })}
            className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md active:scale-95"
          >+</button>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-8">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-gray-400 text-sm">No products yet.<br />Tap + to add your first product.</p>
          </div>
        )}

        {filtered.map((product) => {
          const expanded = expandedId === product.id;
          const totalQty = product.variants.reduce((s, v) => s + (quantities[v.id] || 0), 0);
          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Product row */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <button onClick={() => setExpandedId(expanded ? null : product.id)} className="flex items-center gap-3 flex-1 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                    {product.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category} · {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {totalQty > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{totalQty}</span>
                  )}
                  <button onClick={() => openSheet({ type: "editProduct", product })} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">✎</button>
                  <button onClick={() => deleteProduct(product.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs">🗑</button>
                  <span className={`text-gray-300 text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                </div>
              </div>

              {/* Variants */}
              {expanded && (
                <div className="border-t border-gray-50">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{variant.size}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(variant.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openSheet({ type: "editVariant", variant, productId: product.id })} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">✎</button>
                        <button onClick={() => deleteVariant(variant.id)} className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-[10px]">✕</button>
                        <div className="flex items-center gap-2 ml-1">
                          <button onClick={() => handleDecrement(variant.id)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center active:scale-95">−</button>
                          <span className="w-5 text-center font-semibold text-sm">{quantities[variant.id] || 0}</span>
                          <button onClick={() => handleIncrement(variant.id)} className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center active:scale-95 shadow-sm">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openSheet({ type: "addVariant", productId: product.id })}
                    className="w-full py-3 text-xs text-emerald-600 font-medium text-center active:bg-gray-50"
                  >+ Add variant</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSheet(null)} />
          <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl px-5 pt-3 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {sheet.type === "addProduct" && "New Product"}
              {sheet.type === "addVariant" && "New Variant"}
              {sheet.type === "editProduct" && "Edit Product"}
              {sheet.type === "editVariant" && "Edit Variant"}
            </h3>

            {(sheet.type === "addProduct" || sheet.type === "editProduct") && (
              <>
                <SheetInput label="Product name" value={name} onChange={setName} placeholder="e.g. Amul Butter" />
                <SheetInput label="Category" value={category} onChange={setCategory} placeholder="e.g. Dairy" />
              </>
            )}
            {(sheet.type === "addVariant" || sheet.type === "editVariant") && (
              <>
                <SheetInput label="Size" value={size} onChange={setSize} placeholder="e.g. 500g, 1L" />
                <SheetInput label="Price (₹)" value={price} onChange={setPrice} placeholder="e.g. 85" type="number" />
              </>
            )}

            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-emerald-500 text-white font-semibold rounded-2xl py-4 active:scale-95 shadow-md"
            >Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SheetInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}

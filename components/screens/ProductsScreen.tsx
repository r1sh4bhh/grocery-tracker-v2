"use client";

import { useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useUIStore } from "@/store/useUIStore";
import { uploadToCloudinary } from "@/lib/cloudinary";
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
  const { darkMode } = useUIStore();
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string>("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openSheet = (s: Sheet) => {
    setName(""); setCategory(""); setSize(""); setPrice(""); setImage("");
    if (s?.type === "editProduct") { 
      setName(s.product.name); 
      setCategory(s.product.category); 
      setImage(s.product.image || "");
    }
    if (s?.type === "editVariant") { setSize(s.variant.size); setPrice(String(s.variant.price)); }
    setSheet(s);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImage(url);
    } catch (error) {
      alert("Image upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!sheet) return;
    if (sheet.type === "addProduct" && name && category) {
      addProduct(name, category, image || undefined);
    } else if (sheet.type === "addVariant" && size && price) {
      addVariant(sheet.productId, size, Number(price));
    } else if (sheet.type === "editProduct" && name && category) {
      updateProduct(sheet.product.id, name, category, image || undefined);
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

  const bgClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-100";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-400";
  const inputClass = darkMode ? "bg-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`${bgClass} px-5 pt-12 pb-4 sticky top-0 z-10 shadow-sm border-b ${borderClass} transition-colors`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold ${textClass}`}>Products</h1>
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
            className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${inputClass}`}
          />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-8">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📦</p>
            <p className={`${secondaryText} text-sm`}>No products yet.<br />Tap + to add your first product.</p>
          </div>
        )}

        {filtered.map((product) => {
          const expanded = expandedId === product.id;
          const totalQty = product.variants.reduce((s, v) => s + (quantities[v.id] || 0), 0);
          return (
            <div key={product.id} className={`${bgClass} rounded-2xl shadow-sm overflow-hidden border ${borderClass} transition-colors`}>
              {/* Product row */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <button onClick={() => setExpandedId(expanded ? null : product.id)} className="flex items-center gap-3 flex-1 text-left">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      darkMode ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {product.name[0]}
                    </div>
                  )}
                  <div>
                    <p className={`font-semibold ${textClass}`}>{product.name}</p>
                    <p className={`text-xs ${secondaryText}`}>{product.category} · {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {totalQty > 0 && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      darkMode ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                    }`}>{totalQty}</span>
                  )}
                  <button onClick={() => openSheet({ type: "editProduct", product })} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                  }`}>✎</button>
                  <button onClick={() => deleteProduct(product.id)} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    darkMode ? "bg-red-900/40 text-red-400" : "bg-red-50 text-red-400"
                  }`}>🗑</button>
                  <span className={`text-gray-300 text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                </div>
              </div>

              {/* Variants */}
              {expanded && (
                <div className={`border-t ${borderClass}`}>
                  {product.variants.map((variant) => (
                    <div key={variant.id} className={`px-4 py-3 flex items-center justify-between border-b ${borderClass} last:border-0`}>
                      <div>
                        <p className={`text-sm font-medium ${textClass}`}>{variant.size}</p>
                        <p className={`text-xs ${secondaryText}`}>{formatCurrency(variant.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openSheet({ type: "editVariant", variant, productId: product.id })} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"
                        }`}>✎</button>
                        <button onClick={() => deleteVariant(variant.id)} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          darkMode ? "bg-red-900/40 text-red-400" : "bg-red-50 text-red-400"
                        }`}>✕</button>
                        <div className="flex items-center gap-2 ml-1">
                          <button onClick={() => handleDecrement(variant.id)} className={`w-8 h-8 rounded-full font-bold flex items-center justify-center active:scale-95 ${
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}>−</button>
                          <span className={`w-5 text-center font-semibold text-sm ${textClass}`}>{quantities[variant.id] || 0}</span>
                          <button onClick={() => handleIncrement(variant.id)} className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center active:scale-95 shadow-sm">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openSheet({ type: "addVariant", productId: product.id })}
                    className={`w-full py-3 text-xs font-medium text-center active:${darkMode ? "bg-gray-700" : "bg-gray-50"} text-emerald-600`}
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
          <div className={`relative w-full max-w-lg mx-auto ${bgClass} rounded-t-3xl px-5 pt-3 pb-10 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto`}>
            <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
            <h3 className={`text-lg font-bold ${textClass} mb-5`}>
              {sheet.type === "addProduct" && "New Product"}
              {sheet.type === "addVariant" && "New Variant"}
              {sheet.type === "editProduct" && "Edit Product"}
              {sheet.type === "editVariant" && "Edit Variant"}
            </h3>

            {(sheet.type === "addProduct" || sheet.type === "editProduct") && (
              <>
                <SheetInput label="Product name" value={name} onChange={setName} placeholder="e.g. Amul Butter" darkMode={darkMode} />
                <SheetInput label="Category" value={category} onChange={setCategory} placeholder="e.g. Dairy" darkMode={darkMode} />
                
                {/* Image upload */}
                <div className="mb-4">
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Product Image
                  </label>
                  {image && (
                    <div className="mb-3 relative">
                      <img src={image} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                      <button
                        onClick={() => setImage("")}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >✕</button>
                    </div>
                  )}
                  <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    darkMode 
                      ? "border-gray-600 hover:border-emerald-500 bg-gray-700" 
                      : "border-gray-300 hover:border-emerald-500 bg-gray-50"
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div>
                      <p className={`text-sm font-medium ${uploading ? "text-gray-500" : "text-emerald-600"}`}>
                        {uploading ? "Uploading..." : "Click to upload"}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
            {(sheet.type === "addVariant" || sheet.type === "editVariant") && (
              <>
                <SheetInput label="Size" value={size} onChange={setSize} placeholder="e.g. 500g, 1L" darkMode={darkMode} />
                <SheetInput label="Price (₹)" value={price} onChange={setPrice} placeholder="e.g. 85" type="number" darkMode={darkMode} />
              </>
            )}

            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full mt-4 bg-emerald-500 text-white font-semibold rounded-2xl py-4 active:scale-95 shadow-md disabled:opacity-50"
            >Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SheetInput({ label, value, onChange, placeholder, type = "text", darkMode }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; darkMode: boolean;
}) {
  return (
    <div className="mb-4">
      <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-colors ${
          darkMode ? "bg-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}

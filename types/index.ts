export type Variant = {
  id: number;
  size: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  variants: Variant[];
};

export type Purchase = {
  id: number;
  variantId: number;
  product: string;
  category: string;
  size: string;
  price: number;
  date: string; // ISO string
};

export type AppTab = "home" | "products" | "history" | "reports" | "settings";

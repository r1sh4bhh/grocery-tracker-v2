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
  image?: string; // Cloudinary URL
};

export type Purchase = {
  id: number;
  variantId: number;
  product: string;
  category: string;
  size: string;
  price: number;
  date: string;
};

export type AppTab = "home" | "products" | "history" | "reports" | "settings";

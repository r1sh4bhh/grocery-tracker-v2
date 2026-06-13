import { Product } from "@/types";

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Amul Milk",
    category: "Dairy",
    variants: [
      { id: 101, size: "500ml", price: 28 },
      { id: 102, size: "1L", price: 54 },
    ],
  },
  {
    id: 2,
    name: "Tata Salt",
    category: "Pantry",
    variants: [{ id: 201, size: "1kg", price: 24 }],
  },
  {
    id: 3,
    name: "Fortune Sunflower Oil",
    category: "Cooking",
    variants: [
      { id: 301, size: "1L", price: 145 },
      { id: 302, size: "5L", price: 690 },
    ],
  },
  {
    id: 4,
    name: "Aashirvaad Atta",
    category: "Grains",
    variants: [
      { id: 401, size: "5kg", price: 280 },
      { id: 402, size: "10kg", price: 540 },
    ],
  },
];

export interface Product {
  id: string;
  name: string;
  price: number;
  category: "Jerseys" | "Hoodies" | "T-Shirts" | "Accessories" | string;
  league: "NFL" | "NBA" | "WNBA" | "MLB" | "NHL" | "MLS" | string;
  description: string;
  badge?: string;
  imageColor: string;
  team?: string;
  image?: string;
  title?: string;
  type?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export type TeamCatalog = {
  league: string;
  team: string;
  products: Product[];
};


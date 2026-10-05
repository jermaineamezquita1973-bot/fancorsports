export interface StaticProduct {
  id: string | number;
  name: string;
  price: number;
  league: string;
  team: string;
  category: "T-Shirts";
  image?: string;
  imageColor?: string;
  badge?: string;
  description: string;
}

export const PRODUCTS: StaticProduct[] = [];
export interface MeliCategory {
  id: string;
  name: string;
}

export interface MeliProduct {
  itemId: string;
  categoryId: string;
  title: string;
  thumbnail: string | null;
  price: number;
  permalink: string;
  soldQuantity: number;
  rankPosition: number;
}

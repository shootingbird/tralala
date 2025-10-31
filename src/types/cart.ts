export interface CartItem {
  productId: string;
  variationId: string | undefined;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variationName?: string;
  category?: string;
  brand?: string;
  color?: string;
  description?: string;
}

export interface CartState {
  items: CartItem[];
}

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { trpc } from "@/providers/trpc";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size: string | null;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    image: string;
    stock: number;
    brand: string | null;
    sizes: any;
  } | null;
}

export function getItemPrice(item: CartItem): number {
  if (!item.product) return 0;
  let price = parseFloat(item.product.price);
  if (item.product.sizes && item.size) {
    const sizesArray = typeof item.product.sizes === "string" ? JSON.parse(item.product.sizes) : item.product.sizes;
    const selectedSizeObj = sizesArray?.find?.((s: any) => s.size === item.size);
    if (selectedSizeObj?.price) price = parseFloat(selectedSizeObj.price);
  }
  return price;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number, size?: string) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function getSessionId() {
  let sid = localStorage.getItem("cart_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("cart_session_id", sid);
  }
  return sid;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(getSessionId);
  const utils = trpc.useUtils();

  const { data: items = [], isLoading, refetch } = trpc.cart.getCart.useQuery(
    { sessionId },
    { refetchOnWindowFocus: true }
  );

  const addMutation = trpc.cart.addToCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const updateMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const removeMutation = trpc.cart.removeFromCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const clearMutation = trpc.cart.clearCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const addToCart = useCallback(
    async (productId: number, quantity = 1, size?: string) => {
      await addMutation.mutateAsync({ productId, quantity, size, sessionId });
    },
    [addMutation, sessionId]
  );

  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      await updateMutation.mutateAsync({ cartItemId, quantity });
    },
    [updateMutation]
  );

  const removeFromCart = useCallback(
    async (cartItemId: number) => {
      await removeMutation.mutateAsync({ cartItemId });
    },
    [removeMutation]
  );

  const clearCart = useCallback(async () => {
    await clearMutation.mutateAsync({ sessionId });
  }, [clearMutation, sessionId]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

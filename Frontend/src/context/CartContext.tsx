import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";
import { Cart } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  cart: Cart | undefined | null;
  isLoading: boolean;
  error: Error | null;
  addToCart: (item: { menuItemId: string; quantity: number }) => void;
  updateCartItem: (item: { menuItemId: string; quantity: number }) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading: isCartLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get("/cart");
      return data.data;
    },
    enabled: !isAuthLoading && isAuthenticated,
  });

  const cartUpdateMutation = useMutation({
    mutationFn: (item: { menuItemId: string; quantity: number }) =>
      api.post("/cart", item),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data.data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update cart.");
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => api.delete("/cart"),
    onSuccess: () => {
      queryClient.setQueryData(["cart"], null);
      toast.success("Cart cleared!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to clear cart.");
    },
  });

  const addToCart = (item: { menuItemId: string; quantity: number }) => {
    const existingItem = cart?.items.find(
      (i) => i.menuItem._id === item.menuItemId
    );
    if (existingItem) {
      toast.success(`Updated ${existingItem.menuItem.name} in cart.`);
    } else {
      toast.success(`Item added to cart!`);
    }
    cartUpdateMutation.mutate(item);
  };

  const updateCartItem = (item: { menuItemId: string; quantity: number }) => {
    cartUpdateMutation.mutate(item);
  };

  const removeFromCart = (menuItemId: string) => {
    cartUpdateMutation.mutate({ menuItemId, quantity: 0 });
    toast.info("Item removed from cart.");
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading: isCartLoading || isAuthLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

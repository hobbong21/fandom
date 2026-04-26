import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PRODUCTS, type Product } from "@/constants/storeData";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: number;
}

interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<Order>;
  getProductById: (id: string) => Product | undefined;
  getProductsByFandom: (fandomId: string) => Product[];
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const CART_KEY = "fandom_cart";
const ORDERS_KEY = "fandom_orders";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rawCart = await AsyncStorage.getItem(CART_KEY);
        if (rawCart) setCart(JSON.parse(rawCart));
        const rawOrders = await AsyncStorage.getItem(ORDERS_KEY);
        if (rawOrders) setOrders(JSON.parse(rawOrders));
      } catch {}
    })();
  }, []);

  const saveCart = useCallback(async (items: CartItem[]) => {
    setCart(items);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  }, []);

  const addToCart = useCallback((productId: string) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      const next = exists
        ? prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { productId, quantity: 1 }];
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    AsyncStorage.setItem(CART_KEY, JSON.stringify([]));
  }, []);

  const checkout = useCallback(async (): Promise<Order> => {
    const total = cart.reduce((sum, item) => {
      const p = PRODUCTS.find((x) => x.id === item.productId);
      return sum + (p?.price ?? 0) * item.quantity;
    }, 0);
    const order: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      createdAt: Date.now(),
    };
    const nextOrders = [order, ...orders];
    setOrders(nextOrders);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
    clearCart();
    return order;
  }, [cart, orders, clearCart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find((x) => x.id === item.productId);
    return sum + (p?.price ?? 0) * item.quantity;
  }, 0);

  const getProductById = useCallback((id: string) => PRODUCTS.find((p) => p.id === id), []);
  const getProductsByFandom = useCallback((fandomId: string) => PRODUCTS.filter((p) => p.fandomId === fandomId), []);

  return (
    <StoreContext.Provider value={{
      products: PRODUCTS,
      cart,
      orders,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      getProductById,
      getProductsByFandom,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product, ProductCard } from "@/types";

const STORAGE_KEY = "mt-market-cart";
const subscribers = new Set<(items: CartItem[]) => void>();
let currentItems: CartItem[] = [];

type AddableProduct = Product | ProductCard;

function toCartItem(product: AddableProduct, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    imageUrl: product.image_url,
    quantity
  };
}

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function emit(items: CartItem[]) {
  currentItems = items;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  subscribers.forEach((subscriber) => subscriber(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(currentItems);

  useEffect(() => {
    if (currentItems.length === 0) {
      currentItems = readCart();
    }

    setItems(currentItems);
    subscribers.add(setItems);

    return () => {
      subscribers.delete(setItems);
    };
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return {
    items,
    totalItems,
    totalPrice,
    addItem(product: AddableProduct, quantity = 1) {
      const next = (() => {
        const current = currentItems;
        const existing = current.find((item) => item.productId === product.id);

        if (existing) {
          return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
        }

        return [...current, toCartItem(product, quantity)];
      })();
      emit(next);
    },
    removeItem(productId: string) {
      emit(currentItems.filter((item) => item.productId !== productId));
    },
    updateQuantity(productId: string, quantity: number) {
      if (quantity <= 0) {
        emit(currentItems.filter((item) => item.productId !== productId));
        return;
      }
      emit(currentItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
    },
    clearCart() {
      emit([]);
    },
    isInCart(productId: string) {
      return items.some((item) => item.productId === productId);
    }
  };
}

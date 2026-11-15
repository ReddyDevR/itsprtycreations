'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariation } from '@/types';

export interface LocalCartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  variation?: ProductVariation | null;
  personalization?: string | null;
}

interface CartContextType {
  items: LocalCartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    variation?: ProductVariation | null,
    personalization?: string | null
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  appliedCoupon: null,
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  wishlist: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('itsprty_cart');
      if (saved) setItems(JSON.parse(saved));
      const savedWishlist = localStorage.getItem('itsprty_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('itsprty_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('itsprty_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variation: ProductVariation | null = null,
    personalization: string | null = null
  ) => {
    const itemPrice = product.sellingPrice + (variation ? variation.priceAdjustment : 0);
    const itemId = `${product.id}-${variation?.value || 'standard'}-${personalization || 'none'}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          title: product.title,
          price: itemPrice,
          originalPrice: product.originalPrice,
          image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
          quantity,
          variation,
          personalization,
        },
      ];
    });

    // Also inform server cart API in background
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        variationId: variation?.id,
        personalization,
      }),
    }).catch(() => {});

    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem('itsprty_cart');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}&amount=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Invalid coupon code' };
      }
      setAppliedCoupon(data.coupon.code);
      setCouponDiscount(data.calculatedDiscount);
      return { success: true, message: `Coupon ${data.coupon.code} applied! Saved ₹${data.calculatedDiscount}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const discount = couponDiscount;
  const shipping = subtotal - discount >= 499 || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + shipping);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

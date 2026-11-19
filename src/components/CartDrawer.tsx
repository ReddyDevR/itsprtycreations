'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
  Check,
  Sparkles,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponInput.trim()) return;

    setApplying(true);
    setCouponMsg(null);

    try {
      const res = await applyCoupon(couponInput);

      setCouponMsg({
        text: res.message,
        isError: !res.success,
      });

      if (res.success) {
        setCouponInput('');
      }
    } catch {
      setCouponMsg({
        text: 'Unable to apply coupon. Please try again.',
        isError: true,
      });
    } finally {
      setApplying(false);
    }
  };

  const freeShippingThreshold = 50;
  const amountNeededForFree = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 animate-fade-in">

      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Center Shopping Cart Popup */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-cart-popup"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/60">

          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />

            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Your Shopping Cart
            </h2>

            <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="shrink-0 px-4 sm:px-6 py-3 bg-amber-50/70 border-b border-amber-100 text-xs">

            {amountNeededForFree > 0 ? (
              <p className="text-amber-900 text-center font-medium">
                Add{' '}
                <span className="font-bold text-rose-700">
                  £{amountNeededForFree.toFixed(2)}
                </span>{' '}
                more to unlock <b>FREE UK Delivery!</b>
              </p>
            ) : (
              <p className="text-emerald-700 text-center font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Congratulations! You have unlocked FREE Shipping!
              </p>
            )}

            <div className="w-full h-1.5 bg-amber-200/50 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 bg-gray-50/60">

          {items.length === 0 ? (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 text-gray-400">

              <div className="w-16 h-16 mb-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                <ShoppingBag className="w-8 h-8" />
              </div>

              <h3 className="text-base font-semibold text-gray-800">
                Your cart is empty
              </h3>

              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Discover handcrafted greeting cards, custom favor templates,
                and celebration stationery!
              </p>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-5 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-200 transition-all"
              >

                {/* LEFT: Small Product Image */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* MIDDLE: Product Information */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {item.title}
                    </h4>

                    {item.variation && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Option:{' '}
                        <span className="font-medium text-gray-800">
                          {item.variation.value}
                        </span>
                      </p>
                    )}

                    {item.personalization && (
                      <p className="text-xs text-rose-600 mt-1 italic line-clamp-2">
                        Note: &quot;{item.personalization}&quot;
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Unit Price:{' '}
                      <span className="font-semibold text-gray-800">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  {/* Quantity and Delete */}
                  <div className="flex items-center gap-3 mt-3">

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="min-w-9 text-center text-sm font-bold text-gray-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-xs font-semibold"
                      aria-label="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT: Product Total */}
                <div className="shrink-0 text-right flex flex-col justify-between items-end">

                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Item Total
                    </p>

                    <p className="text-sm sm:text-base font-bold text-rose-700 mt-1">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {item.originalPrice > item.price && (
                      <p className="text-xs text-gray-400 line-through mt-1">
                        ₹{item.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 hidden sm:block">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer and Checkout */}
        {items.length > 0 && (
          <div className="shrink-0 p-3 sm:p-5 border-t border-gray-200 bg-white space-y-3">

            {/* Coupon Code */}
            {!appliedCoupon ? (
              <form onSubmit={handleApply} className="flex gap-2">

                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. PARTY20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm uppercase border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">

                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />

                  <span>
                    Coupon <b>{appliedCoupon}</b> applied (-₹{discount})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-emerald-900 font-bold underline text-xs"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Coupon Message */}
            {couponMsg && (
              <p
                className={`text-xs ${
                  couponMsg.isError ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {couponMsg.text}
              </p>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-200">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{subtotal}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>

                <span>
                  {shipping === 0 ? (
                    <b className="text-emerald-600">FREE</b>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>

                <span className="text-rose-700">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm tracking-wide uppercase rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';

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
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponInput);
    setApplying(false);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const freeShippingThreshold = 50;
  const amountNeededForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-gray-900">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="p-3 bg-amber-50/60 border-b border-amber-100 text-xs">
            {amountNeededForFree > 0 ? (
              <p className="text-amber-900 text-center font-medium">
                Add <span className="font-bold text-rose-700">£{amountNeededForFree.toFixed(2)}</span> more to unlock <b>FREE UK Delivery!</b>
              </p>
            ) : (
              <p className="text-emerald-700 text-center font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Discover handcrafted greeting cards, custom favor templates, and celebration stationery!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-rose-100 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-18 h-18 object-cover rounded-lg bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</h4>

                    {item.variation && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Option: <span className="font-medium text-gray-700">{item.variation.value}</span>
                      </p>
                    )}

                    {item.personalization && (
                      <p className="text-[11px] text-rose-600 mt-0.5 italic line-clamp-1">
                        Note: &quot;{item.personalization}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
              {/* Coupon Code Input */}
              {!appliedCoupon ? (
                <form onSubmit={handleApply} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. PARTY20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs uppercase border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-rose-600 transition-all disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      Coupon <b>{appliedCoupon}</b> applied (-₹{discount})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMsg && (
                <p className={`text-[11px] ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <b className="text-emerald-600">FREE</b> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span className="text-rose-700">₹{total}</span>
                </div>
              </div>

              {/* Checkout Link Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2"
              >
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

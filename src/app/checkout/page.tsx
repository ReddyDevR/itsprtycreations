'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE');

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const paymentReturnHandled = useRef(false);

  useEffect(() => {
    if (paymentReturnHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'cancelled') {
      paymentReturnHandled.current = true;
      setError('Payment was cancelled. Your order has not been paid. You can try again.');
      window.history.replaceState({}, '', '/checkout');
      return;
    }

    if (payment === 'success' && sessionId) {
      paymentReturnHandled.current = true;
      setLoading(true);
      fetch(`/api/payment/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || 'Unable to verify payment.');
          clearCart();
          setConfirmedOrder(data.order);
          confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
          window.history.replaceState({}, '', '/checkout');
        })
        .catch((err) => setError(err.message || 'Payment verification failed.'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    if (!fullName || !email || !phone || !street || !city || !state || !postalCode) {
      setError('Please fill in all mandatory delivery address fields.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          fullName,
          phone,
          street,
          apartment,
          city,
          state,
          postalCode,
          country: 'United Kingdom',
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variation: i.variation?.value || null,
          variationPriceAdjustment: i.variation?.priceAdjustment || 0,
          personalization: i.personalization || null,
        })),
        couponCode: appliedCoupon,
        paymentMethod,
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      const createdOrder = orderData.order;

      if (paymentMethod === 'COD') {
        clearCart();
        setConfirmedOrder(createdOrder);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        return;
      }

      // Create a Stripe-hosted GBP Checkout Session and redirect the customer.
      const stripeRes = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrder.id }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok || !stripeData.success || !stripeData.url) {
        throw new Error(stripeData.error || 'Unable to start secure Stripe checkout.');
      }
      window.location.assign(stripeData.url);

    } catch (err: any) {
      setError(err.message || 'Error occurred while processing checkout');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full">
          {confirmedOrder.paymentMethod === 'COD' ? 'Cash on Delivery Order Placed' : 'Order Successfully Placed & Verified'}
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Thank You for Celebrating with Us!
        </h1>

        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          {confirmedOrder.paymentMethod === 'COD' ? (
            <>Your order has been placed. Please pay the delivery partner in cash when your order arrives. An order confirmation will be sent to <b>{confirmedOrder.customerEmail}</b>.</>
          ) : (
            <>Your order has been received and confirmed by the LTS Party Creations studio. We have dispatched a confirmation email to <b>{confirmedOrder.customerEmail}</b>.</>
          )}
        </p>

        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm max-w-md mx-auto text-left space-y-3">
          <div className="flex justify-between text-xs pb-3 border-b border-gray-100">
            <span className="text-gray-500">Order Reference</span>
            <span className="font-mono font-bold text-rose-700">{confirmedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between text-xs pb-3 border-b border-gray-100">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-bold text-gray-900">£{Number(confirmedOrder.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs pb-3 border-b border-gray-100">
            <span className="text-gray-500">Payment Status</span>
            <span className="font-bold text-emerald-600 uppercase">
              {confirmedOrder.paymentStatus || (confirmedOrder.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Current Status</span>
            <span className="font-bold text-rose-600 uppercase">
              {confirmedOrder.status || 'CONFIRMED'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={`/orders/${confirmedOrder.orderNumber}`}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-700 shadow-md transition-all"
          >
            Track Order & View Invoice
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500">
          Please add greeting cards or celebration supplies to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-all"
        >
          Browse Greeting Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-rose-600">
          Fast & Protected Checkout
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
          Complete Your LTS Party Order
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact & Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-600" />
              1. Delivery Contact & Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mobile Number (for delivery SMS) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address (for order invoice) *</label>
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="House / Flat No., Road No., Colony"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greater London"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="SW1A 1AA"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Secure UK Payment */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              2. Secure Payment
            </h2>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'STRIPE' ? 'border-rose-400 bg-rose-50/60' : 'border-gray-200 bg-white'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="STRIPE"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                  className="mt-1 accent-rose-600"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-900">Pay Online with Stripe</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Secure</span>
                  </span>
                  <span className="block text-xs text-gray-600 mt-2">Pay in GBP using supported cards. Apple Pay and Google Pay may appear when eligible.</span>
                  <span className="block text-[11px] text-gray-500 mt-1">Payments are securely processed by Stripe.</span>
                </span>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-rose-400 bg-rose-50/60' : 'border-gray-200 bg-white'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-rose-600"
                />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-gray-900">Cash on Delivery (COD)</span>
                  <span className="block text-xs text-gray-600 mt-1">Pay cash to the delivery partner when your order is delivered. Available only where the delivery service supports cash collection.</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Pricing Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              Order Summary ({items.length} items)
            </h2>

            {/* Items list */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 text-xs">
                  <img src={i.image} alt={i.title} className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 line-clamp-1">{i.title}</p>
                    {i.variation && (
                      <p className="text-[11px] text-gray-500">Option: {i.variation.value}</p>
                    )}
                    {i.personalization && (
                      <p className="text-[10px] text-rose-600 italic line-clamp-1">
                        Note: &quot;{i.personalization}&quot;
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-1 text-gray-600">
                      <span>Qty: {i.quantity}</span>
                      <span className="font-bold text-gray-900">£{Number(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div className="pt-3 border-t border-gray-100">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs uppercase border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-rose-600 transition-all"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <b>{appliedCoupon}</b> applied (-£{Number(discount).toFixed(2)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">£{Number(subtotal).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-£{Number(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <b className="text-emerald-600">FREE</b> : `£${Number(shipping).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="text-rose-700 text-xl font-black">£{Number(total).toFixed(2)}</span>
              </div>
            </div>

            {/* Final Order Placement Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? (paymentMethod === 'STRIPE' ? 'Redirecting to Stripe...' : 'Placing Order...') : paymentMethod === 'COD' ? 'Place COD Order' : `Pay £${Number(total).toFixed(2)} with Stripe`}
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              By confirming, you agree to LTS Party Creations Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

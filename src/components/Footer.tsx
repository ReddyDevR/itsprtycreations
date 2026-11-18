'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, Send, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-rose-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-black text-rose-100 tracking-tight">
                ITSPRTYCREATIONS
              </span>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-0.5">
                LTS Party Creations &bull; Online Shopping Platform
              </p>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Artisan handcrafted greeting cards, custom celebration stationery, and editable party favor wrappers.
              Preserving life&apos;s cherished memories with luxury cardstock, real gold foil, and bespoke design.
            </p>


          </div>

          {/* All Items */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products" className="hover:text-rose-400 transition-colors">All Items</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-rose-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-rose-400 transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-rose-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-amber-400 transition-colors font-semibold">
                  Admin Login
                </Link>
              </li>
              <li className="pt-2 text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  +0800 123 4567
                </span>
              </li>
              <li className="text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  support@itsprtycreations.com
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Join Our VIP Circle
            </h4>
            <p className="text-xs text-stone-400 mb-3">
              Receive exclusive holiday card collections, discount codes, and party printable releases.
            </p>

            {subscribed ? (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl text-xs">
                ✨ Thank you for subscribing! Check your inbox for your 20% coupon code.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Subscribe for 20% Off
                </button>
              </form>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Online Payments via Stripe</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} <b>ITSPRTYCREATIONS</b> (LTS Party Creations). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>UPI Payments</span>
            <span>&bull;</span>
            <span>RuPay / Visa / Mastercard</span>
            <span>&bull;</span>
            <span>Net Banking</span>
            <span>&bull;</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

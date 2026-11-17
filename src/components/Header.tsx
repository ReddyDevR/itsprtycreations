'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { items, setIsCartOpen, wishlist } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Store announcement bar - independent of any marketplace reference */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        Free Nationwide Delivery on Orders Above ₹499 | Use Code <b className="text-amber-300">PARTY20</b> for 20% OFF!
      </div>
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-rose-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex flex-col items-start group">
              <span className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-rose-950 group-hover:text-rose-700 transition-colors">
                ITSPRTYCREATIONS
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-widest text-amber-700 uppercase -mt-1">
                LTS Party Creations &bull; Handcrafted Greetings
              </span>
            </Link>

            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search greeting cards, invitations, chip bags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-rose-200 rounded-full bg-rose-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-rose-400" />
              </div>
            </form>

            {/* Action Buttons: Wishlist, Cart, User / Admin Auth */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Wishlist Link */}
              <Link
                href="/products"
                className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors hidden sm:block"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

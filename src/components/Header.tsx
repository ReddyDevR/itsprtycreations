'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { Product } from '../types';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Shield,
  Trash2,
  ArrowRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();

  const { user, logout, isAdmin } = useAuth();

  const {
    items,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    addToCart,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Wishlist Popup
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    // Load favourite products from the Products API
  const openWishlist = async () => {
    setWishlistOpen(true);
    setWishlistLoading(true);

    try {
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Unable to load favourite products');
      }

      const data = await response.json();

      const allProducts: Product[] = Array.isArray(data.products)
        ? data.products
        : [];

      const selectedProducts = allProducts.filter((product) =>
        wishlist.includes(product.id)
      );

      setFavoriteProducts(selectedProducts);
    } catch (error) {
      console.error('Wishlist loading error:', error);
      setFavoriteProducts([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      {/* Store announcement bar - independent of any marketplace reference */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        Free UK Delivery on Qualifying Orders | Use Code <b className="text-amber-300">PARTY20</b> for 20% OFF!
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
              {/* Wishlist Button */}
<button
  type="button"
  onClick={openWishlist}
  className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors"
  title="View Favourite Products"
  aria-label="Open favourites"
>
  <Heart
    className={`w-5 h-5 transition-all ${
      wishlist.length > 0
        ? 'fill-rose-600 text-rose-600'
        : 'text-gray-700'
    }`}
  />

  {wishlist.length > 0 && (
    <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {wishlist.length}
    </span>
  )}
</button>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User Account / Unified Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-rose-200 hover:border-rose-400 bg-rose-50/50 transition-all text-xs font-semibold text-gray-800"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                    {user.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white font-bold rounded-sm uppercase">
                        Admin
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-rose-100 py-1.5 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 font-bold"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-rose-50"
                      >
                        <Package className="w-4 h-4 text-rose-600" />
                        My Orders & Account
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center justify-between border-t border-rose-100/70 py-2.5 text-xs font-medium text-gray-700">
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-rose-600 transition-colors font-semibold">
                Home
              </Link>
              <Link href="/products" className="hover:text-rose-600 transition-colors">
                All Greetings
              </Link>

              <Link href="/products?featured=true" className="hover:text-rose-600 transition-colors">
                Featured Items
              </Link>
              <Link href="/products?bestseller=true" className="hover:text-rose-600 transition-colors">
                Best Sellers
              </Link>
            </div>


          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-100 bg-white p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </form>

            <div className="space-y-2 text-sm font-medium">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Home</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">All Items</Link>
              <Link href="/products?featured=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Featured Items</Link>
              <Link href="/products?bestseller=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Best Sellers</Link>
            </div>
          </div>
        )}
      </header>

      {/* Customer Sign In Modal; admin authentication uses the same email/password form */}
            <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Favourite Products Popup */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">

          {/* Background */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setWishlistOpen(false)}
          />

          {/* Popup */}
          <div
            className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-cart-popup"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Popup Header */}
            <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between shrink-0">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    My Favourites
                  </h2>

                  <p className="text-xs text-gray-500">
                    {wishlist.length} saved products
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                className="p-2 rounded-full hover:bg-rose-100 text-gray-600 hover:text-rose-600"
                aria-label="Close favourites"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Favourite Products */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50">

              {wishlistLoading ? (
                <div className="py-16 text-center">
                  <div className="w-9 h-9 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />

                  <p className="mt-4 text-sm text-gray-500">
                    Loading your favourite products...
                  </p>
                </div>
              ) : favoriteProducts.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">

                  <Heart className="w-16 h-16 text-rose-200 mb-4" />

                  <h3 className="text-lg font-bold text-gray-800">
                    No Favourite Products
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Click the heart icon on any product to save it here.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setWishlistOpen(false);
                      router.push('/products');
                    }}
                    className="mt-5 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="space-y-3">

                  {favoriteProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 sm:gap-5 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >

                      {/* Product Image */}
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        onClick={() => setWishlistOpen(false)}
                        className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100"
                      >
                        <img
                          src={
                            product.images?.[0]?.url ||
                            '/placeholder.png'
                          }
                          alt={product.title}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">

                        <Link
                          href={`/products/${product.slug || product.id}`}
                          onClick={() => setWishlistOpen(false)}
                          className="text-sm sm:text-base font-bold text-gray-900 hover:text-rose-600 line-clamp-2"
                        >
                          {product.title}
                        </Link>

                        <p className="text-base font-bold text-rose-700 mt-2">
                          £{Number(product.sellingPrice).toFixed(2)}
                        </p>

                        <p className="text-xs text-emerald-600 mt-1">
                          {product.stock > 0
                            ? 'In Stock'
                            : 'Currently Unavailable'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">

                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() => {
                              addToCart(
                                product,
                                1,
                                product.variations?.[0] || null
                              );
                              setWishlistOpen(false);
                            }}
                            className="px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>

                          <Link
                            href={`/products/${product.slug || product.id}`}
                            onClick={() => setWishlistOpen(false)}
                            className="px-3 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          >
                            View Product
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                        </div>
                      </div>

                      {/* Remove Favourite */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(product.id);

                          setFavoriteProducts((prev) =>
                            prev.filter((p) => p.id !== product.id)
                          );
                        }}
                        className="shrink-0 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Remove from favourites"
                        aria-label="Remove favourite"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* Popup Footer */}
            {favoriteProducts.length > 0 && (
              <div className="shrink-0 p-4 border-t border-gray-100 bg-white flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  {favoriteProducts.length} favourite products
                </span>

                <button
                  type="button"
                  onClick={() => setWishlistOpen(false)}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-all"
                >
                  Continue Shopping
                </button>

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

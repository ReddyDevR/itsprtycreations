'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

    const isFavorited = isInWishlist(product.id);

  const primaryMedia = product.images?.[0];

  const primaryImage =
    primaryMedia?.url ||
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80';

  const isPrimaryVideo = primaryMedia?.mediaType === 'VIDEO';

  return (
    <div className="group relative bg-white rounded-2xl border border-rose-100/70 overflow-hidden shadow-xs hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col">
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-rose-50/30">
                <Link
          href={`/products/${product.slug || product.id}`}
          className="block w-full h-full"
        >
          {isPrimaryVideo ? (
            <video
              src={primaryImage}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <img
              src={primaryImage}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
                </Link>

        {/* OUT OF STOCK OVERLAY */}
        {!product.isInStock && (
          <div className="absolute inset-0 z-10 bg-red-950/65 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-xl text-center border border-red-200">
              <span className="block text-red-600 font-extrabold text-lg tracking-wider">
                OUT OF STOCK
              </span>

              <span className="block text-gray-500 text-[10px] mt-1 font-medium">
                Currently unavailable
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white rounded-md shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-white rounded-md shadow-xs">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gray-900 text-white rounded-md shadow-xs">
              New
            </span>
          )}
        </div>

       {/* Wishlist Button */}
<button
  type="button"
  onClick={() => toggleWishlist(product.id)}
  className={`absolute top-2.5 right-2.5 z-20 p-2.5 rounded-full transition-all duration-200 shadow-md ${
    isFavorited
      ? 'bg-rose-100 text-rose-600 scale-110'
      : 'bg-white/90 text-gray-500 hover:text-rose-600 hover:bg-white'
  }`}
  title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
  aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
  aria-pressed={isFavorited}
>
  <Heart
    className={`w-5 h-5 transition-all ${
      isFavorited
        ? 'fill-rose-600 text-rose-600'
        : 'fill-transparent'
    }`}
  />
</button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Link
            href={`/products/${product.slug || product.id}`}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-xs text-gray-800 text-xs font-semibold rounded-xl text-center shadow-md hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </Link>
          <button
  disabled={!product.isInStock}
  onClick={() => addToCart(product, 1, product.variations?.[0] || null)}
  className={`p-2 rounded-xl shadow-md transition-all ${
    product.isInStock
      ? 'bg-rose-600 text-white hover:bg-rose-700'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
  title={product.isInStock ? 'Quick Add to Cart' : 'Out of Stock'}
>
  <ShoppingBag className="w-4 h-4" />
</button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <Link
              href="/products"
              className="text-[10px] uppercase font-bold tracking-wider text-rose-600/80 hover:text-rose-700 transition-colors"
            >
              All Items
            </Link>
          )}

          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-rose-700 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Rating stars simulation */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">(4.9)</span>
          </div>
        </div>

        {/* Fixed Selling Price & Add to Cart */}
<div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">

  <div className="flex flex-col">
    <span className="text-lg font-extrabold text-gray-900">
      £{Number(product.sellingPrice).toFixed(2)}
    </span>

    <span className="text-[10px] text-emerald-600 font-medium">
      Fixed Price
    </span>
  </div>

         <button
  disabled={!product.isInStock}
  onClick={() => addToCart(product, 1, product.variations?.[0] || null)}
  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
    product.isInStock
      ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
      : 'bg-red-100 text-red-600 cursor-not-allowed'
  }`}
>
  <ShoppingBag className="w-3 h-3" />
  {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
</button>
        </div>
      </div>
    </div>
  );
};

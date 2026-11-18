'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariation } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { ProductCard } from '../../../components/ProductCard';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  Star,
  Sparkles,
  Share2,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [selectedMedia, setSelectedMedia] = useState(
  product.images?.[0] || {
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
    mediaType: 'IMAGE' as const,
  }
);

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variations?.[0] || null
  );

  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState('');
  const [copied, setCopied] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const currentPrice = product.sellingPrice;
const originalPrice = product.sellingPrice;
const discountPercent = 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariation, personalization.trim() || null);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariation, personalization.trim() || null);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let specificationsObj: Record<string, string> = {};
  if (product.specifications) {
    try {
      specificationsObj = JSON.parse(product.specifications);
    } catch {
      specificationsObj = { Note: product.specifications };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
         <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-rose-50/50 border border-rose-100 shadow-lg">

  {selectedMedia.mediaType === 'VIDEO' ? (
    <video
      key={selectedMedia.url}
      src={selectedMedia.url}
      controls
      playsInline
      preload="metadata"
      className="w-full h-full object-contain bg-black"
    />
  ) : (
    <img
      src={selectedMedia.url}
      alt={product.title}
      className="w-full h-full object-cover transition-all duration-300"
    />
  )}

  <button
    onClick={() => toggleWishlist(product.id)}
    className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-md ${
      isFavorited
        ? 'bg-rose-50 text-rose-600'
        : 'bg-white/90 text-gray-600 hover:text-rose-600'
    }`}
  >
    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-rose-600' : ''}`} />
  </button>

</div>
         {/* Product Image and Video Gallery */}
{product.images && product.images.length > 1 && (
  <div className="flex gap-3 overflow-x-auto pb-2">

    {product.images.map((media, idx) => (
      <button
        key={media.id || idx}
        onClick={() => setSelectedMedia(media)}
        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
          selectedMedia.url === media.url
            ? 'border-rose-600 shadow-md scale-95'
            : 'border-transparent opacity-70 hover:opacity-100'
        }`}
      >

        {media.mediaType === 'VIDEO' ? (
          <video
            src={media.url}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media.url}
            alt={`Product media ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {media.mediaType === 'VIDEO' && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
            ▶
          </span>
        )}

      </button>
    ))}

  </div>
)}
        </div>

        {/* Right Column: Product Purchasing Info */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm">
          {product.category && (
            <span className="text-xs uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              All Items
            </span>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>

          {/* Rating & Share */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-800">4.9 / 5.0</span>
              <span className="text-xs text-gray-400">&bull; Verified customer reviews</span>
            </div>

            <button
              onClick={handleShare}
              className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
          </div>

          {/* Fixed Selling Price */}
<div className="flex flex-col gap-1">

  <span className="text-3xl font-black text-rose-950">
    £{Number(product.sellingPrice).toFixed(2)}
  </span>

  <span className="text-xs font-semibold text-emerald-600">
    Fixed Selling Price
  </span>

</div>
          <p className="text-[11px] text-gray-500">
            UK delivery available • Secure online checkout
          </p>

          {/* Variations Selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Select Option / Package
              </label>
              <div className="space-y-2">
                {product.variations.map((v) => {
                  const isSelected = selectedVariation?.id === v.id || selectedVariation?.value === v.value;
                  return (
                    <button
                      key={v.id || v.value}
                      onClick={() => setSelectedVariation(v)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/50 shadow-xs font-semibold text-rose-950'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{v.value}</span>
                      </div>
                      <span className="font-bold">
                        {v.priceAdjustment > 0
  ? `+£${Number(v.priceAdjustment).toFixed(2)}`
  : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalization Options */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Add Personalization (Optional)
            </label>
            <p className="text-[11px] text-gray-500">
              Provide celebrant&apos;s name, age, event date, or custom greeting message to be printed.
            </p>
            <textarea
              rows={2}
              placeholder="e.g. Maya Sharma, 5th Birthday, 'Thank you for celebrating with me!'"
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold"
              >
                -
              </button>
              <span className="px-4 text-xs font-bold text-gray-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">In Stock & Ready</span>
          </div>

          {/* CTAs: Add to Cart & Buy Now */}
          <div className="space-y-2.5 pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Shopping Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Buy It Now &bull; Instant Checkout
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Free UK delivery on orders over £50</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Secure Stripe Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-rose-100 shadow-xs space-y-8">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-rose-100">
            Product Description & Details
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>{product.description}</p>
            {product.details && (
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mt-4">
                <h4 className="text-xs font-bold text-rose-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Craftsmanship & Assembly Notes
                </h4>
                <p className="text-xs text-gray-600">{product.details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(specificationsObj).length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(specificationsObj).map(([k, v]) => (
                <div key={k} className="p-3 bg-gray-50 rounded-xl flex justify-between text-xs">
                  <span className="font-medium text-gray-500">{k}</span>
                  <span className="font-bold text-gray-900">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Related Greeting Cards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

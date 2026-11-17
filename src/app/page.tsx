import Link from 'next/link';
import prisma from '../lib/prisma';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Gift,
  Star,
} from 'lucide-react';

export const revalidate = 0; // Always dynamic from DB

async function getHomeData() {
  const [featuredProducts, bestSellers, newArrivals, settingsList] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variations: true,
      },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isBestSeller: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variations: true,
      },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variations: true,
      },
    }),
    prisma.websiteSetting.findMany(),
  ]);

  const settings: Record<string, any> = {};
  settingsList.forEach((s) => {
    try {
      settings[s.key] = JSON.parse(s.value);
    } catch {
      settings[s.key] = s.value;
    }
  });

  return {
    featuredProducts,
    bestSellers,
    newArrivals,
    settings,
  };
}

export default async function HomePage() {
  const { featuredProducts, bestSellers, newArrivals, settings } = await getHomeData();

  const hero = settings.hero_banner || {
    badge: 'Crafted with Love by LTS Party Creations',
    title: 'Heirloom Greeting Cards & Custom Party Celebrations',
    subtitle:
      'From milestone birthdays and romantic anniversaries to bespoke personalized stationery, discover handcrafted greetings that preserve life’s sweetest moments.',
    primaryButtonText: 'Explore Greeting Cards',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Custom Personalized Cards',
    secondaryButtonLink: '/products',
  };

  const testimonials = [
    {
      name: 'Ananya S.',
      location: 'Bangalore, India',
      rating: 5,
      review:
        'The Pink Bow Chip Bag wrappers and birthday cards were the absolute highlight of my daughter’s 1st birthday! The paper quality and print clarity were beyond stunning.',
      item: 'Pink Bow Custom Favor Suite',
    },
    {
      name: 'Rohan Mehra',
      location: 'Mumbai, India',
      rating: 5,
      review:
        'Ordered the Golden 50th Anniversary keepsake card for my parents. The real gold foil and personalized calligraphy brought tears to their eyes. Truly heirloom quality.',
      item: 'Golden Milestone Keepsake Card',
    },
    {
      name: 'Sneha Reddy',
      location: 'Hyderabad, India',
      rating: 5,
      review:
        'The Canva templates are easy to customize and the instant delivery made planning our celebration simple.',
      item: 'Teddy Bear Baby Shower Suite',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hero.badge}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15]">
                {hero.title}
              </h1>

              <p className="text-sm sm:text-base text-rose-100 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href={hero.primaryButtonLink}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-rose-950 font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-rose-50 hover:shadow-xl transition-all shadow-md text-center"
                >
                  {hero.primaryButtonText}
                </Link>
                <Link
                  href={hero.secondaryButtonLink}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 border border-white/20 text-white font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-white/20 transition-all text-center flex items-center justify-center gap-2"
                >
                  {hero.secondaryButtonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&q=80"
                    alt="LTS Party Creations Handcrafted Stationery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-gray-950 rounded-md w-fit mb-2">
                      Handcrafted &bull; Made in India
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white">
                      Bespoke Greeting Cards & Party Favors
                    </h3>
                    <p className="text-xs text-rose-200 mt-1">
                      Designed with love by Roselyn at LTS Party Creations
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white text-rose-950 p-4 rounded-2xl shadow-xl border border-rose-100 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">100% Authentic Listings</p>
                    <p className="text-[11px] text-gray-500">Made with care for your celebrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Props Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-lg border border-rose-100">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Free Nationwide Shipping</h4>
              <p className="text-[11px] text-gray-500">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Carefully Curated Designs</h4>
              <p className="text-[11px] text-gray-500">Thoughtful designs for every occasion</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Custom Personalization</h4>
              <p className="text-[11px] text-gray-500">Add names, photos & heartfelt notes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Secure Razorpay Checkout</h4>
              <p className="text-[11px] text-gray-500">UPI, Cards, Net Banking & COD</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Greeting Cards */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-rose-600">
                Staff Picks
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Featured Greeting Cards
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 mt-2 sm:mt-0"
            >
              View All Featured
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Special Promotional Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 via-rose-800 to-rose-950 text-white p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-200 tracking-wider uppercase inline-block">
              Limited Time Special Offer
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Enjoy 20% OFF Your Entire Celebration Suite
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 font-light leading-relaxed">
              Planning a birthday, milestone anniversary, or baby shower? Use code{' '}
              <b className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">PARTY20</b> at checkout
              to save 20% on any greeting card or custom party printable!
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-rose-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-50 transition-all shadow-md"
              >
                Claim Discount & Shop Now
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-white/20 transition-all"
              >
                Custom Bespoke Cards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Best-Selling Products */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-rose-600">
                Customer Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Best-Selling Celebrations
              </h2>
            </div>
            <Link
              href="/products?bestseller=true"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 mt-2 sm:mt-0"
            >
              View All Best Sellers
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* 7. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-rose-600">
                Fresh Designs
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products?newarrival=true"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 mt-2 sm:mt-0"
            >
              View All New Arrivals
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Customer Testimonials */}
      <section className="bg-rose-50/50 py-16 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-600">
              Happy Celebrants
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Loved by Customers Nationwide
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Read authentic feedback from shoppers who trusted LTS Party Creations for their special events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    &quot;{t.review}&quot;
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.name}</h4>
                    <p className="text-[10px] text-gray-400">{t.location}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {t.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

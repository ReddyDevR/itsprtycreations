import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { Filter, Sparkles, Search, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0; // Dynamic from DB

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    featured?: string;
    bestseller?: string;
    newarrival?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search, sort = 'newest', featured, bestseller, newarrival } = searchParams;

  const where: any = { isPublished: true };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (featured === 'true') where.isFeatured = true;
  if (bestseller === 'true') where.isBestSeller = true;
  if (newarrival === 'true') where.isNewArrival = true;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-low') orderBy = { sellingPrice: 'asc' };
  if (sort === 'price-high') orderBy = { sellingPrice: 'desc' };
  if (sort === 'title-asc') orderBy = { title: 'asc' };

  const [products, categories, activeCategory] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variations: true,
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    category
      ? prisma.category.findUnique({ where: { slug: category } })
      : null,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
            Official LTS Party Creations Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1">
            {activeCategory ? activeCategory.name : 'All Greeting Cards & Stationery'}
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-2 font-light">
            {activeCategory?.description ||
              'Explore handcrafted greeting cards, party favor wrappers, and bespoke celebration suites with transparent pricing.'}
          </p>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !category
              ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300 hover:text-rose-700'
          }`}
        >
          All Greetings
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat.slug
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300 hover:text-rose-700'
            }`}
          >
            {cat.name} ({cat._count?.products || 0})
          </Link>
        ))}
      </div>

      {/* Filters & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
        <div className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-900">{products.length}</span> greeting cards
          {search && (
            <span>
              {' '}
              matching &quot;<b className="text-rose-600">{search}</b>&quot;
            </span>
          )}
        </div>

        {/* Sorting Dropdown Links */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort By:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sort: 'newest' })}`}
              className={`px-2.5 py-1 rounded-lg ${sort === 'newest' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Newest
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sort: 'price-low' })}`}
              className={`px-2.5 py-1 rounded-lg ${sort === 'price-low' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sort: 'price-high' })}`}
              className={`px-2.5 py-1 rounded-lg ${sort === 'price-high' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-rose-100 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No greeting cards found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or browsing another category.
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-all"
          >
            Clear Filters & View All
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}

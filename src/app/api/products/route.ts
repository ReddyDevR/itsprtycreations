import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getAuthUser } from '../../../lib/auth';
import { slugify } from '../../../lib/slug';

async function ensureAllItemsCategory() {
  const category = await prisma.category.upsert({
    where: { slug: 'all-items' },
    update: { name: 'All Items', isActive: true },
    create: {
      name: 'All Items',
      slug: 'all-items',
      description: 'All products',
      isActive: true,
      displayOrder: 0,
    },
  });

  // Preserve all products and images while assigning every product to All Items.
  await prisma.product.updateMany({
    where: { categoryId: { not: category.id } },
    data: { categoryId: category.id },
  });

  return category;
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const bestSeller = searchParams.get('bestseller');
    const newArrival = searchParams.get('newarrival');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // Verify admin if requesting unpublished items
    let canViewUnpublished = false;
    if (includeUnpublished) {
      const user = await getAuthUser(req);
      if (user?.role === 'ADMIN') {
        canViewUnpublished = true;
      }
    }

    await ensureAllItemsCategory();

    const where: any = {};

    if (!canViewUnpublished) {
      where.isPublished = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featured === 'true') where.isFeatured = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (newArrival === 'true') where.isNewArrival = true;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { sellingPrice: 'asc' };
    if (sort === 'price-high') orderBy = { sellingPrice: 'desc' };
    if (sort === 'title-asc') orderBy = { title: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variations: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      originalPrice,
      sellingPrice,
      stock,
      details,
      specifications,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      images,
      variations,
    } = body;

    if (
  !title?.trim() ||
  sellingPrice === undefined ||
  Number(sellingPrice) <= 0
) {
  return NextResponse.json(
    { error: 'Valid product title and selling price are required' },
    { status: 400 }
  );
}

    // Validate product media URLs (maximum 6)
if (
  !Array.isArray(images) ||
  images.length < 1 ||
  images.length > 6
) {
  return NextResponse.json(
    { error: 'Add between 1 and 6 product media URLs.' },
    { status: 400 }
  );
}

const mediaItems = [];

for (const img of images) {
  const url = (
    typeof img === 'string' ? img : img?.url
  )?.trim();

  if (!url) {
    return NextResponse.json(
      { error: 'Every media item must have a URL.' },
      { status: 400 }
    );
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    const isVideo = parsed.pathname
      .toLowerCase()
      .endsWith('.mp4');

    mediaItems.push({
      url,
      mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    });

  } catch {
    return NextResponse.json(
      { error: `Invalid media URL: ${url}` },
      { status: 400 }
    );
  }
}
    const allItemsCategory = await ensureAllItemsCategory();

    const sellPrice = Number(sellingPrice);

if (!Number.isFinite(sellPrice) || sellPrice <= 0) {
  return NextResponse.json(
    { error: 'Enter a valid selling price.' },
    { status: 400 }
  );
}

const origPrice = sellPrice;
const discountPercent = 0;

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug,
        description: description || '',
        originalPrice: origPrice,
        sellingPrice: sellPrice,
        discountPercent,
        stock: Number(stock) || 100,
        categoryId: allItemsCategory.id,
        details: details || '',
        specifications: specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        images: {
        create: mediaItems.map((item, idx) => ({
        url: item.url,
        mediaType: item.mediaType,
       alt: `${title} media ${idx + 1}`,
       isPrimary: idx === 0,
       displayOrder: idx,
       })),
       },
        variations: {
          create: (variations || []).map((v: any) => ({
            name: v.name || 'Option',
            value: v.value || 'Standard',
            priceAdjustment: Number(v.priceAdjustment) || 0,
            stock: Number(v.stock) || 100,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variations: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully under All Items',
      product,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

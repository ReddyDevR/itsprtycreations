import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { slugify } from '@/lib/slug';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
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

    const where: any = {};

    if (!canViewUnpublished) {
      where.isPublished = true;
    }

    if (category) {
      where.category = {
        slug: category,
      };
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
      categoryId,
      details,
      specifications,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      images,
      variations,
    } = body;

    if (!title || !categoryId || sellingPrice === undefined) {
      return NextResponse.json(
        { error: 'Title, category, and selling price are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length < 1 || images.length > 500) {
      return NextResponse.json({ error: 'Add between 1 and 500 product images.' }, { status: 400 });
    }
    if (images.some((img: any) => !(typeof img === 'string' ? img : img?.url))) {
      return NextResponse.json({ error: 'Every product image must have a valid URL.' }, { status: 400 });
    }

    const origPrice = Number(originalPrice) || Number(sellingPrice);
    const sellPrice = Number(sellingPrice);
    const discountPercent =
      origPrice > sellPrice ? Math.round(((origPrice - sellPrice) / origPrice) * 100) : 0;

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
        categoryId,
        details: details || '',
        specifications: specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: typeof img === 'string' ? img : img.url,
            alt: typeof img === 'string' ? `${title} photo` : (img.alt || `${title} photo`),
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
      message: 'Greeting card created successfully',
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

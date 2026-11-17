import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variations: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isPublished: true,
      },
      take: 4,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error: any) {
    console.error('Fetch product by id error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const origPrice = body.originalPrice !== undefined ? Number(body.originalPrice) : existing.originalPrice;
    const sellPrice = body.sellingPrice !== undefined ? Number(body.sellingPrice) : existing.sellingPrice;
    const discountPercent =
      origPrice > sellPrice ? Math.round(((origPrice - sellPrice) / origPrice) * 100) : 0;

    // Update product images and videos
if (Array.isArray(body.images)) {

  if (body.images.length < 1 || body.images.length > 6) {
    return NextResponse.json(
      { error: 'Add between 1 and 6 media URLs.' },
      { status: 400 }
    );
  }

  const mediaItems = body.images.map((img: any) => {
    const url = (
      typeof img === 'string' ? img : img?.url
    )?.trim();

    if (!url) {
      throw new Error('Invalid media URL.');
    }

    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported.');
    }

    return {
      url,
      mediaType: parsed.pathname.toLowerCase().endsWith('.mp4')
        ? 'VIDEO'
        : 'IMAGE',
    };
  });

  await prisma.productImage.deleteMany({
    where: { productId: id },
  });

  await prisma.productImage.createMany({
    data: mediaItems.map((item, idx) => ({
      productId: id,
      url: item.url,
      mediaType: item.mediaType,
      alt: `${body.title || existing.title} media ${idx + 1}`,
      isPrimary: idx === 0,
      displayOrder: idx,
    })),
  });
}
    // Update variations if provided
    if (Array.isArray(body.variations)) {
      await prisma.productVariation.deleteMany({ where: { productId: id } });
      await prisma.productVariation.createMany({
        data: body.variations.map((v: any) => ({
          productId: id,
          name: v.name || 'Option',
          value: v.value || 'Standard',
          priceAdjustment: Number(v.priceAdjustment) || 0,
          stock: Number(v.stock) || 100,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        originalPrice: origPrice,
        sellingPrice: sellPrice,
        discountPercent,
        stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
        categoryId: body.categoryId || existing.categoryId,
        details: body.details !== undefined ? body.details : existing.details,
        specifications: body.specifications !== undefined
          ? (typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications))
          : existing.specifications,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
        isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : existing.isBestSeller,
        isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : existing.isNewArrival,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : existing.isPublished,
      },
      include: {
        category: true,
        images: true,
        variations: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

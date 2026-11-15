import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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

    // Update images if provided (maximum 500 per product).
    if (Array.isArray(body.images)) {
      if (body.images.length > 500) return NextResponse.json({ error: 'A product can contain a maximum of 500 images.' }, { status: 400 });
      if (body.images.some((img: any) => !(typeof img === 'string' ? img : img?.url))) return NextResponse.json({ error: 'Every product image must have a valid URL.' }, { status: 400 });
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: body.images.map((img: any, idx: number) => ({
          productId: id,
          url: typeof img === 'string' ? img : img.url,
          alt: typeof img === 'string' ? `${body.title || existing.title} view` : (img.alt || 'Product view'),
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

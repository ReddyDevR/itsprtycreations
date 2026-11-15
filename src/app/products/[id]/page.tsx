import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = 0; // Dynamic from DB

interface PageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variations: true,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isPublished: true,
    },
    take: 4,
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variations: true,
    },
  });

  return (
    <ProductDetailClient
      product={product as any}
      relatedProducts={relatedProducts as any}
    />
  );
}

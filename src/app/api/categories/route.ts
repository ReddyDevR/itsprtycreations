import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuthUser } from '../../../lib/auth';
import { slugify } from '../../../lib/slug';
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const where = all ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin role required' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // INITIALIZE DEFAULT GREETING CATEGORIES
    if (body.action === 'seedDefaults') {
      const defaultCategories = [
        'Birthday Greetings',
        'Anniversary Greetings',
        'Wedding Greetings',
        "Valentine's Day Greetings",
        'Christmas Greetings',
        'New Year Greetings',
        'Thank You Greetings',
        'Congratulations Greetings',
        'Friendship Greetings',
        'Love Greetings',
        "Mother's Day Greetings",
        "Father's Day Greetings",
        'Custom Greetings',
        'All Other Greetings',
      ];

      const existingCategories = await prisma.category.findMany({
        select: { slug: true },
      });

      const existingSlugs = new Set(
        existingCategories.map((category) => category.slug)
      );

      const categoriesToCreate = defaultCategories
        .map((name, index) => ({
          name,
          slug: slugify(name),
          displayOrder: index + 1,
          isActive: true,
        }))
        .filter((category) => !existingSlugs.has(category.slug));

      if (categoriesToCreate.length > 0) {
        await prisma.category.createMany({
          data: categoriesToCreate,
          skipDuplicates: true,
        });
      }

      const categories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      return NextResponse.json({
        success: true,
        message: 'Default greeting categories initialized successfully',
        categories,
      });
    }

    const { name, description, image, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
        image: image || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id, name, description, image, displayOrder, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

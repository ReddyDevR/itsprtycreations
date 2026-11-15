import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalOrders,
      pendingOrders,
      completedOrders,
      paidOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          items: true,
        },
      }),
    ]);

    const totalSales = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Group sales by month
    const monthlyRevenueMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed current year months
    const currentYear = new Date().getFullYear();
    for (let m = 0; m < 12; m++) {
      monthlyRevenueMap[`${months[m]} ${currentYear}`] = 0;
    }

    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + o.totalAmount;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales,
        monthlyRevenue: Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
          month,
          revenue,
        })),
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin statistics' }, { status: 500 });
  }
}

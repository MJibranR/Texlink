import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    
    // Get total approved products
    const productsResult = await query('SELECT COUNT(*) as count FROM products WHERE is_approved = true');
    
    // Get total orders
    const ordersResult = await query('SELECT COUNT(*) as count FROM orders');
    
    // Get total revenue (from completed orders)
    const revenueResult = await query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = \'delivered\'');
    
    // Get pending seller applications
    const pendingAppsResult = await query('SELECT COUNT(*) as count FROM seller_applications WHERE status = \'pending\'');
    
    // Get monthly revenue
    const monthlyRevenueResult = await query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM orders 
      WHERE status = 'delivered' 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    
    return NextResponse.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      pendingVerifications: 0,
      pendingApplications: parseInt(pendingAppsResult.rows[0].count),
      monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0].total)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    console.log('Fetching stats for user:', userId);
    
    // Get products count only (removed views and inquiries columns)
    const productsResult = await query(`
      SELECT 
        COUNT(*) as count 
      FROM products 
      WHERE seller_id = $1
    `, [userId]);
    
    // Get orders count
    const ordersResult = await query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE buyer_id = $1
    `, [userId]);
    
    // Get pending approval products
    const pendingResult = await query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE seller_id = $1 AND is_approved = false
    `, [userId]);
    
    const stats = {
      totalProducts: parseInt(productsResult.rows[0]?.count) || 0,
      totalOrders: parseInt(ordersResult.rows[0]?.count) || 0,
      totalViews: 0, // Default since column doesn't exist
      totalInquiries: 0, // Default since column doesn't exist
      pendingApproval: parseInt(pendingResult.rows[0]?.count) || 0
    };
    
    console.log('Stats fetched:', stats);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      totalProducts: 0,
      totalOrders: 0,
      totalViews: 0,
      totalInquiries: 0,
      pendingApproval: 0
    });
  }
}
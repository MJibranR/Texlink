import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total approved products
    const productsResult = await query('SELECT COUNT(*) as count FROM products WHERE is_approved = true');
    
    // Get total sellers (users with role 'seller')
    const sellersResult = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['seller']);
    
    // Get total buyers (users with role 'buyer')
    const buyersResult = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['buyer']);
    
    return NextResponse.json({
      totalProducts: parseInt(productsResult.rows[0].count),
      totalSuppliers: parseInt(sellersResult.rows[0].count),
      totalBuyers: parseInt(buyersResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
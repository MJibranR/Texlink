import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    console.log('Fetching products for user:', userId);
    
    // Get all products where seller_id matches the user (removed inquiry_count and views_count if they don't exist)
    const products = await query(`
      SELECT 
        p.id,
        p.title,
        p.price,
        p.unit,
        p.status,
        p.is_approved,
        p.created_at,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM products p
      WHERE p.seller_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);
    
    console.log(`Found ${products.rows.length} products for user ${userId}`);
    
    // Return products with default values for views and inquiries
    const productsWithDefaults = products.rows.map(p => ({
      ...p,
      views_count: 0,
      inquiry_count: 0
    }));
    
    return NextResponse.json(productsWithDefaults);
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json([]); // Return empty array on error
  }
}
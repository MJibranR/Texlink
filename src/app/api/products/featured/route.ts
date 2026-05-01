import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await query(`
    SELECT p.*, 
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
    FROM products p
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT 4
  `);
  
  return NextResponse.json(products.rows);
}
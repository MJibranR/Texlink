import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Get single product
    const product = await query(`
      SELECT p.*, u.company_name as seller_name, u.city as seller_city,
             (SELECT json_agg(image_url) FROM product_images WHERE product_id = p.id) as images
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1 AND p.is_approved = true
    `, [id]);
    return NextResponse.json(product.rows[0]);
  }
  
  // Get all approved products for marketplace
  const products = await query(`
    SELECT p.*, u.company_name as seller_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
    FROM products p
    JOIN users u ON p.seller_id = u.id
    WHERE p.is_approved = true AND p.status = 'active'
    ORDER BY p.created_at DESC
  `);
  
  return NextResponse.json(products.rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, category, description, price, unit, 
      quantity_available, minimum_order, city, seller_id, images 
    } = body;
    
    // Insert product
    const result = await query(
      `INSERT INTO products (seller_id, title, category, description, price, unit, quantity_available, minimum_order, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [seller_id, title, category, description, price, unit, quantity_available, minimum_order, city]
    );
    
    const product = result.rows[0];
    
    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
          [product.id, images[i], i === 0]
        );
      }
    }
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
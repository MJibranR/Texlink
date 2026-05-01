import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const products = await query(`
      SELECT 
        p.*,
        u.full_name as seller_name,
        u.company_name as seller_company,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM products p
      JOIN users u ON p.seller_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    return NextResponse.json(products.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      seller_id, title, category, description, price, unit, 
      quantity_available, minimum_order, city, images 
    } = body;
    
    console.log('Creating product for seller:', seller_id); // Debug log
    
    // Insert product
    const result = await query(
      `INSERT INTO products (seller_id, title, category, description, price, unit, 
        quantity_available, minimum_order, city, is_approved, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
       RETURNING *`,
      [seller_id, title, category, description, price, unit, 
       quantity_available, minimum_order, city, true]
    );
    
    const product = result.rows[0];
    
    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          await query(
            `INSERT INTO product_images (product_id, image_url, is_primary) 
             VALUES ($1, $2, $3)`,
            [product.id, images[i], i === 0]
          );
        }
      }
    }
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { productId, action } = await request.json();
    
    if (action === 'approve') {
      await query(
        'UPDATE products SET is_approved = true, approved_at = CURRENT_TIMESTAMP WHERE id = $1',
        [productId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    // Delete images first
    await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    // Delete product
    await query('DELETE FROM products WHERE id = $1', [productId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
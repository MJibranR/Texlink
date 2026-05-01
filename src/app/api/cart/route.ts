import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const cartItems = await query(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.title,
        p.price,
        p.unit,
        u.company_name as seller_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = $1 AND p.is_approved = true
    `, [userId]);
    
    return NextResponse.json(cartItems.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, quantity } = body;
    
    console.log('Cart POST - Received:', { userId, productId, quantity });
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Valid quantity required' }, { status: 400 });
    }
    
    // Check if product exists
    const productCheck = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check if item already exists in cart
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    if (existing.rows.length > 0) {
      // Update existing
      const newQuantity = existing.rows[0].quantity + quantity;
      const result = await query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, userId, productId]
      );
      console.log('Updated cart item:', result.rows[0]);
      return NextResponse.json(result.rows[0]);
    } else {
      // Insert new
      const result = await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, productId, quantity]
      );
      console.log('Added new cart item:', result.rows[0]);
      return NextResponse.json(result.rows[0], { status: 201 });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart: ' + (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, productId, quantity } = await request.json();
    
    const result = await query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, userId, productId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    
    if (productId) {
      await query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
    } else {
      await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
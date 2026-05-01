import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const limit = searchParams.get('limit');
    
    let queryText = `
      SELECT id, full_name, email, company_name, phone, role, city, is_verified, created_at
      FROM users
    `;
    
    if (role && role !== 'all') {
      queryText += ` WHERE role = '${role}'`;
    }
    
    queryText += ` ORDER BY created_at DESC`;
    
    if (limit) {
      queryText += ` LIMIT ${limit}`;
    }
    
    const users = await query(queryText);
    
    return NextResponse.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { full_name, email, password, company_name, phone, role, city } = await request.json();
    
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, company_name, phone, role, city, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP) RETURNING id`,
      [full_name, email, hashedPassword, company_name, phone, role, city]
    );
    
    return NextResponse.json({ success: true, userId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, action, is_verified, role, full_name, email, phone, company_name, city } = await request.json();
    
    if (action === 'verify') {
      await query('UPDATE users SET is_verified = $1 WHERE id = $2', [is_verified, userId]);
    } else if (action === 'role') {
      await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    } else if (action === 'update') {
      await query(
        `UPDATE users SET 
          full_name = $1, 
          email = $2, 
          phone = $3, 
          company_name = $4, 
          city = $5,
          role = $6,
          is_verified = $7
        WHERE id = $8`,
        [full_name, email, phone, company_name, city, role, is_verified, userId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    console.log('Deleting user:', userId);
    
    // Check if user exists
    const userCheck = await query('SELECT id, email, full_name, role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('Found user to delete:', userCheck.rows[0]);
    
    // Delete in correct order - only from tables that exist
    
    // 1. Delete from cart_items
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    console.log('Deleted from cart_items');
    
    // 2. Delete from inquiries
    await query('DELETE FROM inquiries WHERE buyer_id = $1 OR seller_id = $1', [userId]);
    console.log('Deleted from inquiries');
    
    // 3. Delete seller applications (this will cascade to products if set up correctly)
    await query('DELETE FROM seller_applications WHERE user_id = $1', [userId]);
    console.log('Deleted from seller_applications');
    
    // 4. Delete products (in case they weren't deleted by cascade)
    await query('DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE seller_id = $1)', [userId]);
    await query('DELETE FROM products WHERE seller_id = $1', [userId]);
    console.log('Deleted from products and product_images');
    
    // 5. Delete orders and order items
    await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE buyer_id = $1)', [userId]);
    await query('DELETE FROM orders WHERE buyer_id = $1', [userId]);
    console.log('Deleted from orders and order_items');
    
    // 6. Try to delete from wishlist and reviews (ignore if tables don't exist)
    try {
      await query('DELETE FROM wishlist WHERE user_id = $1', [userId]);
      console.log('Deleted from wishlist');
    } catch (err) {
      console.log('wishlist table not found or no user_id column, skipping');
    }
    
    try {
      await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
      console.log('Deleted from reviews');
    } catch (err) {
      console.log('reviews table not found or no user_id column, skipping');
    }
    
    // 7. Finally delete the user
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User deleted successfully:', userId);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user: ' + (error as Error).message }, { status: 500 });
  }
}
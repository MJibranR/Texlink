import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const orders = await query(`
      SELECT 
        o.*,
        u.full_name as buyer_name,
        u.email as buyer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    return NextResponse.json(orders.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json();
    
    await query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
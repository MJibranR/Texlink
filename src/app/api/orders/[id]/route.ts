import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // Get order details
    const orderResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.created_at,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.notes,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      WHERE o.id = $1
    `, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await query(`
      SELECT 
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        p.title as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    
    const items = itemsResult.rows.map((item: any) => ({
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total: parseFloat(item.total_price)
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    const invoice = {
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_address: order.shipping_address || 'Not specified',
      items: items,
      subtotal: subtotal,
      total: parseFloat(order.total_amount),
      status: order.status
    };
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
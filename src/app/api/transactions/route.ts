import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_id,
      quantity,
      company_name,
      contact_person,
      email,
      phone,
      shipping_address,
      notes,
      preferred_delivery_date,
      budget_range
    } = body;

    // Get user ID from token or create temp user
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId = null;
    
    if (token) {
      // Simple token verification (you can implement proper JWT verification)
      const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    }

    // Create transaction/quote request
    const orderNumber = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const result = await query(
      `INSERT INTO orders (
        order_number, buyer_id, total_amount, status, payment_status, 
        shipping_address, notes, created_at
      ) VALUES ($1, $2, $3, 'pending', 'unpaid', $4, $5, CURRENT_TIMESTAMP)
      RETURNING id`,
      [orderNumber, userId, 0, shipping_address, notes]
    );

    const orderId = result.rows[0].id;

    // Add quote request details to a separate table (create if not exists)
    await query(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        company_name VARCHAR(255),
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        preferred_delivery_date DATE,
        budget_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(
      `INSERT INTO quote_requests (
        order_id, product_id, quantity, company_name, contact_person, 
        email, phone, preferred_delivery_date, budget_range, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
      [orderId, product_id, quantity, company_name, contact_person, email, phone, preferred_delivery_date, budget_range]
    );

    return NextResponse.json({ 
      success: true, 
      orderId, 
      orderNumber,
      message: 'Quote request submitted successfully' 
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    
    const quotes = await query(`
      SELECT 
        qr.*,
        o.order_number,
        o.created_at as order_date,
        p.title as product_title,
        p.price as product_price,
        p.unit as product_unit,
        u.full_name as seller_name
      FROM quote_requests qr
      JOIN orders o ON qr.order_id = o.id
      JOIN products p ON qr.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE qr.status = $1
      ORDER BY qr.created_at DESC
    `, [status]);
    
    return NextResponse.json(quotes.rows);
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
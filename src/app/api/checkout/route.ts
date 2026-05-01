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
      budget_range
    } = body;

    console.log('Received data:', { product_id, quantity, company_name, contact_person, email, phone, shipping_address });

    // Validate required fields
    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Valid quantity is required' }, { status: 400 });
    }
    if (!company_name || company_name.trim() === '') {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!contact_person || contact_person.trim() === '') {
      return NextResponse.json({ error: 'Contact person is required' }, { status: 400 });
    }
    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!phone || phone.trim() === '') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!shipping_address || shipping_address.trim() === '') {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Get product details
    const productResult = await query('SELECT price, title, seller_id FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const product = productResult.rows[0];
    const totalAmount = product.price * quantity;

    // Get or create user
    let userId = null;
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      // Create temporary user
      const newUser = await query(
        `INSERT INTO users (full_name, email, company_name, phone, role, is_verified) 
         VALUES ($1, $2, $3, $4, 'buyer', false) RETURNING id`,
        [contact_person, email, company_name, phone]
      );
      userId = newUser.rows[0].id;
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderResult = await query(
      `INSERT INTO orders (order_number, buyer_id, total_amount, status, payment_status, shipping_address, notes, created_at)
       VALUES ($1, $2, $3, 'pending', 'unpaid', $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
      [orderNumber, userId, totalAmount, shipping_address, notes || '']
    );

    const orderId = orderResult.rows[0].id;

    // Create order item
    await query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, product_id, quantity, product.price, totalAmount]
    );

    // Create quote_requests table if not exists
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
        budget_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(
      `INSERT INTO quote_requests (order_id, product_id, quantity, company_name, contact_person, email, phone, budget_range, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [orderId, product_id, quantity, company_name, contact_person, email, phone, budget_range || '']
    );

    return NextResponse.json({ 
      success: true, 
      orderId, 
      orderNumber,
      message: 'Quote request submitted successfully' 
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    return NextResponse.json({ error: 'Failed to submit request: ' + (error as Error).message }, { status: 500 });
  }
}
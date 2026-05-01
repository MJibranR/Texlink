import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, phone, quantity, message, listingId, sellerId } = await request.json();
    
    // First, get or create a user account for the inquirer
    let userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    let buyerId: number;
    
    if (userResult.rows.length === 0) {
      // Create a temporary user account
      const createUser = await query(
        `INSERT INTO users (email, full_name, phone, role, password_hash) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, name, phone, 'buyer', 'temporary']
      );
      buyerId = createUser.rows[0].id;
    } else {
      buyerId = userResult.rows[0].id;
    }
    
    // Create inquiry
    const inquiryResult = await query(
      `INSERT INTO inquiries (buyer_id, seller_id, listing_id, message, status) 
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [buyerId, sellerId, listingId, message]
    );
    
    // Update listing inquiry count
    await query(
      'UPDATE listings SET inquiry_count = inquiry_count + 1 WHERE id = $1',
      [listingId]
    );
    
    return NextResponse.json({ 
      success: true, 
      inquiryId: inquiryResult.rows[0].id 
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
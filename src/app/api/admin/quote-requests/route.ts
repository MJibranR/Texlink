import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { id, status, replyMessage } = await request.json();
    
    await query(
      `UPDATE quote_requests 
       SET status = $1, 
           admin_notes = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, replyMessage, id]
    );
    
    // Also update the related order status
    await query(
      `UPDATE orders 
       SET status = $1 
       WHERE id = (SELECT order_id FROM quote_requests WHERE id = $2)`,
      [status === 'approved' ? 'confirmed' : status, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quote request:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
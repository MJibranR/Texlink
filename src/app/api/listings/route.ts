import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token || '');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, category, subcategory, material_type, description, price, unit, quantity_available, minimum_order, city } = body;
    
    const result = await query(
      `INSERT INTO listings (seller_id, title, category, subcategory, material_type, description, price, unit, quantity_available, minimum_order, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [user.id, title, category, subcategory, material_type, description, price, unit, quantity_available, minimum_order, city]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await query(`
    SELECT category, COUNT(*) as count 
    FROM products 
    WHERE status = 'active' AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `);
  
  return NextResponse.json(categories.rows);
}
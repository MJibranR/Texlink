import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const cities = await query(`
    SELECT city, COUNT(*) as count 
    FROM products 
    WHERE status = 'active' AND city IS NOT NULL
    GROUP BY city
    ORDER BY count DESC
  `);
  
  return NextResponse.json(cities.rows);
}
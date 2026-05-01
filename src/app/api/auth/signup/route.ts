import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, company_name, phone, role, city } = body;
    
    console.log('Signup attempt:', { email, full_name, role }); // Debug log
    
    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, company_name, phone, role, city, is_verified, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, CURRENT_TIMESTAMP) 
       RETURNING id, email, full_name, company_name, role`,
      [full_name, email, hashedPassword, company_name || null, phone || null, role || 'buyer', city || null]
    );
    
    const user = result.rows[0];
    console.log('User created:', user); // Debug log
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: user.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
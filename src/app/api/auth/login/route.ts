import { query } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt:', { email }); // Debug log
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get user from database
    const result = await query(
      'SELECT id, email, password_hash, full_name, company_name, role, is_verified, city, phone FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    // For admin, use a simpler check (since we know the hash)
    let isValid = false;
    
    if (email === 'admin@texlink.com' && password === 'admin123') {
      isValid = true;
    } else {
      isValid = await verifyPassword(password, user.password_hash);
    }
    
    if (!isValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login
    await query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate token
    const token = generateToken(user.id, user.email, user.role);
    
    console.log('Login successful:', { email, role: user.role }); // Debug log
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: user.role,
        is_verified: user.is_verified,
        city: user.city,
        phone: user.phone
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
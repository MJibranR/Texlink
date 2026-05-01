import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      business_name,
      owner_name,
      email,
      password,
      phone,
      alt_phone,
      business_address,
      city,
      business_type,
      registration_number,
      years_in_business,
      product_categories,
      estimated_monthly_volume,
      website_url,
      ntln_number,
      bank_account_title,
      bank_name,
      bank_account_number,
      product_title,
      product_category,
      product_description,
      product_price,
      product_unit,
      product_quantity,
      product_minimum_order,
      product_city,
      product_images
    } = body;
    
    let userId;
    
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      // Update existing user to seller role if not already
      await query(
        `UPDATE users SET role = 'seller' WHERE id = $1 AND role != 'admin'`,
        [userId]
      );
    } else {
      // Create new user account for the seller
      const defaultPassword = password || 'seller123';
      const hashedPassword = await hashPassword(defaultPassword);
      
      const newUser = await query(
        `INSERT INTO users (full_name, email, password_hash, company_name, phone, city, role, is_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'seller', false, CURRENT_TIMESTAMP)
         RETURNING id`,
        [owner_name, email, hashedPassword, business_name, phone, city]
      );
      
      userId = newUser.rows[0].id;
    }
    
    // Create seller application
    const applicationResult = await query(
      `INSERT INTO seller_applications (
        user_id, business_name, owner_name, email, phone, alt_phone,
        business_address, city, business_type, registration_number,
        years_in_business, product_categories, estimated_monthly_volume,
        website_url, ntln_number, bank_account_title, bank_name,
        bank_account_number, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending')
      RETURNING id`,
      [
        userId, business_name, owner_name, email, phone, alt_phone,
        business_address, city, business_type, registration_number,
        years_in_business, product_categories, estimated_monthly_volume,
        website_url, ntln_number, bank_account_title, bank_name,
        bank_account_number
      ]
    );
    
    const applicationId = applicationResult.rows[0].id;
    
    // Create product listing (not approved yet)
    const productResult = await query(
      `INSERT INTO products (
        seller_id, title, category, description, price, unit,
        quantity_available, minimum_order, city, is_approved,
        seller_application_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, $10, 'pending')
      RETURNING id`,
      [
        userId, product_title, product_category, product_description,
        product_price, product_unit, product_quantity,
        product_minimum_order, product_city, applicationId
      ]
    );
    
    const productId = productResult.rows[0].id;
    
    // Add images
    if (product_images && product_images.length > 0) {
      for (let i = 0; i < product_images.length; i++) {
        if (product_images[i]) {
          await query(
            `INSERT INTO product_images (product_id, image_url, is_primary)
             VALUES ($1, $2, $3)`,
            [productId, product_images[i], i === 0]
          );
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId,
      userId
    });
    
  } catch (error) {
    console.error('Error submitting seller application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
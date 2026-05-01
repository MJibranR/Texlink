import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    
    let sql = `
      SELECT 
        sa.*,
        u.id as user_id,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.is_verified as user_verified,
        p.id as product_id,
        p.title as product_title,
        p.price as product_price,
        p.status as product_status,
        (SELECT json_agg(image_url) FROM product_images WHERE product_id = p.id) as product_images
      FROM seller_applications sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN products p ON p.seller_application_id = sa.id
    `;
    
    const conditions = [];
    const values = [];
    
    if (status && status !== 'all') {
      conditions.push(`sa.status = $${values.length + 1}`);
      values.push(status);
    }
    
    if (userId) {
      conditions.push(`sa.user_id = $${values.length + 1}`);
      values.push(userId);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ` ORDER BY sa.submitted_at DESC`;
    
    const applications = await query(sql, values);
    
    return NextResponse.json(applications.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { applicationId, action, reason } = await request.json();
    
    if (action === 'approve') {
      // First get the application details
      const app = await query(
        'SELECT user_id, business_name, email, phone, city FROM seller_applications WHERE id = $1',
        [applicationId]
      );
      
      const userId = app.rows[0]?.user_id;
      const businessName = app.rows[0]?.business_name;
      const email = app.rows[0]?.email;
      const phone = app.rows[0]?.phone;
      const city = app.rows[0]?.city;
      
      if (userId) {
        // Update user to verified seller
        await query(
          `UPDATE users SET 
            role = 'seller', 
            is_verified = true,
            company_name = COALESCE(company_name, $1),
            phone = COALESCE(phone, $2),
            city = COALESCE(city, $3)
          WHERE id = $4`,
          [businessName, phone, city, userId]
        );
      }
      
      // Update application status
      await query(
        `UPDATE seller_applications 
         SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [applicationId]
      );
      
      // Update product to approved and active
      await query(
        `UPDATE products 
         SET is_approved = true, approved_at = CURRENT_TIMESTAMP, status = 'active'
         WHERE seller_application_id = $1`,
        [applicationId]
      );
      
    } else if (action === 'reject') {
      await query(
        `UPDATE seller_applications 
         SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, admin_notes = $2
         WHERE id = $1`,
        [applicationId, reason]
      );
      
      // Delete the product
      await query(
        `DELETE FROM products WHERE seller_application_id = $1`,
        [applicationId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// Add DELETE method for applications
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const applicationId = searchParams.get('applicationId');
    
    if (!userId && !applicationId) {
      return NextResponse.json({ error: 'User ID or Application ID required' }, { status: 400 });
    }
    
    // First, get the application details
    let appQuery = '';
    if (userId) {
      appQuery = 'SELECT id FROM seller_applications WHERE user_id = $1';
    } else {
      appQuery = 'SELECT id FROM seller_applications WHERE id = $1';
    }
    
    const app = await query(appQuery, [userId || applicationId]);
    
    if (app.rows.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    const appId = app.rows[0].id;
    
    // Delete associated product and its images first
    await query('DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE seller_application_id = $1)', [appId]);
    await query('DELETE FROM products WHERE seller_application_id = $1', [appId]);
    
    // Then delete the application
    await query('DELETE FROM seller_applications WHERE id = $1', [appId]);
    
    // Finally update user role back to buyer if they have no other applications
    if (userId) {
      const remainingApps = await query('SELECT id FROM seller_applications WHERE user_id = $1', [userId]);
      if (remainingApps.rows.length === 0) {
        await query('UPDATE users SET role = $1 WHERE id = $2', ['buyer', userId]);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
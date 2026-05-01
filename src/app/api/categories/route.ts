import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await query(`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY display_order ASC, name ASC
    `);
    return NextResponse.json(categories.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, description, icon, image_url, display_order } = await request.json();
    
    const result = await query(
      `INSERT INTO categories (name, slug, description, icon, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, slug, description, icon, image_url, display_order || 0]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, slug, description, icon, image_url, display_order, is_active } = await request.json();
    
    const result = await query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3, icon = $4, 
           image_url = $5, display_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, slug, description, icon, image_url, display_order, is_active, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }
    
    console.log('Deleting category:', id);
    
    // Start a transaction
    await query('BEGIN');
    
    try {
      // First, update products that have this category
      await query('UPDATE products SET category = NULL, category_id = NULL WHERE category_id = $1', [id]);
      
      // Then delete the category
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      await query('COMMIT');
      console.log('Category deleted successfully:', id);
      return NextResponse.json({ success: true });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category: ' + (error as Error).message }, { status: 500 });
  }
}
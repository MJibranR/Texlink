'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editing ? '/api/categories' : '/api/categories';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...formData, id: editing.id } : formData;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        fetchCategories();
        setShowForm(false);
        setEditing(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will be affected.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Category deleted successfully!');
        await fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      image_url: '',
      display_order: 0,
      is_active: true
    });
  };

  const editCategory = (category: Category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      image_url: category.image_url || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setShowForm(true);
  };

  return (
    <div className="admin-categories">
      <div className="header">
        <h1>Manage Categories</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }} className="btn-add">
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editing ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                />
              </div>
              
              <div className="form-group">
                <label>Slug</label>
                <input type="text" value={formData.slug} readOnly />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="🧵"
                  />
                </div>
                
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  Active
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-icon">{category.icon || '📁'}</div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p className="slug">{category.slug}</p>
                <p className="description">{category.description}</p>
                <p className="order">Order: {category.display_order}</p>
                <span className={`status ${category.is_active ? 'active' : 'inactive'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="category-actions">
                <button onClick={() => editCategory(category)} className="btn-edit">Edit</button>
                <button onClick={() => handleDeleteCategory(category.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-categories {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 32px;
          color: #333;
        }
        .btn-add {
          background: #2c3e50;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-content h2 {
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .checkbox input {
          width: auto;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .btn-save, .btn-cancel {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-save {
          background: #27ae60;
          color: white;
        }
        .btn-cancel {
          background: #95a5a6;
          color: white;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .category-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 15px;
        }
        .category-icon {
          font-size: 48px;
        }
        .category-info {
          flex: 1;
        }
        .category-info h3 {
          margin-bottom: 5px;
        }
        .slug {
          color: #666;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .description {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .order {
          font-size: 12px;
          color: #999;
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status.active {
          background: #d4edda;
          color: #155724;
        }
        .status.inactive {
          background: #f8d7da;
          color: #721c24;
        }
        .category-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .btn-edit, .btn-delete {
          padding: 5px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-edit {
          background: #3498db;
          color: white;
        }
        .btn-delete {
          background: #e74c3c;
          color: white;
        }
        .loading {
          text-align: center;
          padding: 40px;
        }
      `}</style>
    </div>
  );
}
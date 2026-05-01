'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Seller {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
}

export default function AdminAddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    seller_id: '',
    title: '',
    category: '',
    description: '',
    price: '',
    unit: 'meter',
    quantity_available: '',
    minimum_order: '1',
    city: '',
    is_approved: true,
    images: ['', '', '']
  });

  const units = ['meter', 'yard', 'kg', 'roll', 'piece', 'ton'];
  const cities = ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Islamabad', 'Sialkot', 'Gujranwala'];

  useEffect(() => {
    fetchSellers();
    fetchCategories();
  }, []);

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users?role=seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Sellers fetched:', data); // Debug log
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setSellersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (!formData.seller_id) {
      setError('Please select a seller');
      setLoading(false);
      return;
    }
    
    const filteredImages = formData.images.filter(img => img.trim() !== '');
    
    const productData = {
      seller_id: parseInt(formData.seller_id),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      unit: formData.unit,
      quantity_available: parseInt(formData.quantity_available),
      minimum_order: parseInt(formData.minimum_order) || 1,
      city: formData.city,
      images: filteredImages
    };
    
    console.log('Sending product data:', productData); // Debug log
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/products');
        }, 2000);
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Product Added Successfully!</h1>
          <p>The product has been published to the marketplace.</p>
          <div className="success-actions">
            <Link href="/admin/products" className="btn-back">Back to Products</Link>
            <Link href="/admin/products/add" className="btn-add-more">Add Another Product</Link>
          </div>
        </div>
        <style jsx>{`
          .success-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .success-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: #27ae60;
            color: white;
            font-size: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }
          .btn-back, .btn-add-more {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px;
            border-radius: 6px;
            text-decoration: none;
          }
          .btn-back { background: #6c757d; color: white; }
          .btn-add-more { background: #27ae60; color: white; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="add-product">
      <div className="header">
        <h1>Add New Product</h1>
        <Link href="/admin/products" className="btn-back">← Back to Products</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Select Seller *</label>
            <select
              required
              value={formData.seller_id}
              onChange={(e) => setFormData({...formData, seller_id: e.target.value})}
            >
              <option value="">-- Select a Seller --</option>
              {sellersLoading ? (
                <option disabled>Loading sellers...</option>
              ) : (
                sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.company_name || seller.full_name} ({seller.email})
                  </option>
                ))
              )}
            </select>
            {sellers.length === 0 && !sellersLoading && (
              <p className="hint">No sellers found. Please add sellers first.</p>
            )}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Product Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Premium Cotton Fabric"
            />
          </div>

          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed product description..."
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Unit *</label>
            <select
              required
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity Available *</label>
            <input
              type="number"
              required
              value={formData.quantity_available}
              onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Minimum Order</label>
            <input
              type="number"
              value={formData.minimum_order}
              onChange={(e) => setFormData({...formData, minimum_order: e.target.value})}
              placeholder="1"
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <select
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            >
              <option value="">Select City</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Product Images (URLs)</label>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="image-input">
                <input
                  type="url"
                  value={formData.images[idx]}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[idx] = e.target.value;
                    setFormData({...formData, images: newImages});
                  }}
                  placeholder={`Image URL ${idx + 1}`}
                />
                {formData.images[idx] && (
                  <div className="image-preview">
                    <img src={formData.images[idx]} alt={`Preview ${idx + 1}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
          <Link href="/admin/products" className="btn-cancel">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .add-product {
          max-width: 1000px;
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
        .btn-back {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border-radius: 6px;
          text-decoration: none;
        }
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .hint {
          font-size: 12px;
          color: #e74c3c;
          margin-top: 5px;
        }
        .product-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .full-width {
          grid-column: span 2;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
        }
        .image-input {
          margin-bottom: 10px;
        }
        .image-preview {
          margin-top: 5px;
        }
        .image-preview img {
          max-width: 100px;
          max-height: 80px;
          border-radius: 4px;
        }
        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .btn-submit, .btn-cancel {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-submit {
          background: #27ae60;
          color: white;
        }
        .btn-cancel {
          background: #6c757d;
          color: white;
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
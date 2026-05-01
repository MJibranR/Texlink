'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  price: number;
  unit: string;
  quantity_available: number;
  category: string;
  city: string;
  status: string;
  is_approved: boolean;
  views_count: number;
  inquiry_count: number;
  seller_name: string;
  created_at: string;
  image_url: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');

  useEffect(() => {
    checkAdminAndFetchProducts();
  }, []);

  const checkAdminAndFetchProducts = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/marketplace');
      return;
    }
    
    await fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.seller_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    // Approval filter
    if (filterApproval !== 'all') {
      const isApproved = filterApproval === 'approved';
      filtered = filtered.filter(p => p.is_approved === isApproved);
    }
    
    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'most_viewed':
        filtered.sort((a, b) => b.views_count - a.views_count);
        break;
      case 'most_inquired':
        filtered.sort((a, b) => b.inquiry_count - a.inquiry_count);
        break;
    }
    
    setFilteredProducts(filtered);
  }, [products, search, sortBy, filterStatus, filterApproval]);

  const handleApprove = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, action: 'approve' })
      });
      
      if (res.ok) {
        await fetchProducts();
        alert('Product approved successfully!');
      }
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleReject = async (productId: number) => {
    if (confirm('Are you sure you want to reject this product?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId, action: 'reject' })
        });
        
        if (res.ok) {
          await fetchProducts();
          alert('Product rejected and removed from marketplace.');
        }
      } catch (error) {
        console.error('Error rejecting product:', error);
      }
    }
  };

  const handleDelete = async (productId: number) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/products?productId=${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          await fetchProducts();
          alert('Product deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <div className="header">
        <h1>Manage Products</h1>
        <Link href="/admin/products/add" className="btn-add">+ Add Product</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_high">Price: High to Low</option>
          <option value="price_low">Price: Low to High</option>
          <option value="most_viewed">Most Viewed</option>
          <option value="most_inquired">Most Inquired</option>
        </select>
        
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        
        <select value={filterApproval} onChange={(e) => setFilterApproval(e.target.value)} className="filter-select">
          <option value="all">All Approval</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
        
        <button onClick={() => {
          setSearch('');
          setSortBy('newest');
          setFilterStatus('all');
          setFilterApproval('all');
        }} className="clear-btn">
          Clear Filters
        </button>
      </div>

      <div className="products-count">Showing {filteredProducts.length} products</div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>City</th>
              <th>Views</th>
              <th>Inquiries</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-thumb">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} />
                      ) : (
                        <span>🧵</span>
                      )}
                    </div>
                    <div>
                      <p className="product-title">{product.title}</p>
                      <p className="product-category">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td>{product.seller_name}</td>
                <td>₨{product.price.toLocaleString()}/{product.unit}</td>
                <td>{product.quantity_available}</td>
                <td>{product.city}</td>
                <td>{product.views_count}</td>
                <td>{product.inquiry_count}</td>
                <td>
                  <span className={`approval-badge ${product.is_approved ? 'approved' : 'pending'}`}>
                    {product.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="actions">
                  <Link href={`/marketplace/${product.id}`} className="btn-view">View</Link>
                  {!product.is_approved && (
                    <button onClick={() => handleApprove(product.id)} className="btn-approve">Approve</button>
                  )}
                  <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-products {
          max-width: 1400px;
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
          background: #27ae60;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
        }
        .filters-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-input {
          flex: 2;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
        }
        .filter-select {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
        }
        .clear-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .products-count {
          margin-bottom: 20px;
          color: #666;
          font-size: 14px;
        }
        .products-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        .products-table th, .products-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .products-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .product-thumb {
          width: 40px;
          height: 40px;
          background: #f5f5f5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        .product-title {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .product-category {
          font-size: 12px;
          color: #999;
        }
        .approval-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .approval-badge.approved {
          background: #d4edda;
          color: #155724;
        }
        .approval-badge.pending {
          background: #fff3cd;
          color: #856404;
        }
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-view, .btn-approve, .btn-delete {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          text-decoration: none;
          display: inline-block;
        }
        .btn-view {
          background: #3498db;
          color: white;
        }
        .btn-approve {
          background: #27ae60;
          color: white;
        }
        .btn-delete {
          background: #e74c3c;
          color: white;
        }
        .loading {
          text-align: center;
          padding: 50px;
        }
      `}</style>
    </div>
  );
}
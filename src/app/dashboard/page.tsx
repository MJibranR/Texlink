'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  role: string;
  is_verified: boolean;
  city: string;
  created_at: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  unit: string;
  status: string;
  views_count: number;
  inquiry_count: number;
  is_approved: boolean;
  created_at: string;
  image_url: string;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalViews: number;
  totalInquiries: number;
  pendingApproval: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalViews: 0,
    totalInquiries: 0,
    pendingApproval: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchDashboardData(parsedUser.id);
  }, []);

  const fetchDashboardData = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch products
      const productsRes = await fetch(`/api/users/my-listings?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsData = await productsRes.json();
      // Ensure productsData is an array
      setMyProducts(Array.isArray(productsData) ? productsData : []);
      
      // Fetch orders
      const ordersRes = await fetch(`/api/users/my-orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      // Ensure ordersData is an array
      setMyOrders(Array.isArray(ordersData) ? ordersData : []);
      
      // Fetch stats
      const statsRes = await fetch(`/api/users/dashboard-stats?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats({
        totalProducts: statsData.totalProducts || 0,
        totalOrders: statsData.totalOrders || 0,
        totalViews: statsData.totalViews || 0,
        totalInquiries: statsData.totalInquiries || 0,
        pendingApproval: statsData.pendingApproval || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setMyProducts([]);
      setMyOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Product deleted successfully');
        if (user) fetchDashboardData(user.id);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.full_name?.split(' ')[0] || user.full_name}!</h1>
          <p>Manage your textile business from one dashboard</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalViews.toLocaleString()}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInquiries}</div>
          <div className="stat-label">Inquiries</div>
        </div>
      </div>

      {/* Pending Approval Alert */}
      {stats.pendingApproval > 0 && (
        <div className="pending-alert">
          <span className="alert-icon">⏳</span>
          <span>You have {stats.pendingApproval} product(s) pending admin approval. Once approved, they will appear in the marketplace.</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* My Products */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Products</h2>
            <Link href="/sell" className="btn-add">+ Add Product</Link>
          </div>
          <div className="products-list">
            {myProducts.length === 0 ? (
              <p className="no-data">No products yet. Click "Add Product" to get started.</p>
            ) : (
              myProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <div className="product-info">
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} />
                      ) : (
                        <span>🧵</span>
                      )}
                    </div>
                    <div>
                      <h3>{product.title}</h3>
                      <p className="product-price">₨{product.price.toLocaleString()}/{product.unit}</p>
                    </div>
                  </div>
                  <div className="product-stats">
                    <span>👁️ {product.views_count || 0}</span>
                    <span>💬 {product.inquiry_count || 0}</span>
                    <span className={`status-badge ${product.is_approved ? 'approved' : 'pending'}`}>
                      {product.is_approved ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <div className="product-actions">
                    <Link href={`/marketplace/${product.id}`} className="btn-view">View</Link>
                    <button onClick={() => handleDeleteProduct(product.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <Link href="/dashboard/orders" className="view-link">View All →</Link>
          </div>
          <div className="orders-list">
            {myOrders.length === 0 ? (
              <p className="no-data">No orders yet.</p>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div>
                    <p className="order-number">{order.order_number}</p>
                    <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="order-right">
                    <p className="order-amount">₨{order.total_amount.toLocaleString()}</p>
                    <p className={`order-status ${order.status}`}>{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .dashboard-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
        }
        .dashboard-header p {
          color: #666;
        }
        .btn-sell {
          background: #27ae60;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
        }
        .stat-label {
          color: #666;
          margin-top: 10px;
        }
        .pending-alert {
          background: #fff3cd;
          color: #856404;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }
        .dashboard-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }
        .btn-add, .view-link {
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
        }
        .view-link {
          background: #6c757d;
        }
        .products-list, .orders-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .product-item, .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 2;
        }
        .product-image {
          width: 50px;
          height: 50px;
          background: #f5f5f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-price {
          font-size: 12px;
          color: #27ae60;
          font-weight: 500;
        }
        .product-stats {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #666;
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
        }
        .status-badge.approved {
          background: #d4edda;
          color: #155724;
        }
        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }
        .product-actions {
          display: flex;
          gap: 8px;
        }
        .btn-view, .btn-delete {
          padding: 4px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          text-decoration: none;
        }
        .btn-view {
          background: #3498db;
          color: white;
        }
        .btn-delete {
          background: #dc3545;
          color: white;
        }
        .order-number {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .order-date {
          font-size: 11px;
          color: #999;
        }
        .order-right {
          text-align: right;
        }
        .order-amount {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .order-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-block;
        }
        .order-status.pending {
          background: #fff3cd;
          color: #856404;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        .btn-orders {
        background: #3498db;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
      }
      `}</style>
    </div>
  );
}
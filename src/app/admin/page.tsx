'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingApplications: number;
  monthlyRevenue: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface RecentOrder {
  id: number;
  order_number: string;
  buyer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface PendingApplication {
  id: number;
  business_name: string;
  owner_name: string;
  submitted_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    pendingApplications: 0,
    monthlyRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingApps, setPendingApps] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
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
    
    setAdminUser(user);
    await fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all data in parallel
      const [statsRes, usersRes, ordersRes, appsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/orders?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/applications?status=pending', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();
      const appsData = await appsRes.json();
      
      setStats(statsData);
      setRecentUsers(usersData);
      setRecentOrders(ordersData);
      setPendingApps(appsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
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
            height: 100vh;
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

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>TexLink Admin</h2>
          <p>Welcome, {adminUser?.name || 'Admin'}</p>
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item active">📊 Dashboard</Link>
          <Link href="/admin/users" className="nav-item">👥 Users</Link>
          <Link href="/admin/applications" className="nav-item">📝 Applications</Link>
          <Link href="/admin/categories" className="nav-item">📁 Categories</Link>
          <Link href="/admin/quote-requests" className="nav-item">📋 Quote Requests</Link>
          <Link href="/admin/orders" className="nav-item">🛒 Orders</Link>
          <Link href="/admin/products" className="nav-item">📦 Products</Link>
        </nav>
        <button onClick={handleLogout} className="logout-sidebar">🚪 Logout</button>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <button className="btn-refresh" onClick={fetchDashboardData}>🔄 Refresh</button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalProducts.toLocaleString()}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{stats.totalOrders.toLocaleString()}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₨{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingApplications}</h3>
              <p>Pending Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>₨{stats.monthlyRevenue.toLocaleString()}</h3>
              <p>This Month</p>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          {/* Recent Users */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Recent Users</h2>
              <Link href="/admin/users">View All →</Link>
            </div>
            <div className="users-list">
              {recentUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <div>
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                    <p className="user-date">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Applications */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Pending Applications</h2>
              <Link href="/admin/applications">View All →</Link>
            </div>
            <div className="applications-list">
              {pendingApps.length === 0 ? (
                <p className="no-data">No pending applications</p>
              ) : (
                pendingApps.map((app) => (
                  <div key={app.id} className="app-item">
                    <div>
                      <p className="app-name">{app.business_name}</p>
                      <p className="app-owner">{app.owner_name}</p>
                    </div>
                    <div>
                      <span className="status-badge pending">Pending</span>
                      <p className="app-date">{new Date(app.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-card full-width">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <Link href="/admin/orders">View All →</Link>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.buyer_name}</td>
                    <td>₨{order.total_amount.toLocaleString()}</td>
                    <td><span className={`status-${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: calc(100vh - 70px);
          background: #f5f7fa;
        }
        .admin-sidebar {
          width: 260px;
          background: white;
          box-shadow: 2px 0 4px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .sidebar-header h2 {
          color: #667eea;
          margin-bottom: 5px;
        }
        .sidebar-header p {
          font-size: 12px;
          color: #666;
        }
        .sidebar-nav {
          flex: 1;
          padding: 20px;
        }
        .nav-item {
          display: block;
          padding: 12px 15px;
          margin-bottom: 8px;
          color: #666;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-item:hover, .nav-item.active {
          background: #667eea;
          color: white;
        }
        .logout-sidebar {
          margin: 20px;
          padding: 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .admin-main {
          flex: 1;
          padding: 20px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .admin-header h1 {
          font-size: 28px;
          color: #333;
        }
        .btn-refresh {
          padding: 8px 16px;
          background: #e0e0e0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-icon {
          font-size: 40px;
        }
        .stat-info h3 {
          font-size: 24px;
          color: #333;
        }
        .stat-info p {
          color: #666;
          font-size: 14px;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .admin-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .full-width {
          grid-column: span 2;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .card-header a {
          color: #667eea;
          text-decoration: none;
        }
        .user-item, .app-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .user-name, .app-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .user-email, .app-owner {
          font-size: 12px;
          color: #666;
        }
        .user-date, .app-date {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }
        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        .role-badge.buyer { background: #3498db; color: white; }
        .role-badge.seller { background: #27ae60; color: white; }
        .role-badge.admin { background: #e74c3c; color: white; }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        .status-badge.pending {
          background: #f39c12;
          color: white;
        }
        .no-data {
          text-align: center;
          padding: 20px;
          color: #999;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }
        .orders-table th, .orders-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }
        .orders-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .status-pending {
          background: #f39c12;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
        }
        .status-shipped {
          background: #3498db;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
        }
        .status-delivered {
          background: #27ae60;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
        }
        @media (max-width: 768px) {
          .admin-container {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
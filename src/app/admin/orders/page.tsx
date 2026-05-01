'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  created_at: string;
  items_count: number;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    checkAdminAndFetchOrders();
  }, []);

  const checkAdminAndFetchOrders = async () => {
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
    
    await fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...orders];
    
    if (search) {
      filtered = filtered.filter(o => 
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'amount_high':
        filtered.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case 'amount_low':
        filtered.sort((a, b) => a.total_amount - b.total_amount);
        break;
    }
    
    setFilteredOrders(filtered);
  }, [orders, search, sortBy, filterStatus]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (res.ok) {
        await fetchOrders();
        alert(`Order status updated to ${newStatus}`);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#fff3cd', color: '#856404' },
      processing: { bg: '#cce5ff', color: '#004085' },
      shipped: { bg: '#d4edda', color: '#155724' },
      delivered: { bg: '#d1ecf1', color: '#0c5460' },
      cancelled: { bg: '#f8d7da', color: '#721c24' }
    };
    const style = colors[status] || colors.pending;
    return <span style={{ background: style.bg, color: style.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{status}</span>;
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="header">
        <h1>Manage Orders</h1>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by order # or buyer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_high">Amount: High to Low</option>
          <option value="amount_low">Amount: Low to High</option>
        </select>
        
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <button onClick={() => { setSearch(''); setSortBy('newest'); setFilterStatus('all'); }} className="clear-btn">
          Clear Filters
        </button>
      </div>

      <div className="orders-count">Showing {filteredOrders.length} orders</div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Buyer</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                <td>{order.order_number}</td>
                <td>
                  <div>
                    <p className="buyer-name">{order.buyer_name}</p>
                    <p className="buyer-email">{order.buyer_email}</p>
                  </div>
                </td>
                <td>₨{order.total_amount.toLocaleString()}</td>
                <td>{order.items_count} items</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="btn-view">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Order Details</h2>
            <div className="order-details">
              <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
              <p><strong>Buyer:</strong> {selectedOrder.buyer_name}</p>
              <p><strong>Email:</strong> {selectedOrder.buyer_email}</p>
              <p><strong>Total Amount:</strong> ₨{selectedOrder.total_amount.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
              <p><strong>Shipping Address:</strong> {selectedOrder.shipping_address}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              
              <div className="status-update">
                <label>Update Status:</label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedOrder(null)} className="btn-close">Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-orders {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 32px;
          color: #333;
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
        .orders-count {
          margin-bottom: 20px;
          color: #666;
        }
        .orders-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        .orders-table th, .orders-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .orders-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .buyer-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .buyer-email {
          font-size: 12px;
          color: #999;
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
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
        }
        .modal-content h2 {
          margin-bottom: 20px;
        }
        .order-details p {
          margin: 10px 0;
        }
        .status-update {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .status-update label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .status-select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
        }
        .modal-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        .btn-close {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-view {
          padding: 4px 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .loading {
          text-align: center;
          padding: 50px;
        }
      `}</style>
    </div>
  );
}
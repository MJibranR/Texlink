'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/login?redirect=/dashboard/orders');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchOrders(parsedUser.id);
  }, []);

  const fetchOrders = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/my-orders?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#ffc107',
      processing: '#17a2b8',
      confirmed: '#28a745',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return { background: colors[status] || '#6c757d', color: 'white' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
          }
          .spinner {
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
    <div className="orders-page">
      <div className="header">
        <h1>My Orders</h1>
        <p>View all your orders and invoices</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet.</p>
          <Link href="/marketplace" className="btn-shop">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number">{order.order_number}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.items_count} items</td>
                  <td className="amount">₨{order.total_amount.toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.payment_status}`}>
                      {order.payment_status || 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/formalities/invoice/${order.id}`} className="btn-invoice">
                      📄 View Invoice
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .orders-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
        }
        .no-orders {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .no-orders-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .no-orders h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .no-orders p {
          color: #666;
          margin-bottom: 20px;
        }
        .btn-shop {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
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
          color: #555;
        }
        .order-number {
          font-weight: 600;
          color: #667eea;
        }
        .amount {
          font-weight: 600;
          color: #27ae60;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .payment-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        }
        .payment-badge.paid {
          background: #d4edda;
          color: #155724;
        }
        .payment-badge.unpaid {
          background: #fff3cd;
          color: #856404;
        }
        .btn-invoice {
          display: inline-block;
          padding: 6px 12px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 12px;
        }
        .btn-invoice:hover {
          background: #2980b9;
        }
      `}</style>
    </div>
  );
}
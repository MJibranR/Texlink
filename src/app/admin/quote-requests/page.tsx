'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuoteRequest {
  id: number;
  order_number: string;
  product_title: string;
  quantity: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  budget_range: string;
  notes: string;
  status: string;
  created_at: string;
}

export default function AdminQuoteRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [filter, setFilter] = useState('pending');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    checkAdminAndFetchRequests();
  }, [filter]);

  const checkAdminAndFetchRequests = async () => {
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
    
    await fetchRequests();
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/transactions?status=${filter}`);
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/quote-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: newStatus, replyMessage })
      });
      
      if (res.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        setReplyMessage('');
        alert(`Quote request ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openWhatsApp = (phone: string, message: string) => {
    // Clean phone number (remove +, spaces, etc.)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('92') && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('92')) {
      cleanPhone = '92' + cleanPhone;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleApproveAndWhatsApp = async (request: QuoteRequest, message: string) => {
    await updateStatus(request.id, 'approved');
    
    const whatsappMsg = `Dear ${request.contact_person},\n\n` +
      `Your quote request for ${request.product_title} (Quantity: ${request.quantity}) has been APPROVED!\n\n` +
      `Admin Response: ${message}\n\n` +
      `Order #: ${request.order_number}\n` +
      `Please confirm your order within 24 hours to proceed.\n\n` +
      `Thank you for choosing TexLink!\n` +
      `Contact us: +92 316 3782435`;
    
    if (request.phone) {
      openWhatsApp(request.phone, whatsappMsg);
    } else {
      alert('No phone number available for WhatsApp');
    }
  };

  const handleRejectAndWhatsApp = async (request: QuoteRequest, message: string) => {
    await updateStatus(request.id, 'rejected');
    
    const whatsappMsg = `Dear ${request.contact_person},\n\n` +
      `Your quote request for ${request.product_title} (Quantity: ${request.quantity}) has been REJECTED.\n\n` +
      `Reason: ${message}\n\n` +
      `Order #: ${request.order_number}\n` +
      `If you have any questions, please contact us at +92 316 3782435.\n\n` +
      `Thank you for your interest in TexLink!`;
    
    if (request.phone) {
      openWhatsApp(request.phone, whatsappMsg);
    } else {
      alert('No phone number available for WhatsApp');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#fff3cd', color: '#856404' },
      approved: { bg: '#d4edda', color: '#155724' },
      rejected: { bg: '#f8d7da', color: '#721c24' },
      completed: { bg: '#d1ecf1', color: '#0c5460' }
    };
    const style = colors[status] || colors.pending;
    return <span style={{ background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quote requests...</p>
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

  return (
    <div className="admin-quotes">
      <div className="header">
        <h1>Quote Requests</h1>
        <div className="filter-tabs">
          <button onClick={() => setFilter('pending')} className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}>
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button onClick={() => setFilter('approved')} className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}>
            Approved
          </button>
          <button onClick={() => setFilter('completed')} className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}>
            Completed
          </button>
          <button onClick={() => setFilter('rejected')} className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}>
            Rejected
          </button>
        </div>
      </div>

      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="no-requests">
            <p>No {filter} quote requests found.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="request-card" onClick={() => setSelectedRequest(request)}>
              <div className="request-header">
                <div>
                  <h3>{request.product_title}</h3>
                  <p className="order-id">Order #{request.order_number}</p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              <div className="request-details">
                <div className="detail">
                  <span className="label">Company:</span>
                  <span>{request.company_name}</span>
                </div>
                <div className="detail">
                  <span className="label">Contact:</span>
                  <span>{request.contact_person}</span>
                </div>
                <div className="detail">
                  <span className="label">Quantity:</span>
                  <span>{request.quantity}</span>
                </div>
                <div className="detail">
                  <span className="label">Budget:</span>
                  <span>{request.budget_range || 'Not specified'}</span>
                </div>
                <div className="detail">
                  <span className="label">Date:</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for viewing details and replying */}
      {selectedRequest && (
        <div className="modal" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Quote Request Details</h2>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Company:</strong> {selectedRequest.company_name}</p>
                <p><strong>Contact Person:</strong> {selectedRequest.contact_person}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Phone:</strong> {selectedRequest.phone}</p>
              </div>
              <div className="detail-section">
                <h3>Product Information</h3>
                <p><strong>Product:</strong> {selectedRequest.product_title}</p>
                <p><strong>Quantity:</strong> {selectedRequest.quantity}</p>
                <p><strong>Budget Range:</strong> {selectedRequest.budget_range || 'Not specified'}</p>
              </div>
              <div className="detail-section">
                <h3>Additional Notes</h3>
                <p>{selectedRequest.notes || 'No additional notes'}</p>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="reply-section">
                  <h3>Reply to Customer</h3>
                  <textarea
                    rows={4}
                    placeholder="Enter your reply message here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleApproveAndWhatsApp(selectedRequest, replyMessage)} 
                      className="btn-approve"
                    >
                      ✓ Approve & Send WhatsApp
                    </button>
                    <button 
                      onClick={() => handleRejectAndWhatsApp(selectedRequest, replyMessage)} 
                      className="btn-reject"
                    >
                      ✗ Reject & Send WhatsApp
                    </button>
                    <button 
                      onClick={() => openWhatsApp(selectedRequest.phone, `Hello ${selectedRequest.contact_person},\n\nI'm following up on your quote request for ${selectedRequest.product_title}.\n\nOrder #: ${selectedRequest.order_number}\n\nPlease let me know if you have any questions.\n\nThank you,\nTexLink Team`)} 
                      className="btn-whatsapp"
                    >
                      📱 Chat on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedRequest(null)} className="btn-close">Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-quotes {
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
          margin-bottom: 20px;
        }
        .filter-tabs {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e0e0e0;
        }
        .filter-tab {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
        }
        .filter-tab.active {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          margin-bottom: -2px;
        }
        .requests-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .request-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .request-card:hover {
          transform: translateY(-3px);
        }
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .request-header h3 {
          margin-bottom: 5px;
          font-size: 16px;
        }
        .order-id {
          font-size: 12px;
          color: #999;
        }
        .request-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .detail {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .detail .label {
          font-weight: 500;
          color: #666;
        }
        .no-requests {
          text-align: center;
          padding: 50px;
          color: #666;
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
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-content h2 {
          margin-bottom: 20px;
        }
        .detail-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-section h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .detail-section p {
          margin: 8px 0;
        }
        .reply-section {
          margin-top: 20px;
        }
        .reply-section textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin: 10px 0;
          font-family: inherit;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn-approve, .btn-reject, .btn-whatsapp {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          flex: 1;
        }
        .btn-approve {
          background: #27ae60;
          color: white;
        }
        .btn-reject {
          background: #e74c3c;
          color: white;
        }
        .btn-whatsapp {
          background: #25D366;
          color: white;
        }
        .btn-close {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .modal-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
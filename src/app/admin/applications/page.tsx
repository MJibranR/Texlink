'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  business_type: string;
  city: string;
  status: string;
  submitted_at: string;
  product_title: string;
  product_price: number;
  product_images: string[];
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/applications');
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    if (confirm('Approve this seller and publish their product?')) {
      try {
        const res = await fetch('/api/admin/applications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, action: 'approve' })
        });
        
        if (res.ok) {
          alert('Application approved! Product is now live on marketplace.');
          fetchApplications();
          setSelectedApp(null);
        }
      } catch (error) {
        console.error('Error approving application:', error);
      }
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        const res = await fetch('/api/admin/applications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, action: 'reject', reason })
        });
        
        if (res.ok) {
          alert('Application rejected.');
          fetchApplications();
          setSelectedApp(null);
        }
      } catch (error) {
        console.error('Error rejecting application:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#f39c12', text: 'Pending Review' },
      approved: { bg: '#27ae60', text: 'Approved' },
      rejected: { bg: '#e74c3c', text: 'Rejected' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <span style={{ background: badge.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'white' }}>{badge.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="admin-applications">
      <div className="header">
        <h1>Seller Applications</h1>
        <p>Review and approve new sellers</p>
      </div>

      <div className="applications-list">
        {applications.map((app) => (
          <div key={app.id} className="application-card" onClick={() => setSelectedApp(app)}>
            <div className="app-header">
              <h3>{app.business_name}</h3>
              {getStatusBadge(app.status)}
            </div>
            <div className="app-details">
              <p><strong>Owner:</strong> {app.owner_name}</p>
              <p><strong>Email:</strong> {app.email}</p>
              <p><strong>Phone:</strong> {app.phone}</p>
              <p><strong>Business Type:</strong> {app.business_type}</p>
              <p><strong>City:</strong> {app.city}</p>
              <p><strong>Product:</strong> {app.product_title} - ₨{app.product_price}</p>
              <p><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</p>
            </div>
            {app.status === 'pending' && (
              <div className="app-actions">
                <button onClick={(e) => { e.stopPropagation(); handleApprove(app.id); }} className="btn-approve">
                  ✓ Approve
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleReject(app.id); }} className="btn-reject">
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedApp && (
        <div className="modal" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Application Details</h2>
            <div className="modal-body">
              <h3>Business Information</h3>
              <p><strong>Business Name:</strong> {selectedApp.business_name}</p>
              <p><strong>Owner:</strong> {selectedApp.owner_name}</p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>Phone:</strong> {selectedApp.phone}</p>
              <p><strong>Business Type:</strong> {selectedApp.business_type}</p>
              <p><strong>City:</strong> {selectedApp.city}</p>
              
              <h3>Product Information</h3>
              <p><strong>Title:</strong> {selectedApp.product_title}</p>
              <p><strong>Price:</strong> ₨{selectedApp.product_price}</p>
              
              {selectedApp.product_images && selectedApp.product_images.length > 0 && (
                <div className="product-images">
                  <strong>Product Images:</strong>
                  <div className="images">
                    {selectedApp.product_images.map((img, i) => (
                      <img key={i} src={img} alt={`Product ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              {selectedApp.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(selectedApp.id)} className="btn-approve">Approve</button>
                  <button onClick={() => handleReject(selectedApp.id)} className="btn-reject">Reject</button>
                </>
              )}
              <button onClick={() => setSelectedApp(null)} className="btn-close">Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-applications {
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
        .applications-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .application-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .application-card:hover {
          transform: translateY(-3px);
        }
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .app-header h3 {
          margin: 0;
        }
        .app-details p {
          margin: 8px 0;
          font-size: 14px;
        }
        .app-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        .btn-approve, .btn-reject {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-approve {
          background: #27ae60;
          color: white;
        }
        .btn-reject {
          background: #e74c3c;
          color: white;
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
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-body h3 {
          margin: 20px 0 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e0e0e0;
        }
        .product-images .images {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .product-images img {
          max-width: 150px;
          border-radius: 8px;
        }
        .modal-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-close {
          padding: 8px 16px;
          background: #95a5a6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
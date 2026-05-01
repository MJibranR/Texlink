'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    company_name: '',
    phone: '',
    role: 'buyer',
    city: ''
  });

  const cities = ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Islamabad'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          company_name: formData.company_name,
          phone: formData.phone,
          role: formData.role,
          city: formData.city
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
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
          <h1>User Created Successfully!</h1>
          <p>The user has been added to the system.</p>
          <div className="success-actions">
            <Link href="/admin/users" className="btn-back">Back to Users</Link>
            <Link href="/admin/users/add" className="btn-add-more">Add Another User</Link>
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
    <div className="add-user">
      <div className="header">
        <h1>Add New User</h1>
        <Link href="/admin/users" className="btn-back">← Back to Users</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              required
              value={formData.confirm_password}
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>City</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            >
              <option value="">Select City</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <Link href="/admin/users" className="btn-cancel">Cancel</Link>
        </div>
      </form>

      <style jsx>{`
        .add-user {
          max-width: 800px;
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
        .user-form {
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
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-group input, .form-group select {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
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
      `}</style>
    </div>
  );
}
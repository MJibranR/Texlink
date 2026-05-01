'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Business Information
    business_name: '',
    owner_name: '',
    email: '',
    password: '', // Add this
    confirm_password: '', // Add this
    phone: '',
    alt_phone: '',
    business_address: '',
    city: '',
    business_type: '',
    registration_number: '',
    years_in_business: '',
    product_categories: [] as string[],
    estimated_monthly_volume: '',
    website_url: '',
    
    
    // Product Information
    product_title: '',
    product_category: '',
    product_description: '',
    product_price: '',
    product_unit: 'meter',
    product_quantity: '',
    product_minimum_order: '1',
    product_city: '',
    product_images: ['', '', ''] as string[],
    
    // Agreement
    agree_terms: false
  });

  if (!user && formData.password !== formData.confirm_password) {
  alert('Passwords do not match');
  return;
  }

  
  const businessTypes = ['Manufacturer', 'Wholesaler', 'Distributor', 'Importer', 'Exporter', 'Trader'];
  const cities = ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Islamabad', 'Sialkot', 'Gujranwala'];
  const units = ['meter', 'yard', 'kg', 'roll', 'piece', 'ton'];
  const volumeOptions = ['Less than 1M PKR', '1M - 5M PKR', '5M - 10M PKR', '10M - 50M PKR', '50M+ PKR'];
  const categories = ['Fabric', 'Denim', 'Yarn', 'Leather', 'Accessories', 'Dyes & Chemicals', 'Fur & Lining', 'Wool'];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login?redirect=/sell');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Pre-fill form with user data
    setFormData(prev => ({
      ...prev,
      owner_name: parsedUser.name || '',
      email: parsedUser.email || '',
      business_name: parsedUser.company || '',
    }));
    
    setIsLoggedIn(true);
  }, []);

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category]
    }));
  };

  const handleImageChange = (index: number, url: string) => {
    const newImages = [...formData.product_images];
    newImages[index] = url;
    setFormData({ ...formData, product_images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          product_price: parseFloat(formData.product_price),
          product_quantity: parseInt(formData.product_quantity),
          product_minimum_order: parseInt(formData.product_minimum_order),
          years_in_business: parseInt(formData.years_in_business) || 0
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        window.scrollTo(0, 0);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="loading">Checking authentication...</div>;
  }

  if (success) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Application Submitted Successfully!</h1>
          <p>Your seller application has been received. Our admin team will review your information within 24-48 hours.</p>
          <div className="info-box">
            <h3>What's Next?</h3>
            <ul>
              <li>📧 You will receive an email confirmation</li>
              <li>👨‍💼 Admin will review your application</li>
              <li>✅ Once approved, your product will appear on marketplace</li>
              <li>📱 You can track status in your dashboard</li>
            </ul>
          </div>
          <div className="success-actions">
            <Link href="/dashboard" className="btn-dashboard">Go to Dashboard</Link>
            <Link href="/marketplace" className="btn-marketplace">Browse Marketplace</Link>
          </div>
        </div>

        <style jsx>{`
          .success-page {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #f5f7fa;
          }
          .success-card {
            background: white;
            border-radius: 16px;
            padding: 50px;
            text-align: center;
            max-width: 550px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
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
          .success-card h1 {
            margin-bottom: 15px;
            color: #333;
          }
          .info-box {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: left;
          }
          .info-box h3 {
            margin-bottom: 15px;
            color: #2c3e50;
          }
          .info-box ul {
            list-style: none;
            padding: 0;
          }
          .info-box li {
            padding: 8px 0;
            color: #555;
          }
          .success-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn-dashboard, .btn-marketplace {
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
          }
          .btn-dashboard {
            background: #2c3e50;
            color: white;
          }
          .btn-marketplace {
            background: #3498db;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sell-page">
      <div className="container">
        <div className="header">
          <h1>Become a Seller on TexLink</h1>
          <p>Complete the form below to start selling your textile products</p>
          <div className="steps">
            <span className="step active">1. Business Details</span>
            <span className="step active">2. Product Details</span>
            <span className="step">3. Verification</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="seller-form">
          {/* Business Information Section */}
          <div className="form-section">
            <h2>🏢 Business Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  placeholder="Your company name"
                />
              </div>
              
              <div className="form-group">
                <label>Owner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.owner_name}
                  onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+92 300 1234567"
                />
              </div>
              
              <div className="form-group">
                <label>Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.alt_phone}
                  onChange={(e) => setFormData({...formData, alt_phone: e.target.value})}
                  placeholder="+92 300 1234567"
                />
              </div>
              {/* Add password fields in the form JSX: */}
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
                <label>Business Type *</label>
                <select
                  required
                  value={formData.business_type}
                  onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>Business Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.business_address}
                  onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                  placeholder="Complete business address"
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
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                  placeholder="SECP registration / NTN"
                />
              </div>
              
              <div className="form-group">
                <label>Years in Business</label>
                <input
                  type="number"
                  value={formData.years_in_business}
                  onChange={(e) => setFormData({...formData, years_in_business: e.target.value})}
                  placeholder="Years"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Product Categories You Sell *</label>
                <div className="checkbox-group">
                  {categories.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Estimated Monthly Sales Volume</label>
                <select
                  value={formData.estimated_monthly_volume}
                  onChange={(e) => setFormData({...formData, estimated_monthly_volume: e.target.value})}
                >
                  <option value="">Select Volume</option>
                  {volumeOptions.map(vol => (
                    <option key={vol} value={vol}>{vol}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>


          {/* Product Information Section */}
          <div className="form-section">
            <h2>📦 First Product Listing</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.product_title}
                  onChange={(e) => setFormData({...formData, product_title: e.target.value})}
                  placeholder="e.g., Premium Cotton Fabric 100%"
                />
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  value={formData.product_category}
                  onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <select
                  required
                  value={formData.product_city}
                  onChange={(e) => setFormData({...formData, product_city: e.target.value})}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>Product Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.product_description}
                  onChange={(e) => setFormData({...formData, product_description: e.target.value})}
                  placeholder="Describe your product quality, features, specifications..."
                />
              </div>
              
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.product_price}
                  onChange={(e) => setFormData({...formData, product_price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label>Unit *</label>
                <select
                  required
                  value={formData.product_unit}
                  onChange={(e) => setFormData({...formData, product_unit: e.target.value})}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Quantity Available *</label>
                <input
                  type="number"
                  required
                  value={formData.product_quantity}
                  onChange={(e) => setFormData({...formData, product_quantity: e.target.value})}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Minimum Order Quantity</label>
                <input
                  type="number"
                  value={formData.product_minimum_order}
                  onChange={(e) => setFormData({...formData, product_minimum_order: e.target.value})}
                  placeholder="1"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Product Images (URLs)</label>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="image-input">
                    <input
                      type="url"
                      value={formData.product_images[idx]}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      placeholder={`Image URL ${idx + 1}`}
                    />
                    {formData.product_images[idx] && (
                      <div className="image-preview">
                        <img src={formData.product_images[idx]} alt={`Preview ${idx + 1}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="form-section agreement">
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
                checked={formData.agree_terms}
                onChange={(e) => setFormData({...formData, agree_terms: e.target.checked})}
              />
              I confirm that all information provided is accurate and I agree to the <Link href="/formalities/terms">Terms of Service</Link> and <Link href="/formalities/privacy">Privacy Policy</Link>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
            <Link href="/" className="btn-cancel">Cancel</Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .sell-page {
          min-height: calc(100vh - 200px);
          background: #f5f7fa;
          padding: 40px 20px;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 36px;
          color: #333;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          margin-bottom: 20px;
        }
        .steps {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .step {
          padding: 8px 16px;
          background: #e0e0e0;
          border-radius: 20px;
          font-size: 14px;
        }
        .step.active {
          background: #27ae60;
          color: white;
        }
        .seller-form {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .form-section {
          padding: 30px;
          border-bottom: 1px solid #e0e0e0;
        }
        .form-section h2 {
          font-size: 24px;
          color: #2c3e50;
          margin-bottom: 25px;
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
          color: #555;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .image-input {
          margin-bottom: 15px;
        }
        .image-preview {
          margin-top: 10px;
        }
        .image-preview img {
          max-width: 150px;
          max-height: 100px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .agreement {
          background: #f8f9fa;
        }
        .form-actions {
          display: flex;
          gap: 15px;
          padding: 20px 30px;
          background: #f8f9fa;
        }
        .btn-submit, .btn-cancel {
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
        }
        .btn-submit {
          background: #27ae60;
          color: white;
          border: none;
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: #95a5a6;
          color: white;
        }
        .loading {
          text-align: center;
          padding: 50px;
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .form-section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
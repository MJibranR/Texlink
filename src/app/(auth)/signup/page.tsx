'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    company_name: '',
    phone: '',
    role: defaultRole,
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cities = ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Islamabad', 'Sialkot', 'Gujranwala'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      
      const data = await response.json();
      
      if (response.ok) {
        // Auto login after signup
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          // Set cookie for middleware
          document.cookie = `token=${loginData.token}; path=/`;
          
          // Redirect based on role
          if (loginData.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/marketplace');
          }
        } else {
          router.push('/login?registered=true');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join Pakistan's largest B2B textile marketplace</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Muhammad Umar"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="umar@company.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="Your company name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <select
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
              <label>I am a *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="buyer">Buyer / Manufacturer</option>
                <option value="seller">Seller / Supplier</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="terms">
            <label className="checkbox">
              <input type="checkbox" required />
              I agree to the <Link href="/formalities/terms">Terms of Service</Link> and <Link href="/formalities/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }
        .signup-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .signup-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .signup-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }
        .signup-header p {
          color: #666;
        }
        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }
        .form-group input, .form-group select {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        .terms {
          margin: 20px 0;
        }
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          cursor: pointer;
        }
        .checkbox a {
          color: #667eea;
          text-decoration: none;
        }
        .signup-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .signup-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .signup-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signup-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .signup-card {
            padding: 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}
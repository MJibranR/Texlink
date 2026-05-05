'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/marketplace';
  const registered = searchParams.get('registered');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Set cookie for middleware
        document.cookie = `token=${data.token}; path=/`;
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(redirect);
        }
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your TexLink account</p>
        </div>

        {registered && (
          <div className="success-message">
            ✓ Account created successfully! Please login.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox">
              <input type="checkbox" /> Remember me
            </label>
            {/* <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link> */}
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {/* NO MORE DEMO  */}
        {/* <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>👑 Admin: admin@texlink.com / admin123</p>
          <p>👤 User: any@email.com / any password</p>
        </div> */}

        <div className="login-footer">
          <p>
            Don't have an account? <Link href="/signup">Create Account</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }
        .login-header p {
          color: #666;
        }
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          cursor: pointer;
        }
        .forgot-link {
          color: #667eea;
          text-decoration: none;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .demo-credentials {
          margin: 20px 0;
          padding: 15px;
          background: #f0f4ff;
          border-radius: 8px;
          font-size: 13px;
          color: #555;
          text-align: center;
        }
        .demo-credentials p {
          margin: 5px 0;
        }
        .login-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .login-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
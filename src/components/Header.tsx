'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
      // Get user's first name or full name
      const name = userData.full_name || userData.name || userData.email?.split('@')[0] || 'User';
      setUserName(name);
    }

    // Listen for login/signup events to update header
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        const userData = JSON.parse(updatedUser);
        setIsLoggedIn(true);
        setUserRole(userData.role);
        setUserName(userData.full_name || userData.name || userData.email?.split('@')[0] || 'User');
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          <span className="logo-icon">🧵</span>
          TexLink
        </Link>
        
        <nav className="nav">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
        </nav>
        
        <div className="header-actions">
          <Link href="/cart" className="cart-btn">
            🛒 <span className="cart-count">{cartCount}</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <div className="welcome-text">
                Welcome, <span className="user-name">{userName?.split(' ')[0] || userName}</span>
              </div>
              {userRole === 'admin' && (
                <Link href="/admin" className="admin-link">Admin</Link>
              )}
              <Link href="/dashboard" className="dashboard-link">Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="login-btn">Login</Link>
              <Link href="/signup" className="signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          text-decoration: none;
          color: #667eea;
        }
        .logo-icon {
          margin-right: 5px;
        }
        .nav {
          display: flex;
          gap: 30px;
        }
        .nav a {
          text-decoration: none;
          color: #374151;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: #667eea;
        }
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }
        .cart-btn {
          text-decoration: none;
          color: #374151;
          font-size: 20px;
          position: relative;
          transition: color 0.2s;
        }
        .cart-btn:hover {
          color: #667eea;
        }
        .cart-count {
          background: #667eea;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 12px;
          margin-left: 5px;
        }
        .welcome-text {
          font-size: 14px;
          color: #555;
          padding: 5px 10px;
          background: #f0f0f0;
          border-radius: 20px;
        }
        .user-name {
          font-weight: 600;
          color: #667eea;
        }
        .login-btn, .signup-btn, .admin-link, .dashboard-link {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .login-btn {
          color: #667eea;
          border: 1px solid #667eea;
        }
        .login-btn:hover {
          background: #667eea;
          color: white;
        }
        .signup-btn, .admin-link {
          background: #667eea;
          color: white;
        }
        .signup-btn:hover, .admin-link:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }
        .dashboard-link {
          background: #28a745;
          color: white;
        }
        .dashboard-link:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        .logout-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            align-items: center;
          }
          .nav {
            gap: 20px;
          }
          .header-actions {
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
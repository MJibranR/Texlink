'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'white',
        padding: '50px',
        borderRadius: '20px',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          fontSize: '100px',
          fontWeight: 'bold',
          color: '#667eea',
          marginBottom: '20px'
        }}>404</div>
        <h1 style={{
          fontSize: '28px',
          color: '#333',
          marginBottom: '15px'
        }}>Page Not Found</h1>
        <p style={{
          color: '#666',
          marginBottom: '30px'
        }}>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <Link href="/" style={{
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            background: '#667eea',
            color: 'white',
            transition: 'transform 0.2s'
          }}>Go to Homepage</Link>
          <Link href="/marketplace" style={{
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            background: '#e0e0e0',
            color: '#333',
            transition: 'transform 0.2s'
          }}>Browse Marketplace</Link>
        </div>
      </div>
    </div>
  );
}
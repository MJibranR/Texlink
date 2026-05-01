'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get order number from localStorage or generate one
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderNumber(order.orderNumber);
    } else {
      // Generate a temporary order number
      const tempOrder = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setOrderNumber(tempOrder);
    }

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/marketplace');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        
        <h1>Order Submitted!</h1>
        
        <div className="order-info">
          <p className="order-number">Order #{orderNumber}</p>
          <p className="order-date">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="message-box">
          <p>Thank you for your order!</p>
          <p>Our team will review your order and get back to you within 24 hours.</p>
          <p>You will receive a confirmation email shortly with your order details.</p>
        </div>

        <div className="whatsapp-message">
          <p>📞 Please confirm your order via WhatsApp to avoid cancellation:</p>
          <a href="https://wa.me/923163782435" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
            📱 Confirm on WhatsApp +92 316 3782435
          </a>
          <p className="warning">Orders not confirmed within 24 hours may be cancelled.</p>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ You will receive an email confirmation</li>
            <li>✓ Our team will review your request</li>
            <li>✓ Seller will contact you with a quote</li>
            <li>✓ Confirm your order to proceed</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link href="/marketplace" className="btn-primary">
            Continue Shopping
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
          <Link href="/" className="btn-home">
            Back to Home
          </Link>
        </div>

        <div className="redirect-message">
          <p>Redirecting to marketplace in {countdown} seconds...</p>
        </div>
      </div>

      <style jsx>{`
        .confirmation-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .confirmation-card {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          animation: scale 0.5s ease-in-out;
        }
        @keyframes scale {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .confirmation-card h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 20px;
        }
        .order-info {
          background: #f0f7ff;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .order-number {
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        .order-date {
          color: #666;
          font-size: 14px;
        }
        .message-box {
          background: #e8f5e9;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .message-box p {
          margin: 5px 0;
          color: #2e7d32;
        }
        .whatsapp-message {
          background: #fff3e0;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .whatsapp-btn {
          display: inline-block;
          background: #25D366;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 10px 0;
          transition: transform 0.2s;
        }
        .whatsapp-btn:hover {
          transform: translateY(-2px);
        }
        .warning {
          color: #e65100;
          font-size: 12px;
          margin-top: 10px;
        }
        .next-steps {
          text-align: left;
          background: #f5f5f5;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .next-steps h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        .next-steps li {
          padding: 8px 0;
          color: #555;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .btn-primary, .btn-secondary, .btn-home {
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .btn-primary {
          background: #27ae60;
          color: white;
        }
        .btn-secondary {
          background: #667eea;
          color: white;
        }
        .btn-home {
          background: #6c757d;
          color: white;
        }
        .btn-primary:hover, .btn-secondary:hover, .btn-home:hover {
          transform: translateY(-2px);
        }
        .redirect-message {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #999;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
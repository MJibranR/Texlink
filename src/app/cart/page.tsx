'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string;
  seller_name: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?redirect=/cart');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const res = await fetch(`/api/cart?userId=${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          productId,
          quantity: newQuantity
        })
      });
      
      if (res.ok) {
        setCart(cart.map(item => 
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cart?userId=${user?.id}&productId=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCart(cart.filter(item => item.product_id !== productId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <Link href="/marketplace" className="continue-shopping">Continue Shopping</Link>
        
        <style jsx>{`
          .empty-cart {
            max-width: 500px;
            margin: 80px auto;
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .empty-cart-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .empty-cart h2 {
            margin-bottom: 10px;
            color: #333;
          }
          .empty-cart p {
            color: #666;
            margin-bottom: 30px;
          }
          .continue-shopping {
            display: inline-block;
            background: #2c3e50;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-header">
            <div>Product</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
            <div></div>
          </div>
          
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} />
                  ) : (
                    <div className="image-placeholder">🧵</div>
                  )}
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p className="seller">{item.seller_name}</p>
                </div>
              </div>
              <div className="item-price">₨{item.price.toLocaleString()}/{item.unit}</div>
              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">₨{(item.price * item.quantity).toLocaleString()}</div>
              <div className="item-remove">
                <button onClick={() => removeItem(item.product_id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₨{subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>tax (5%)</span>
            <span>₨{tax.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₨{total.toLocaleString()}</span>
          </div>
          {/* In your cart page, update the checkout button: */}
          <Link href={`/checkout?productId=${cart[0]?.product_id || ''}`} className="checkout-btn">
            Proceed to Checkout
          </Link>
          <br />
          <Link href="/marketplace" className="continue-btn">Continue Shopping</Link>
        </div>
      </div>

      <style jsx>{`
        .cart-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .cart-page h1 {
          font-size: 32px;
          margin-bottom: 30px;
        }
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 30px;
        }
        .cart-items {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .cart-header {
          display: grid;
          grid-template-columns: 3fr 1fr 1.5fr 1fr 0.5fr;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .cart-item {
          display: grid;
          grid-template-columns: 3fr 1fr 1.5fr 1fr 0.5fr;
          align-items: center;
          padding: 20px 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        .item-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .item-image {
          width: 60px;
          height: 60px;
          background: #f5f5f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .image-placeholder {
          font-size: 30px;
        }
        .item-info h3 {
          margin-bottom: 5px;
          font-size: 16px;
        }
        .seller {
          font-size: 12px;
          color: #666;
        }
        .item-price {
          color: #666;
        }
        .item-quantity {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .item-quantity button {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }
        .item-quantity span {
          min-width: 30px;
          text-align: center;
        }
        .item-total {
          font-weight: 600;
          color: #2c3e50;
        }
        .item-remove button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
        }
        .cart-summary {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 100px;
          height: fit-content;
        }
        .cart-summary h2 {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 20px;
          border-top: 2px solid #f0f0f0;
          margin-top: 10px;
          padding-top: 20px;
        }
        .checkout-btn, .continue-btn {
          display: block;
          text-align: center;
          padding: 14px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 15px;
        }
        .checkout-btn {
          background: #27ae60;
          color: white;
        }
        .continue-btn {
          background: #e0e0e0;
          color: #333;
        }
        .loading {
          text-align: center;
          padding: 50px;
        }
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
          .cart-header {
            display: none;
          }
          .cart-item {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .item-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
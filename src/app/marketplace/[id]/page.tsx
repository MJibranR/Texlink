'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  price: number;
  unit: string;
  description: string;
  seller_name: string;
  seller_id: number;
  seller_city: string;
  seller_phone: string;
  seller_email: string;
  quantity_available: number;
  minimum_order: number;
  city: string;
  is_verified: boolean;
  images: string[];
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products?id=${id}`);
      const data = await res.json();
      if (!data) {
        router.push('/marketplace');
        return;
      }
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login?redirect=/marketplace/' + id);
      return;
    }
    
    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          productId: parseInt(id as string),
          quantity: quantity
        })
      });
      
      if (res.ok) {
        alert(`Added ${quantity} ${product?.unit}(s) to cart!`);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = () => {
    if (product && product.id) {
      console.log('Navigating to checkout with productId:', product.id);
      router.push(`/checkout?productId=${product.id}`);
    } else {
      console.error('Product ID not found');
      alert('Product ID not found. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="loading">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <Link href="/marketplace" className="back-link">← Back to Marketplace</Link>

        <div className="product-layout">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="main-image">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.title} />
              ) : (
                <div className="placeholder">🧵</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnails">
                {product.images.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="thumbnail">
                    <img src={img} alt={`${product.title} ${idx + 2}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1>{product.title}</h1>
            <div className="seller">
              Sold by: <strong>{product.seller_name}</strong>
              <span className="location">📍 {product.seller_city}</span>
              {product.is_verified && <span className="verified">✓ Verified Seller</span>}
            </div>

            <div className="price">
              ₨{product.price.toLocaleString()}/{product.unit}
              {product.minimum_order > 1 && (
                <span className="min-order">Minimum order: {product.minimum_order} {product.unit}</span>
              )}
            </div>

            <div className="quantity-selector">
              <label>Quantity ({product.unit}s):</label>
              <button onClick={() => setQuantity(Math.max(product.minimum_order, quantity - 1))}>-</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(product.minimum_order, parseInt(e.target.value) || 0))} 
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
              <span>{product.quantity_available} available</span>
            </div>

            <div className="total-price">
              Total: ₨{(product.price * quantity).toLocaleString()}
            </div>

            <div className="actions">
              <button 
                className="btn-cart" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              <button 
                className="btn-checkout" 
                onClick={handleCheckout}
              >
                📞 CheckOut
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h2>Product Details</h2>
            <p>{product.description}</p>
            
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Material</span>
                <span className="spec-value">Textile Grade</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Location</span>
                <span className="spec-value">{product.city}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Listed On</span>
                <span className="spec-value">{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #666;
          text-decoration: none;
        }
        .back-link:hover {
          color: #667eea;
        }
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .main-image {
          background: #f5f5f5;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          overflow: hidden;
        }
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          font-size: 100px;
        }
        .thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .thumbnail {
          width: 80px;
          height: 80px;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .seller {
          margin: 15px 0;
          padding: 15px 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }
        .location, .verified {
          margin-left: 15px;
          font-size: 14px;
          color: #666;
        }
        .verified {
          color: #27ae60;
        }
        .price {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin: 20px 0;
        }
        .min-order {
          display: block;
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
        }
        .quantity-selector button {
          width: 30px;
          height: 30px;
          background: #f0f0f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .quantity-selector button:hover {
          background: #e0e0e0;
        }
        .quantity-selector input {
          width: 60px;
          padding: 8px;
          text-align: center;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .total-price {
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          color: #2c3e50;
        }
        .actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .btn-cart, .btn-checkout {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }
        .btn-cart {
          background: #2c3e50;
          color: white;
        }
        .btn-cart:hover:not(:disabled) {
          background: #1a252f;
          transform: translateY(-2px);
        }
        .btn-cart:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-checkout {
          background: #27ae60;
          color: white;
        }
        .btn-checkout:hover {
          background: #219a52;
          transform: translateY(-2px);
        }
        .product-details {
          grid-column: span 2;
        }
        .product-details h2 {
          margin-bottom: 15px;
          color: #333;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .spec-label {
          font-weight: 600;
          color: #666;
        }
        .spec-value {
          color: #333;
        }
        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
          color: #666;
        }
        @media (max-width: 768px) {
          .product-layout {
            grid-template-columns: 1fr;
          }
          .product-details {
            grid-column: span 1;
          }
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

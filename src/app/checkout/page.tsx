'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  seller_name: string;
  image_url: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productIdFromUrl = searchParams.get('productId');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  
  const [formData, setFormData] = useState({
    product_id: productIdFromUrl || '',
    quantity: 1,
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    shipping_address: '',
    notes: '',
    budget_range: ''
  });

  useEffect(() => {
    console.log('Product ID from URL:', productIdFromUrl);
    
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        company_name: parsedUser.company_name || '',
        contact_person: parsedUser.full_name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      }));
    }

    // First try to get product from URL
    if (productIdFromUrl) {
      fetchProductDetails(productIdFromUrl);
    } else {
      // If no productId, check if user has items in cart
      fetchCartAndCheckout();
    }
  }, [productIdFromUrl]);

  const fetchCartAndCheckout = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setLoadingProduct(false);
        setError('Please login to checkout');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cart?userId=${parsedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        setCartItems(data);
        setIsCartCheckout(true);
        // Set the first product for display
        const firstProduct = data[0];
        setProduct({
          id: firstProduct.product_id,
          title: firstProduct.title,
          price: firstProduct.price,
          unit: firstProduct.unit
        });
        setFormData(prev => ({
          ...prev,
          product_id: firstProduct.product_id.toString(),
          quantity: firstProduct.quantity
        }));
        console.log('Cart checkout mode - product:', firstProduct);
      } else {
        setError('No items in cart. Please add products to your cart first.');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items');
    } finally {
      setLoadingProduct(false);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      console.log('Fetching product:', productId);
      const res = await fetch(`/api/products?id=${productId}`);
      const data = await res.json();
      if (data && data.id) {
        setProduct(data);
        setFormData(prev => ({ ...prev, product_id: productId }));
        console.log('Product loaded:', data.title);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Submitting form data:', formData);
    
    // Validate form
    if (!formData.product_id) {
      setError('No product selected');
      setLoading(false);
      return;
    }
    if (!formData.company_name || !formData.contact_person || !formData.email || !formData.phone || !formData.shipping_address) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // If checking out from cart, clear cart after successful order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ 
          product_id: parseInt(formData.product_id),
          quantity: formData.quantity,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          shipping_address: formData.shipping_address,
          notes: formData.notes,
          budget_range: formData.budget_range
        })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        // Clear cart if it was a cart checkout
        if (isCartCheckout && user) {
          await fetch(`/api/cart?userId=${user.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/formalities/order-confirmation');
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h1>{error}</h1>
        <Link href="/cart" style={{ padding: '12px 24px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Go to Cart</Link>
        <Link href="/marketplace" style={{ padding: '12px 24px', background: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Browse Products</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', color: '#27ae60' }}>✓</div>
          <h1>Quote Request Sent!</h1>
          <p>Your request has been submitted successfully. The seller will contact you within 24 hours.</p>
          <Link href="/marketplace" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Request Quote</h1>
      
      {product && (
        <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>Product:</strong> {product.title}</p>
          <p><strong>Price:</strong> ₨{product.price}/{product.unit}</p>
          {isCartCheckout && cartItems.length > 1 && (
            <p style={{ color: '#666', fontSize: '14px' }}>Note: You have {cartItems.length} items in your cart. This quote is for the selected product.</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Company Name *</label>
            <input type="text" required value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Contact Person *</label>
            <input type="text" required value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone *</label>
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quantity *</label>
            <input type="number" required min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} disabled={isCartCheckout} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Budget Range</label>
            <select value={formData.budget_range} onChange={(e) => setFormData({...formData, budget_range: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <option value="">Select</option>
              <option value="under-50000">Under ₨50,000</option>
              <option value="50000-100000">₨50,000 - ₨100,000</option>
              <option value="100000-500000">₨100,000 - ₨500,000</option>
              <option value="above-1m">Above ₨500,000</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Shipping Address *</label>
          <textarea required rows={3} value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Additional Notes</label>
          <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loading ? 'Submitting...' : 'Submit Quote Request'}</button>
          <Link href="/cart" style={{ padding: '12px 24px', background: '#ccc', color: '#333', textDecoration: 'none', borderRadius: '5px' }}>Back to Cart</Link>
        </div>
      </form>
    </div>
  );
}
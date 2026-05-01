'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const parsedUser = JSON.parse(userData);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cart?userId=${parsedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data);
      setCartCount(data.reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login?redirect=/marketplace';
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parsedUser.id,
          productId,
          quantity
        })
      });
      await fetchCart();
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const parsedUser = JSON.parse(userData);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/cart?userId=${parsedUser.id}&productId=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const parsedUser = JSON.parse(userData);
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parsedUser.id,
          productId,
          quantity
        })
      });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const parsedUser = JSON.parse(userData);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/cart?userId=${parsedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
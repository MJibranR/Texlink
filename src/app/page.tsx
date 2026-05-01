'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  price: number;
  unit: string;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface Stats {
  totalProducts: number;
  totalSuppliers: number;
  totalBuyers: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSuppliers: 0,
    totalBuyers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all data in parallel
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/products/featured'),
        fetch('/api/categories'),
        fetch('/api/stats')
      ]);
      
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const statsData = await statsRes.json();
      
      setFeaturedProducts(productsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="top-banner">
        <p>📞 Please confirm order via phone/WhatsApp at +92 316 3782435 | Orders not confirmed within 24 hours may be cancelled</p>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">PREMIUM TEXTILE MARKETPLACE</span>
            <h1>Connect with <span className="highlight">Verified Textile Suppliers</span> Across Pakistan</h1>
            <p>Source premium fabrics, denim, yarns, and accessories directly from manufacturers. Best prices, guaranteed quality.</p>
            <div className="hero-buttons">
              <Link href="/marketplace" className="btn-primary">Start Sourcing →</Link>
              <Link href="/sell" className="btn-outline">Become a Seller</Link>
            </div>
            <div className="trust-badges">
              <span>✓ {stats.totalProducts.toLocaleString()}+ Products</span>
              <span>✓ {stats.totalSuppliers.toLocaleString()}+ Suppliers</span>
              <span>✓ 100% Verified</span>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-placeholder">
              <div className="fabric-roll">🧵</div>
              <div className="fabric-roll">👖</div>
              <div className="fabric-roll">🧶</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2>Why Choose <span className="highlight">TexLink?</span></h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🏭</div>
              <h3>100% ORIGINAL</h3>
              <p>Authentic textile materials sourced directly from trusted manufacturers</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌍</div>
              <h3>LOCAL & GLOBAL</h3>
              <p>Connect with suppliers from Karachi, Lahore, Faisalabad and beyond</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>FAST, SECURE DELIVERY</h3>
              <p>Quick nationwide shipping with full tracking and insurance</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎁</div>
              <h3>BULK ORDER DEALS</h3>
              <p>Special pricing for bulk orders and repeat customers</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔄</div>
              <h3>EASY RETURNS</h3>
              <p>Hassle-free return policy for quality issues</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💬</div>
              <h3>EXPERT CONSULTATION</h3>
              <p>Get personalized material advice from textile experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Dynamically from Database */}
      <section className="categories">
        <div className="container">
          <h2>Shop by <span className="highlight">Category</span></h2>
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <Link 
                  href={`/marketplace?category=${category.name}`} 
                  key={category.id} 
                  className="category-card"
                >
                  <div className="category-icon">{category.icon || '📁'}</div>
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Shop now'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - Dynamically from Database */}
      <section className="featured">
        <div className="container">
          <h2>Featured <span className="highlight">Collections</span></h2>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                    <Link href={`/marketplace/${product.id}`} className="btn-view">
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} />
                    ) : (
                      <div className="image-placeholder">🧵</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="price">₨{product.price.toLocaleString()}/{product.unit}</p>
                    <div className="badge">✓ Verified Seller</div>
                  </div>
                  </Link>
                </div>
              ))}
              {featuredProducts.length === 0 && !loading && (
                <div className="no-products">No products found. Check back soon!</div>
              )}
            </div>
          )}
          </div>
          </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Sign Up And Save</h2>
            <p>Subscribe to get special offers, new arrivals, and once-in-a-lifetime deals.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <style jsx>{`
        .top-banner {
          background: #f39c12;
          color: white;
          text-align: center;
          padding: 10px;
          font-size: 14px;
        }
        .hero {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 60px 20px;
        }
        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }
        .hero-badge {
          background: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          display: inline-block;
          margin-bottom: 20px;
        }
        .hero h1 {
          font-size: 48px;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        .highlight {
          color: #f39c12;
        }
        .hero p {
          font-size: 18px;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        .hero-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        .btn-primary, .btn-outline {
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        .btn-primary {
          background: #f39c12;
          color: #1a1a2e;
        }
        .btn-outline {
          border: 2px solid #f39c12;
          color: #f39c12;
        }
        .trust-badges {
          display: flex;
          gap: 20px;
        }
        .trust-badges span {
          font-size: 14px;
        }
        .hero-image-placeholder {
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .fabric-roll {
          font-size: 80px;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .features, .categories, .featured, .newsletter {
          padding: 60px 0;
        }
        h2 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 40px;
          color: #333;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .feature {
          text-align: center;
          padding: 30px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .feature-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 25px;
        }
        .category-card {
          background: white;
          padding: 30px;
          text-align: center;
          border-radius: 12px;
          text-decoration: none;
          color: #333;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }
        .category-card:hover {
          transform: translateY(-5px);
        }
        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 30px;
        }
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .product-image {
          height: 200px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-placeholder {
          font-size: 64px;
        }
        .product-info {
          padding: 20px;
        }
        .price {
          font-size: 22px;
          font-weight: bold;
          color: #2c3e50;
          margin: 10px 0;
        }
        .badge {
          display: inline-block;
          background: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .btn-view {
          display: block;
          background: #2c3e50;
          color: white;
          text-align: center;
          padding: 10px;
          border-radius: 6px;
          text-decoration: none;
          margin-top: 15px;
        }
        .no-products {
          text-align: center;
          padding: 40px;
          color: #666;
          grid-column: span 4;
        }
        .newsletter {
          background: #1a1a2e;
          color: white;
        }
        .newsletter-content {
          text-align: center;
        }
        .newsletter-form {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
        }
        .newsletter-form input {
          padding: 14px 20px;
          width: 300px;
          border: none;
          border-radius: 8px;
        }
        .newsletter-form button {
          padding: 14px 30px;
          background: #f39c12;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
          }
          .hero h1 {
            font-size: 32px;
          }
          .hero-buttons {
            flex-direction: column;
          }
          .newsletter-form {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
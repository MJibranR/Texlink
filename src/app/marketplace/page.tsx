'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  price: number;
  unit: string;
  city: string;
  seller_name: string;
  image_url: string;
  category?: string;
}

interface CityFilter {
  city: string;
  count: number;
}

interface CategoryFilter {
  category: string;
  count: number;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cities, setCities] = useState<CityFilter[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const citiesRes = await fetch('/api/products/cities');
      const categoriesRes = await fetch('/api/products/categories');
      setCities(await citiesRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !selectedCity || product.city === selectedCity;
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="marketplace">
      <div className="header">
        <h1>Textile Marketplace</h1>
        <p>Discover quality textile materials from verified suppliers across Pakistan</p>
      </div>

      <div className="filters">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
        <select onChange={(e) => setSelectedCity(e.target.value)} className="filter-select" value={selectedCity}>
          <option value="">All Cities</option>
          {cities.map(city => <option key={city.city} value={city.city}>{city.city}</option>)}
        </select>
        <select onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select" value={selectedCategory}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.category} value={cat.category}>{cat.category}</option>)}
        </select>
        <button onClick={() => { setSearch(''); setSelectedCity(''); setSelectedCategory(''); }} className="clear-btn">
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="results-count">{filteredProducts.length} products found</div>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
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
                  <p className="seller">{product.seller_name}</p>
                  <p className="location">📍 {product.city}</p>
                  <div className="badge">✓ Verified Supplier</div>
                  <Link href={`/marketplace/${product.id}`} className="btn-view">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .marketplace {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 36px;
          margin-bottom: 10px;
          color: #333;
        }
        .header p {
          color: #666;
        }
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .search-box {
          flex: 2;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .filter-select {
          flex: 1;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          background: white;
        }
        .clear-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .results-count {
          margin-bottom: 20px;
          color: #666;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }
        .product-card:hover {
          transform: translateY(-5px);
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
        .product-info h3 {
          margin-bottom: 10px;
          font-size: 18px;
        }
        .price {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin: 10px 0;
        }
        .seller, .location {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .badge {
          display: inline-block;
          background: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 10px 0;
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
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
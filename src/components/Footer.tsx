'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3>About TexLink</h3>
            <p>Pakistan's first digital B2B textile marketplace connecting verified importers and manufacturers across major cities.</p>
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer">📘</a>
              <a href="#" target="_blank" rel="noopener noreferrer">📷</a>
              <a href="#" target="_blank" rel="noopener noreferrer">💼</a>
              <a href="#" target="_blank" rel="noopener noreferrer">🐦</a>
            </div>
          </div>

          {/* Shop by Category */}
          <div className="footer-section">
            <h3>Shop by Category</h3>
            <ul>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/marketplace?category=${cat.name}`}>
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="/formalities/privacy">Privacy Policy</Link></li>
              <li><Link href="/formalities/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <span className="icon">📍</span>
                <span>Karachi</span>
              </li>
              <li>
                <span className="icon">📞</span>
                <span>+92 316 3782435</span>
              </li>
              <li>
                <span className="icon">✉️</span>
                <span>info@texlink.com</span>
              </li>
              <li>
                <span className="icon">🕐</span>
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 TexLink. All rights reserved. Pakistan's Trusted B2B Textile Platform</p>
          <p>Developed with ❤️ for Pakistan's Textile Industry</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #0a192f;
          color: #8892b0;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px 20px;
        }
        .footer-newsletter {
          text-align: center;
          padding: 40px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #112240 0%, #1a3650 100%);
          border-radius: 12px;
        }
        .footer-newsletter h3 {
          color: white;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .footer-newsletter p {
          margin-bottom: 20px;
        }
        .newsletter-form {
          display: flex;
          justify-content: center;
          gap: 10px;
          max-width: 500px;
          margin: 0 auto;
        }
        .newsletter-form input {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        }
        .newsletter-form button {
          padding: 12px 30px;
          background: #64ffda;
          color: #0a192f;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .newsletter-form button:hover {
          transform: translateY(-2px);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-section h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }
        .footer-section h3:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: #64ffda;
        }
        .footer-section ul {
          list-style: none;
          padding: 0;
        }
        .footer-section li {
          margin-bottom: 10px;
        }
        .footer-section a {
          color: #8892b0;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-section a:hover {
          color: #64ffda;
        }
        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .social-links a {
          font-size: 24px;
          text-decoration: none;
        }
        .contact-info li {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .contact-info .icon {
          font-size: 18px;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #233554;
          font-size: 14px;
        }
        .footer-bottom p {
          margin: 5px 0;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .newsletter-form {
            flex-direction: column;
          }
          .footer-newsletter {
            padding: 30px 20px;
          }
        }
      `}</style>
    </footer>
  );
}
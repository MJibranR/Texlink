'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <div className="container">
        <div className="header">
          <h1>Privacy Policy</h1>
          <p>Last updated: May 1, 2026</p>
        </div>

        <div className="content">
          <section>
            <h2>1. Information We Collect</h2>
            <p><strong>Personal Information:</strong> Name, email address, phone number, company name, billing address, shipping address.</p>
            <p><strong>Account Information:</strong> Username, password, account preferences.</p>
            <p><strong>Transaction Information:</strong> Products viewed, orders placed, payment information.</p>
            <p><strong>Technical Information:</strong> IP address, browser type, device information, cookies.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>2.1. To create and manage your account</p>
            <p>2.2. To process and fulfill orders</p>
            <p>2.3. To communicate with you about orders, products, and promotions</p>
            <p>2.4. To improve our platform and customer service</p>
            <p>2.5. To prevent fraud and ensure security</p>
            <p>2.6. To comply with legal obligations</p>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <p>• Sellers to fulfill your orders</p>
            <p>• Payment processors to handle transactions</p>
            <p>• Shipping partners to deliver products</p>
            <p>• Legal authorities when required by law</p>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits.</p>
          </section>

          <section>
            <h2>5. Cookies</h2>
            <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <p>• Access your personal information</p>
            <p>• Correct inaccurate information</p>
            <p>• Request deletion of your data</p>
            <p>• Opt-out of marketing communications</p>
            <p>• Export your data</p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>We retain your personal information as long as your account is active or as needed to provide services. You may request deletion of your account at any time.</p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>Our platform is not intended for children under 18. We do not knowingly collect information from minors.</p>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>
          </section>

          <section>
            <h2>10. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy periodically. We will notify you of significant changes via email or platform notification.</p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>If you have questions about this privacy policy, contact us at:</p>
            <p>Email: privacy@texlink.com</p>
            <p>Phone: +92 316 3782435</p>
            <p>Address: Sector 15-B, Buffer Zone, North Karachi, Karachi</p>
          </section>

          <div className="acceptance">
            <p>By using TexLink, you consent to our Privacy Policy and agree to its terms.</p>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/">← Back to Home</Link>
        </div>
      </div>

      <style jsx>{`
        .privacy-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #f5f7fa;
          min-height: calc(100vh - 200px);
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
          font-size: 36px;
          color: #333;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
        }
        .content section {
          margin-bottom: 30px;
        }
        .content h2 {
          font-size: 20px;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e0e0e0;
        }
        .content p {
          color: #555;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .acceptance {
          margin-top: 40px;
          padding: 20px;
          background: #f0f7ff;
          border-radius: 8px;
          text-align: center;
        }
        .acceptance p {
          margin: 0;
          font-weight: 500;
          color: #667eea;
        }
        .footer-links {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .footer-links a {
          color: #667eea;
          text-decoration: none;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
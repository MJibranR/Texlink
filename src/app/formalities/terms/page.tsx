'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="terms-container">
      <div className="container">
        <div className="header">
          <h1>Terms & Conditions</h1>
          <p>Last updated: January 1, 2024</p>
        </div>

        <div className="content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using TexLink (the "Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>TexLink is a B2B textile marketplace connecting buyers and sellers of textile products including fabrics, denim, yarn, leather, accessories, and related materials.</p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>3.1. You must create an account to use certain features of the platform.</p>
            <p>3.2. You are responsible for maintaining the confidentiality of your account credentials.</p>
            <p>3.3. You agree to provide accurate and complete information during registration.</p>
            <p>3.4. You are responsible for all activities that occur under your account.</p>
          </section>

          <section>
            <h2>4. Seller Terms</h2>
            <p>4.1. Sellers must provide accurate product descriptions, pricing, and availability.</p>
            <p>4.2. All products listed must be genuine and meet quality standards.</p>
            <p>4.3. Sellers are responsible for fulfilling orders as described.</p>
            <p>4.4. TexLink reserves the right to verify seller information before approval.</p>
            <p>4.5. A tax fee of 5% applies to successful transactions.</p>
          </section>

          <section>
            <h2>5. Buyer Terms</h2>
            <p>5.1. Buyers must provide accurate shipping and contact information.</p>
            <p>5.2. Orders must be confirmed within 24 hours of placement.</p>
            <p>5.3. Buyers agree to pay the agreed-upon price for products ordered.</p>
          </section>

          <section>
            <h2>6. Product Listings</h2>
            <p>6.1. All product listings must be approved by TexLink before appearing in the marketplace.</p>
            <p>6.2. Sellers may not list prohibited or counterfeit items.</p>
            <p>6.3. TexLink reserves the right to remove any listing that violates our policies.</p>
          </section>

          <section>
            <h2>7. Payments & Fees</h2>
            <p>7.1. TexLink charges a 5% tax fee on all successful transactions.</p>
            <p>7.2. Payment processing fees may apply based on the payment method chosen.</p>
            <p>7.3. All prices are listed in Pakistani Rupees (PKR).</p>
          </section>

          <section>
            <h2>8. Shipping & Delivery</h2>
            <p>8.1. Sellers are responsible for shipping products as described.</p>
            <p>8.2. Delivery times may vary based on location and shipping method.</p>
            <p>8.3. Buyers should confirm orders via phone/WhatsApp within 24 hours.</p>
          </section>

          <section>
            <h2>9. Returns & Refunds</h2>
            <p>9.1. Returns are accepted within 7 days of delivery for quality issues.</p>
            <p>9.2. Products must be in original condition for return eligibility.</p>
            <p>9.3. Refunds will be processed after product inspection.</p>
          </section>

          <section>
            <h2>10. Intellectual Property</h2>
            <p>All content on TexLink, including logos, trademarks, and graphics, is the property of TexLink and protected by intellectual property laws.</p>
          </section>

          <section>
            <h2>11. Limitation of Liability</h2>
            <p>TexLink is not liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>
          </section>

          <section>
            <h2>12. Termination</h2>
            <p>TexLink reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities.</p>
          </section>

          <section>
            <h2>13. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2>14. Contact Information</h2>
            <p>For questions about these terms, contact us at: info@texlink.com or call +92 316 3782435</p>
          </section>

          <div className="acceptance">
            <p>By using TexLink, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/">← Back to Home</Link>
        </div>
      </div>

      <style jsx>{`
        .terms-container {
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
          margin-bottom: 10px;
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
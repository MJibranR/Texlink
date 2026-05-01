'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  id: number;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
}

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Invoice not found');
      }
      
      const data = await res.json();
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="not-found">
        <h1>Invoice Not Found</h1>
        <Link href="/dashboard/orders">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-actions no-print">
        <button onClick={handlePrint} className="btn-print">🖨️ Print Invoice</button>
        <Link href="/dashboard/orders" className="btn-back">← Back to Orders</Link>
      </div>

      <div className="invoice-card" id="invoice-content">
        <div className="invoice-header">
          <div className="logo-section">
            <h1>🧵 TexLink</h1>
            <p>Pakistan's Trusted B2B Textile Marketplace</p>
          </div>
          <div className="invoice-title">
            <h2>INVOICE</h2>
            <p>#{invoice.order_number}</p>
          </div>
        </div>

        <div className="company-info">
          <div className="info-box">
            <h3>From:</h3>
            <p><strong>TexLink Marketplace</strong></p>
            <p>Sector 15-B, Buffer Zone</p>
            <p>North Karachi, Karachi</p>
            <p>Phone: +92 316 3782435</p>
            <p>Email: info@texlink.com</p>
          </div>
          <div className="info-box">
            <h3>Bill To:</h3>
            <p><strong>{invoice.customer_name}</strong></p>
            <p>{invoice.customer_address}</p>
            <p>Phone: {invoice.customer_phone}</p>
            <p>Email: {invoice.customer_email}</p>
          </div>
        </div>

        <div className="invoice-details">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price (PKR)</th>
                <th>Total (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>₨{item.unit_price.toLocaleString()}</td>
                  <td>₨{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₨{invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%):</span>
            <span>₨{(invoice.subtotal * 0.05).toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>₨{invoice.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="payment-info">
          <h3>Payment Information</h3>
          <p><strong>Bank:</strong> Habib Bank Limited (HBL)</p>
          <p><strong>Account Title:</strong> TexLink Marketplace</p>
          <p><strong>Account Number:</strong> 1234-567890-01</p>
          <p><strong>IBAN:</strong> PK12 HABB 0012 3456 7890 1234</p>
        </div>

        <div className="invoice-footer">
          <div className="terms">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>Please confirm order within 24 hours</li>
              <li>Free delivery on direct bank transfers</li>
              <li>For inquiries: +92 316 3782435</li>
            </ul>
          </div>
          <div className="signature">
            <p>Authorized Signature</p>
            <div className="signature-line"></div>
            <p className="date">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="thankyou">
          <p>Thank you for choosing TexLink!</p>
          <p>For support, contact us at +92 316 3782435 or info@texlink.com</p>
        </div>
      </div>

      <style jsx>{`
        .invoice-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #f5f7fa;
          min-height: calc(100vh - 200px);
        }
        .invoice-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .btn-print, .btn-back {
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .btn-print {
          background: #667eea;
          color: white;
        }
        .btn-back {
          background: #6c757d;
          color: white;
        }
        .invoice-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        .logo-section h1 {
          font-size: 28px;
          color: #667eea;
          margin-bottom: 5px;
        }
        .logo-section p {
          color: #666;
          font-size: 12px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h2 {
          font-size: 24px;
          color: #333;
        }
        .invoice-title p {
          color: #666;
          font-weight: 500;
        }
        .company-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .info-box h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .info-box p {
          margin: 5px 0;
          font-size: 14px;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .invoice-table th, .invoice-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .invoice-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .invoice-summary {
          width: 300px;
          margin-left: auto;
          margin-bottom: 30px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #e0e0e0;
          margin-top: 10px;
          padding-top: 15px;
        }
        .payment-info {
          background: #f0f7ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .payment-info h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .payment-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .invoice-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .terms h3 {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .terms ul {
          list-style: none;
          padding: 0;
        }
        .terms li {
          font-size: 12px;
          color: #666;
          margin: 5px 0;
        }
        .signature {
          text-align: center;
        }
        .signature-line {
          width: 200px;
          height: 1px;
          background: #333;
          margin: 20px auto 10px;
        }
        .date {
          font-size: 12px;
          color: #666;
        }
        .thankyou {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .thankyou p {
          margin: 5px 0;
          color: #666;
        }
        .not-found {
          text-align: center;
          padding: 50px;
        }
        @media print {
          .no-print {
            display: none;
          }
          .invoice-container {
            background: white;
            padding: 0;
          }
          .invoice-card {
            box-shadow: none;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
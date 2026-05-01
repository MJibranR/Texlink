'use client';

import { useState } from 'react';

interface InquiryFormProps {
  listingId: number;
  sellerId: number;
}

export default function InquiryForm({ listingId, sellerId }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          listingId,
          sellerId
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', quantity: 1, message: '' });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="font-semibold text-green-800 mb-2">Inquiry Sent Successfully!</h3>
        <p className="text-green-700 text-sm">The supplier will contact you shortly.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-green-600 hover:underline text-sm"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-lg mb-3">CheckOut</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quantity ({listingId === 1 ? 'Meters' : 'Units'}) *</label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Message / Requirements</label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full p-2 border rounded-lg"
          placeholder="Tell the supplier about your specific requirements..."
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Inquiry'}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to our terms and privacy policy.
      </p>
    </form>
  );
}
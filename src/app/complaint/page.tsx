'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageSquare, Star, Send } from 'lucide-react';
import { submitComplaintAction } from '@/app/actions';

function ComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'ORD001';
  const tableId = searchParams.get('table') || 'TBL001';
  const sessionId = searchParams.get('session') || 'SES001';

  const [rating, setRating] = useState(5);
  const [complaintText, setComplaintText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitComplaintAction(orderId, complaintText, rating);
    setSubmitting(false);

    alert('Thank you! Your feedback has been recorded in the database.');
    router.push(`/tracking?order=${orderId}&table=${tableId}&session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/tracking?order=${orderId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Customer Feedback & Reports</h1>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full">
          Order #{orderId}
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <form onSubmit={handleSubmit} className="restaurant-card p-6 bg-white space-y-5 shadow-sm rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 text-base">How was your experience?</h2>
            <p className="text-xs text-slate-500">Report any service delays or leave a rating for your meal.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    rating >= star ? 'text-amber-500 bg-amber-50' : 'text-slate-300 bg-slate-50'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Feedback / Delay Complaint
            </label>
            <textarea
              rows={4}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Describe any delay or issue with your order..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-xs"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting to Database...' : 'Submit Feedback'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}

export default function ComplaintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading feedback form...</div>}>
      <ComplaintContent />
    </Suspense>
  );
}
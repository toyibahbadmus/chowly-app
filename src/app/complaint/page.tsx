'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageSquareWarning, Star, CheckCircle2 } from 'lucide-react';
import { submitComplaintAction } from '@/app/actions';

function ComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '1';
  const restaurantId = searchParams.get('restaurant') || '1';
  const tableId = searchParams.get('table') || '01';
  const sessionId = searchParams.get('session') || 'SES001';

  const [rating, setRating] = useState(5);
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      alert('Please enter your feedback or complaint details.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitComplaintAction(orderId, complaintText, rating);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/tracking?order=${orderId}&restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`);
      }, 2000);
    } else {
      alert('Failed to submit feedback to database.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/tracking?order=${orderId}&restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Report Delay / Feedback</h1>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full">
          Order #{orderId}
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {success ? (
          <div className="restaurant-card p-8 bg-white text-center space-y-3 shadow-sm rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">Feedback Submitted!</h2>
            <p className="text-xs text-slate-500">Thank you. Redirecting you back to tracking...</p>
          </div>
        ) : (
          <div className="restaurant-card p-6 bg-white space-y-5 shadow-sm rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">How is your experience?</h2>
                <p className="text-xs text-slate-500">Let staff know if you are experiencing any delays.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Customer Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Complaint / Delay Details
                </label>
                <textarea
                  rows={4}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe any delays with your food or service..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting to Database...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>
        )}
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
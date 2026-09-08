'use client'
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning, Star, Send } from 'lucide-react';

export default async function ComplaintPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order || 'ORD001';
  const tableId = params.table || 'TBL001';
  const sessionId = params.session || 'SES001';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/tracking?order=${orderId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Service Feedback & Complaint</h1>
        </div>
        <span className="text-xs bg-red-100 text-red-800 font-medium px-2.5 py-1 rounded-full">
          Order #{orderId}
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs flex items-start gap-3">
          <MessageSquareWarning className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <p>
            Experiencing a delay or issue with your order? Submit your feedback and rating below. This logs directly to management against your order record.
          </p>
        </div>

        <div className="restaurant-card p-6 bg-white space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Customer Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className="w-7 h-7 fill-amber-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="complaint-details" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Complaint Details
            </label>
            <textarea
              id="complaint-details"
              rows={4}
              placeholder="Describe the delay or issue (e.g., Serious delay in food preparation)..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Link
            href={`/tracking?order=${orderId}&table=${tableId}&session=${sessionId}`}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Submit Complaint</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
import Link from 'next/link';
import { CheckCircle2, Utensils, Home, ArrowRight } from 'lucide-react';

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order || 'ORD001';
  const tableId = params.table || 'TBL001';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Header Info */}
        <div className="space-y-2">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Successful (Pretend)
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thank You for Dining!</h1>
          <p className="text-xs text-slate-500">
            Your payment has been recorded successfully. Have a wonderful day and see you again soon at Ocean Basket.
          </p>
        </div>

        {/* Receipt Details Box */}
        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-xs border border-slate-100">
          <div className="flex justify-between text-slate-600">
            <span>Order Reference:</span>
            <span className="font-semibold text-slate-900">#{orderId}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Table Occupied:</span>
            <span className="font-semibold text-slate-900">{tableId}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment Status:</span>
            <span className="font-semibold text-emerald-600">Completed</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900">Total Paid:</span>
            <span className="font-bold text-emerald-600">₦45,500</span>
          </div>
        </div>

        {/* Return Action */}
        <div className="pt-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Welcome Page</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
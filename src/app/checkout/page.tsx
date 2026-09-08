'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { submitPaymentAction } from '@/app/actions';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'ORD001';
  const tableId = searchParams.get('table') || 'TBL001';
  const sessionId = searchParams.get('session') || 'SES001';

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [processing, setProcessing] = useState(false);
  const totalAmount = 45500;

  const handlePayment = async () => {
    setProcessing(true);
    const res = await submitPaymentAction(orderId, totalAmount, paymentMethod);
    setProcessing(false);

    if (res.success) {
      router.push(`/receipt?order=${orderId}&table=${tableId}&session=${sessionId}`);
    } else {
      alert('Payment processing failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/tracking?order=${orderId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Checkout & Settlement</h1>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
          Table {tableId}
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <p>
            You are settling your bill just before exiting the restaurant. All payments on Chowly are <strong>pretend payments</strong> clearly labelled for demonstration.
          </p>
        </div>

        <div className="restaurant-card p-6 bg-white space-y-5">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Amount Due</span>
            <h2 className="text-3xl font-extrabold text-slate-900">₦{totalAmount.toLocaleString()}</h2>
            <p className="text-xs text-slate-500">Order #{orderId} • All items served</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Pretend Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Card', 'Transfer', 'Cash'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl text-center font-medium text-xs cursor-pointer transition-all ${
                    paymentMethod === method
                      ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={processing}
            onClick={handlePayment}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{processing ? 'Recording Payment...' : 'Confirm Pretend Payment'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Printer, Home } from 'lucide-react';
import { getReceiptDataAction, submitPaymentAction } from '@/app/actions';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '1';
  const restaurantId = searchParams.get('restaurant') || '1';
  const tableId = searchParams.get('table') || '01';
  const sessionId = searchParams.get('session') || 'SES001';

  const [orderData, setOrderData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const data = await getReceiptDataAction(orderId);
        setOrderData(data.order);
        setItems(data.items);

        const totalAmount = data.items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
        
        if (data.order && data.order.overall_status !== 'Completed') {
          await submitPaymentAction(orderId, totalAmount, 'Card');
        }
      } catch (error) {
        console.error('Failed to load receipt:', error);
      } finally {
        setLoading(false);
      }
    }
    loadReceipt();
  }, [orderId]);

  const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const restaurantName = orderData?.restaurant_name || 'Restaurant';
  const restaurantLocation = orderData?.location || '';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/checkout?order=${orderId}&restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Receipt</h1>
        </div>
        <button
          type="button"
          onClick={() => typeof window !== 'undefined' && window.print()}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="restaurant-card p-6 bg-white space-y-6 shadow-sm rounded-2xl border border-slate-100">
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{restaurantName}</h2>
            <p className="text-xs text-slate-500">{restaurantLocation} • Table {tableId}</p>
            <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Settled & Paid (Pretend)
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400 text-center py-2">Loading items...</p>
              ) : items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No items recorded.</p>
              ) : (
                items.map((item: any) => (
                  <div key={item.order_item_id} className="flex justify-between text-sm text-slate-700">
                    <span>{item.quantity}x {item.name || 'Menu Item'}</span>
                    <span className="font-semibold">₦{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Status</span>
              <span className="font-semibold text-emerald-600">Paid</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-100">
              <span>Total Paid</span>
              <span className="text-emerald-600">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/?restaurant=${restaurantId}`}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all text-xs"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
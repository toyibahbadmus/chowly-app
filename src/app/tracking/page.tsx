import Link from 'next/link';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, Star, MessageSquare } from 'lucide-react';

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order || 'ORD001';
  const tableId = params.table || 'TBL001';
  const sessionId = params.session || 'SES001';

  // Live order and item status mirroring our database schema (orders & order_items)
  const orderDetails = {
    orderId: orderId,
    orderTime: '18:30',
    totalExpectedWait: 25,
    overallStatus: 'Processing',
    waiterName: 'David',
    items: [
      { id: 'ORIT001', name: 'Grilled Steak', quantity: 2, status: 'Preparing', prepTime: 25 },
      { id: 'ORIT002', name: 'Margarita', quantity: 3, status: 'Served', prepTime: 10 },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/cart?table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Order Status Tracking</h1>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full uppercase">
          {orderDetails.overallStatus}
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        
        {/* Waiting Clock Card */}
        <div className="restaurant-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Live Kitchen Timer</span>
            <span className="text-xs bg-emerald-500/40 px-2.5 py-1 rounded-full text-white">Order #{orderDetails.orderId}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold tracking-tight">{orderDetails.totalExpectedWait}</h2>
            <span className="text-sm font-medium text-emerald-100">Minutes Expected Wait</span>
          </div>
          <p className="text-xs text-emerald-100 pt-1 border-t border-emerald-500/30 flex items-center justify-between">
            <span>Assigned Waiter: <strong>{orderDetails.waiterName}</strong></span>
            <span>Table: <strong>{tableId}</strong></span>
          </p>
        </div>

        {/* Item-by-Item Progress */}
        <div className="restaurant-card p-5 bg-white space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Item Preparation Breakdown</h3>
          
          <div className="space-y-3">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.status === 'Served' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                  <p className="text-[10px] text-slate-400 pt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> {item.prepTime} mins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Action Links */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href={`/complaint?order=${orderId}&table=${tableId}&session=${sessionId}`}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium py-3 px-4 rounded-xl shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Report Delay / Rating</span>
          </Link>

          <Link
            href={`/receipt?order=${orderId}&table=${tableId}&session=${sessionId}`}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-3 px-4 rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Checkout</span>
          </Link>
        </div>

      </main>
    </div>
  );
}
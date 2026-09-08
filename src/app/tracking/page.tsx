import { Suspense } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

async function getOrderData(orderId: string) {
  try {
    const client = await pool.connect();
    const numericOrderId = Number(orderId) || 1;
    
    const orderRes = await client.query(
      `SELECT o.*, r.restaurant_name, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
       LEFT JOIN staff s ON o.staff_id = s.staff_id 
       WHERE o.order_id = $1`,
      [numericOrderId]
    );

    const itemsRes = await client.query(
      `SELECT oi.*, m.item_name as name, m.item_type as type 
       FROM order_items oi 
       LEFT JOIN menu m ON oi.menu_id = m.menu_id 
       WHERE oi.order_id = $1`,
      [numericOrderId]
    );

    client.release();

    return {
      order: orderRes.rows[0] || null,
      items: itemsRes.rows || [],
    };
  } catch (error) {
    console.error('Failed to fetch tracking data:', error);
    return { order: null, items: [] };
  }
}

async function TrackingContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; restaurant?: string; table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order || '1';
  const restaurantId = params.restaurant || '1';
  const tableId = params.table || '01';
  const sessionId = params.session || 'SES001';

  const { order, items } = await getOrderData(orderId);

  const totalWait = order?.total_expected_wait || 25;
  const overallStatus = order?.overall_status || 'Processing';
  const waiterName = order?.waiter_name || 'Staff';
  const restaurantName = order?.restaurant_name || 'Restaurant';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/cart?restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Order Tracking</h1>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full uppercase">
          {overallStatus}
        </span>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <div className="restaurant-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg space-y-3 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">{restaurantName}</span>
            <span className="text-xs bg-emerald-600 px-2.5 py-1 rounded-full text-white">Order #{orderId}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold text-yellow-600 tracking-tight">{totalWait}</h2>
            <span className="text-sm font-medium text-emerald-600">Minutes Expected Wait</span>
          </div>
          <p className="text-xs text-emerald-600 pt-1 border-t border-emerald-500/30 flex items-center justify-between">
            <span>Waiter: <strong>{waiterName}</strong></span>
            <span>Table: <strong>{tableId}</strong></span>
          </p>
        </div>

        <div className="restaurant-card p-5 bg-white space-y-4 shadow-sm rounded-2xl border border-slate-100">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Item Preparation Status</h3>
          
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No items found for this order.</p>
            ) : (
              items.map((item: any) => (
                <div key={item.order_item_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-sm">{item.name || 'Menu Item'}</h4>
                    <p className="text-xs text-slate-500">Qty: {item.quantity} • {item.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {item.item_preparation_status || 'Preparing'}
                    </span>
                    <p className="text-[10px] text-slate-400 pt-1 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {item.max_prep_time || 15} mins
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href={`/complaint?order=${orderId}&restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium py-3 px-4 rounded-xl shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Report Delay</span>
          </Link>

          <Link
            href={`/checkout?order=${orderId}&restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-3 px-4 rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Checkout</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; restaurant?: string; table?: string; session?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading order status...</div>}>
      <TrackingContent searchParams={searchParams} />
    </Suspense>
  );
}
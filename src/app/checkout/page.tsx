import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

async function getOrderTotalFromDB(orderId: string) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT SUM(oi.quantity * m.price) as total_amount 
       FROM order_items oi 
       JOIN menu m ON oi.menu_id = m.menu_id 
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return res.rows[0]?.total_amount ? Number(res.rows[0].total_amount) : 0;
  } catch (error) {
    console.error('Failed to fetch order total:', error);
    return 0;
  } finally {
    client.release();
  }
}

async function CheckoutContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order || 'ORD001';
  const tableId = params.table || 'TBL001';
  const sessionId = params.session || 'SES001';

  const totalAmount = await getOrderTotalFromDB(orderId);

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
            Settling bill for Order <strong>#{orderId}</strong> directly from PostgreSQL.
          </p>
        </div>

        <div className="restaurant-card p-6 bg-white space-y-5 shadow-sm rounded-2xl border border-slate-100">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Amount Due (Database Calculated)</span>
            <h2 className="text-3xl font-extrabold text-slate-900">₦{totalAmount.toLocaleString()}</h2>
            <p className="text-xs text-slate-500">Live order reference: {orderId}</p>
          </div>

          <form action={`/receipt?order=${orderId}&table=${tableId}&session=${sessionId}`} method="POST" className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Card', 'Transfer', 'Cash'].map((method) => (
                  <div key={method} className="text-center">
                    <input type="radio" id={method} name="paymentMethod" value={method} defaultChecked={method === 'Card'} className="peer hidden" />
                    <label htmlFor={method} className="block p-3 rounded-xl text-center font-medium text-xs cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 text-slate-750 peer-checked:border-2 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-800">
                      {method}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Settle Bill in Database</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; table?: string; session?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading checkout...</div>}>
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}
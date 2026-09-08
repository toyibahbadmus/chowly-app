import Link from 'next/link';
import { Users, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

async function getWaiterDashboardData() {
  try {
    const client = await pool.connect();

    // Fetch all active orders directly from PostgreSQL
    const ordersRes = await client.query(
      `SELECT o.*, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN staff s ON o.staff_id = s.staff_id 
       ORDER BY o.order_time DESC`
    );

    // Fetch all corresponding line items directly from PostgreSQL
    const itemsRes = await client.query(
      `SELECT oi.*, m.item_name as name, m.item_type as type 
       FROM order_items oi 
       LEFT JOIN menu m ON oi.menu_id = m.menu_id`
    );

    client.release();

    const orders = ordersRes.rows.map(order => ({
      ...order,
      items: itemsRes.rows.filter(item => item.order_id === order.order_id)
    }));

    return orders;
  } catch (error) {
    console.error('Failed to load waiter dashboard data from DB:', error);
    return [];
  }
}

export default async function WaiterDashboard() {
  const incomingOrders = await getWaiterDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Waiter Command Dashboard</h1>
            <p className="text-xs text-emerald-600 font-medium">Ocean Basket • Ikeja Branch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" /> Active Database View
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Floor Orders (PostgreSQL Live)</h2>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
            {incomingOrders.length} Total Orders in DB
          </span>
        </div>

        {incomingOrders.length === 0 ? (
          <div className="restaurant-card p-12 bg-white text-center space-y-3 shadow-sm rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-sm">No orders currently found in your PostgreSQL database.</p>
            <p className="text-xs text-slate-400">Place an order from the menu page to watch it populate here instantly!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingOrders.map((order: any) => (
              <div key={order.order_id} className="restaurant-card p-6 bg-white space-y-5 shadow-sm rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">Order #{order.order_id}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        order.overall_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.overall_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Assigned Waiter: <strong className="text-slate-700">{order.waiter_name || 'David'}</strong> • Session: {order.session_id} • Time: {new Date(order.order_time).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Max Wait: {order.total_expected_wait} mins</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items & Staff Assignment</h4>
                  
                  {order.items.map((item: any) => (
                    <div key={item.order_item_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.name || 'Menu Item'}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">{item.type}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Quantity: <strong>{item.quantity}</strong> • Status: <strong className="text-emerald-600">{item.item_preparation_status}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          defaultValue="Chef Gordon"
                          className="text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          <option value="Chef Gordon">Chef Gordon (Kitchen)</option>
                          <option value="Bartender Sam">Bartender Sam (Bar)</option>
                          <option value="Unassigned">Assign Staff...</option>
                        </select>

                        <button
                          type="button"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Served</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Users, ArrowLeft, Clock, CheckCircle2, Utensils, MapPin } from 'lucide-react';
import { getWaiterBranchDataAction, updateOrderAssignmentAction } from '@/app/actions';

function WaiterBranchContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant') || '1';

  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadBranchData = async () => {
    setLoading(true);
    try {
      const data = await getWaiterBranchDataAction(restaurantId);
      setOrders(data.orders);
      setItems(data.items);
      setStaff(data.staff);
    } catch (e) {
      console.error('Failed to load branch waiter data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranchData();
  }, [restaurantId]);

  const handleMarkServed = async (orderId: number, chefId: string, bartenderId: string) => {
    setUpdatingId(orderId);
    await updateOrderAssignmentAction(orderId, chefId, bartenderId, 'Served');
    await loadBranchData();
    setUpdatingId(null);
  };

  const chefs = staff.filter((s: any) => s.role.toLowerCase().includes('chef'));
  const bartenders = staff.filter((s: any) => s.role.toLowerCase().includes('bartender') || s.role.toLowerCase().includes('bar'));
  const restaurantName = orders[0]?.restaurant_name || `Branch #${restaurantId}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/waiter" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{restaurantName}</h1>
            <p className="text-xs text-emerald-600 font-medium">Live Staff & Order Workspace</p>
          </div>
        </div>

        <Link
          href="/waiter"
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl transition-colors"
        >
          Switch Branch
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="restaurant-card p-5 bg-white shadow-sm rounded-2xl border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Branch Orders Feed</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
              {orders.length} Active
            </span>
          </h2>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-12">Loading orders from database...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs text-slate-400">No active customer orders for this branch yet.</p>
              <p className="text-[10px] text-slate-400">Orders placed by customers will appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const orderItems = items.filter((i: any) => i.order_id === order.order_id);
                const isServed = order.overall_status === 'Served' || order.overall_status === 'Completed';

                return (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    orderItems={orderItems}
                    chefs={chefs}
                    bartenders={bartenders}
                    isServed={isServed}
                    isUpdating={updatingId === order.order_id}
                    onSave={handleMarkServed}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderCard({ order, orderItems, chefs, bartenders, isServed, isUpdating, onSave }: any) {
  const [selectedChef, setSelectedChef] = useState(order.chef_id || (chefs[0]?.id ?? ''));
  const [selectedBartender, setSelectedBartender] = useState(order.bartender_id || (bartenders[0]?.id ?? ''));

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Order #{order.order_id}
          </span>
          <span className="text-xs text-slate-500 ml-2">Session: SES0{order.session_id}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isServed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {order.overall_status}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Line Items:</p>
        {orderItems.map((item: any) => (
          <div key={item.order_item_id} className="flex justify-between text-xs text-slate-700">
            <span>{item.quantity}x {item.name || 'Item'}</span>
            <span className="text-slate-500">{item.item_preparation_status}</span>
          </div>
        ))}
      </div>

      {/* Staff Assignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Chef</label>
          <select
            value={selectedChef}
            onChange={(e) => setSelectedChef(e.target.value)}
            disabled={isServed}
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 disabled:opacity-60"
          >
            {chefs.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Bartender</label>
          <select
            value={selectedBartender}
            onChange={(e) => setSelectedBartender(e.target.value)}
            disabled={isServed}
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 disabled:opacity-60"
          >
            {bartenders.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs text-slate-500">
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <Clock className="w-3.5 h-3.5" /> Wait: {order.total_expected_wait} mins
        </span>

        {!isServed ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onSave(order.order_id, selectedChef, selectedBartender)}
            className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isUpdating ? 'Saving...' : 'Mark as Served'}</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Served
          </span>
        )}
      </div>
    </div>
  );
}

export default function WaiterBranchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading branch workspace...</div>}>
      <WaiterBranchContent />
    </Suspense>
  );
}
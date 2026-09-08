'use client';

import Link from 'next/link';
import { Users, ClipboardList, CheckCircle2, Clock, ChefHat, GlassWater, ArrowLeft } from 'lucide-react';

export default async function WaiterDashboard() {
  // Simulated incoming orders fetched from our database orders & order_items tables
  const incomingOrders = [
    {
      orderId: 'ORD001',
      tableId: 'TBL001',
      customerName: 'Alice Smith',
      orderTime: '18:30',
      overallStatus: 'Processing',
      totalWait: 25,
      items: [
        { id: 'ORIT001', name: 'Grilled Steak (x2)', type: 'Food', status: 'Preparing', assignedStaff: 'Chef Gordon' },
        { id: 'ORIT002', name: 'Margarita (x3)', type: 'Drink', status: 'Served', assignedStaff: 'Bartender Sam' },
      ],
    },
    {
      orderId: 'ORD002',
      tableId: 'TBL002',
      customerName: 'Bob Johnson',
      orderTime: '19:15',
      overallStatus: 'Delayed',
      totalWait: 20,
      items: [
        { id: 'ORIT003', name: 'Seafood Pasta (x1)', type: 'Food', status: 'Cooking', assignedStaff: 'Unassigned' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
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
            <Users className="w-3.5 h-3.5 text-emerald-600" /> Waiter: David (STF001)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Floor Orders</h2>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
            {incomingOrders.length} Orders Pending Action
          </span>
        </div>

        <div className="space-y-4">
          {incomingOrders.map((order) => (
            <div key={order.orderId} className="restaurant-card p-6 bg-white space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Order #{order.orderId}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      order.overallStatus === 'Delayed' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {order.overallStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Customer: <strong className="text-slate-700">{order.customerName}</strong> • Table: <strong className="text-emerald-600">{order.tableId}</strong> • Time: {order.orderTime}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Max Wait: {order.totalWait} mins</span>
                </div>
              </div>

              {/* Order Items & Staff Assignment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items & Staff Assignment</h4>
                
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">{item.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>Assigned Staff: <strong>{item.assignedStaff}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        defaultValue={item.assignedStaff}
                        className="text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        <option value="Chef Gordon">Chef Gordon (Kitchen)</option>
                        <option value="Bartender Sam">Bartender Sam (Bar)</option>
                        <option value="Unassigned">Assign Staff...</option>
                      </select>

                      <button
                        type="button"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


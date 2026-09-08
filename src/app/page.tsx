import Link from 'next/link';
import { Utensils, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { getRestaurantInfoAction } from '@/app/actions';

export default async function HomePage() {
  const info = await getRestaurantInfoAction();

  // Unique session identifier generator for database tracking
  const sessionId = `SES${Math.floor(1000 + Math.random() * 9000)}`;

  const tables = [
    { id: 'TBL001', name: 'Table 01 (Window View)', capacity: 4 },
    { id: 'TBL002', name: 'Table 02 (Center Booth)', capacity: 6 },
    { id: 'TBL003', name: 'Table 03 (Patio Outdoor)', capacity: 2 },
    { id: 'TBL004', name: 'VIP Lounge Table', capacity: 8 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Chowly</h1>
          <p className="text-xs text-emerald-600 font-medium">{info.branchName}</p>
        </div>
        <Link
          href="/waiter"
          className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" /> Waiter Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Status Banner */}
        <div className="restaurant-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg space-y-3 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">System Status</span>
            <span className="text-xs bg-emerald-500/40 px-2.5 py-1 rounded-full text-white">{info.status}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome to Chowly Dine-In</h2>
          <p className="text-xs text-emerald-100">
            Select your dining table below to initialize a persistent PostgreSQL session and access the live menu.
          </p>
        </div>

        {/* Table Selection */}
        <div className="restaurant-card p-6 bg-white space-y-4 shadow-sm rounded-2xl border border-slate-100">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Select Your Table</h3>
            <p className="text-xs text-slate-500">Choose where you are seated to link your order session.</p>
          </div>

          <div className="space-y-3">
            {tables.map((table) => (
              <Link
                key={table.id}
                href={`/menu?table=${table.id}&session=${sessionId}`}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm group-hover:border-emerald-500">
                    {table.id.replace('TBL', 'T')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900">{table.name}</h4>
                    <p className="text-xs text-slate-500">Capacity: {table.capacity} Guests • Database Linked</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Powered by Next.js App Router & PostgreSQL Database
        </div>

      </main>
    </div>
  );
}
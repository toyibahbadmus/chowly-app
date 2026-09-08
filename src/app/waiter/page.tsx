import Link from 'next/link';
import { Users, ArrowLeft, Utensils, MapPin, ChevronRight } from 'lucide-react';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

async function getRestaurants() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT restaurant_id as id, restaurant_name as name, location FROM restaurants ORDER BY restaurant_id');
    return res.rows;
  } catch (error) {
    return [];
  } finally {
    client.release();
  }
}

export default async function WaiterHubPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Staff & Waiter Portal</h1>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> Select Branch
        </span>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="restaurant-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg space-y-2 rounded-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600">Select Branch Workspace</h2>
          <p className="text-xs text-black">
            Choose a restaurant branch to view its live active orders, assign kitchen staff, and manage table service.
          </p>
        </div>

        <div className="space-y-3">
          {restaurants.map((rest: any) => (
            <Link
              key={rest.id}
              href={`/waiter/branch?restaurant=${rest.id}`}
              className="restaurant-card p-5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-300 transition-all flex items-center justify-between group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-900">{rest.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {rest.location}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
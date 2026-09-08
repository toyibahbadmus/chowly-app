'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Utensils, MapPin, ArrowRight } from 'lucide-react';
import { getRestaurantsAction, getTablesForRestaurantAction } from '@/app/actions';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('1');
  const [tables, setTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const sessionId = Math.floor(1000 + Math.random() * 9000);

  useEffect(() => {
    async function loadRestaurants() {
      const data = await getRestaurantsAction();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurantId(String(data[0].id));
      }
    }
    loadRestaurants();
  }, []);

  useEffect(() => {
    async function loadTables() {
      if (!selectedRestaurantId) return;
      setLoadingTables(true);
      const data = await getTablesForRestaurantAction(selectedRestaurantId);
      setTables(data);
      setLoadingTables(false);
    }
    loadTables();
  }, [selectedRestaurantId]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-emerald-600 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-all">
    <span className="text-lg font-black tracking-tighter">C</span>
  </div>
  <div className="flex flex-col">
    <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-1">
      Chowly<span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
    </h1>
    <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Multi-Restaurant Dine-In System</span>
  </div>
</div>
      
        <Link
          href="/waiter"
          className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" /> Waiter Dashboard
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="restaurant-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg space-y-3 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider text-black font-semibold">Welcome</span>
            <span className="text-xs bg-emerald-600 px-2.5 py-1 rounded-full text-white">5 Active Branches</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600">Choose Restaurant & Table</h2>
          <p className="text-xs text-black">
            Select your preferred dining branch and table number to begin your order session.
          </p>
        </div>

        {/* 1. Select Restaurant */}
        <div className="restaurant-card p-6 bg-white space-y-4 shadow-sm rounded-2xl border border-slate-100">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" /> 1. Select Restaurant Branch
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {restaurants.map((rest) => {
              const isSelected = String(selectedRestaurantId) === String(rest.id);
              return (
                <button
                  key={rest.id}
                  type="button"
                  onClick={() => setSelectedRestaurantId(String(rest.id))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'border-2 border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="font-bold text-slate-900 text-sm">{rest.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" /> {rest.location}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Select Table */}
        <div className="restaurant-card p-6 bg-white space-y-4 shadow-sm rounded-2xl border border-slate-100">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            2. Choose Your Table
          </h3>

          {loadingTables ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading tables for selected restaurant...</p>
          ) : tables.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No tables available for this restaurant.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tables.map((table) => (
                <Link
                  key={table.id}
                  href={`/menu?restaurant=${selectedRestaurantId}&table=${table.number}&session=${sessionId}`}
                  className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all group cursor-pointer text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm group-hover:border-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {table.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-emerald-900">Table {table.number}</h4>
                    <p className="text-[10px] text-slate-500">Capacity: {table.capacity} Guests</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
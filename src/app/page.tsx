'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Utensils, QrCode, ArrowRight, ShieldCheck, MapPin, Users } from 'lucide-react';

export default function WelcomePage() {
  const [selectedTable, setSelectedTable] = useState('TBL001');

  // Available tables matching our database setup
  const availableTables = [
    { id: 'TBL001', number: 'Table 04', capacity: '4 Seats (Ikeja)' },
    { id: 'TBL003', number: 'Table 07', capacity: '4 Seats (Ikeja)' },
    { id: 'TBL002', number: 'Table 12', capacity: '6 Seats (Victoria Island)' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience / Scenery Gradient Glow */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 p-8 text-center space-y-6 relative z-10">
        
        {/* Brand Icon Badge */}
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
          <Utensils className="w-8 h-8" />
        </div>

        {/* Header Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" /> Ocean Basket • Fine Dining Experience
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome to Chowly</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Immerse yourself in our exquisite dining atmosphere. Select your table number below to explore our fresh menu, submit orders, and track live kitchen preparation.
          </p>
        </div>

        {/* Scenery Preview Frame */}
        <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner flex items-center justify-center bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 space-y-1 p-4 text-center">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Atmosphere & Ambiance</span>
            <p className="text-xs font-medium text-slate-200 italic">"Warm lighting, premium seating, and coastal elegance."</p>
          </div>
        </div>

        {/* Table Selection Section */}
        <div className="space-y-3 text-left">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">
            Choose Your Dining Table Number
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableTables.map((tbl) => (
              <button
                key={tbl.id}
                type="button"
                onClick={() => setSelectedTable(tbl.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedTable === tbl.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-medium'
                }`}
              >
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {tbl.number}
                </span>
                <span className="text-[10px] text-slate-500">{tbl.capacity.split(' ')[0]} Seats</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/menu?table=${selectedTable}&session=SES001`}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all duration-200 text-sm cursor-pointer"
          >
            <span>Start Dining at {selectedTable === 'TBL002' ? 'Table 12' : selectedTable === 'TBL003' ? 'Table 07' : 'Table 04'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Real-Time Table Session</span>
          </div>
        </div>

      </div>

      {/* Footer Waiter Role Switch Hint */}
      <footer className="mt-6 text-center text-xs text-slate-500 relative z-10">
        Staff member? Access the <Link href="/waiter" className="text-emerald-400 underline font-medium hover:text-emerald-300">Waiter Dashboard</Link>
      </footer>
    </main>
  );
}
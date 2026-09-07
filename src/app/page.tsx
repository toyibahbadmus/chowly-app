import Link from 'next/link';
import { Utensils, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
          <Utensils className="w-8 h-8" />
        </div>

        {/* Header Info */}
        <div className="space-y-2">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Ocean Basket • Ikeja
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chowly Dining</h1>
          <p className="text-sm text-slate-500">
            Scan your table QR code, browse our premium menu, place orders, and track live kitchen preparation effortlessly.
          </p>
        </div>

        {/* Action Form / Button */}
        <div className="pt-4 space-y-3">
          <Link
            href="/menu?table=TBL001&session=SES001"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200"
          >
            <span>Start Dining (Table 04)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Real-Time Table Session</span>
          </div>
        </div>

      </div>

      {/* Footer Role Switch Hint */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        Staff member? Access the <Link href="/waiter" className="text-emerald-600 underline font-medium">Waiter Dashboard</Link>
      </footer>
    </main>
  );
}
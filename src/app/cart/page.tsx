import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Trash2, Clock, CheckCircle } from 'lucide-react';

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const tableId = params.table || 'TBL001';
  const sessionId = params.session || 'SES001';

  // Cart items state mirroring order_items table structure
  const cartItems = [
    {
      id: 'ORIT001',
      name: 'Grilled Steak',
      price: 15000,
      quantity: 2,
      prepTime: 25,
      type: 'Food',
    },
    {
      id: 'ORIT002',
      name: 'Margarita',
      price: 4500,
      quantity: 3,
      prepTime: 10,
      type: 'Drink',
    },
  ];

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const maxWaitTime = Math.max(...cartItems.map((item) => item.prepTime));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/menu?table=${tableId}&session=${sessionId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Your Order Cart</h1>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
          Table Active ({tableId})
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="restaurant-card p-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">{item.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Clock className="w-3 h-3" /> {item.prepTime} mins
                  </span>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <span className="font-bold text-slate-900">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </span>
                <button type="button" className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="restaurant-card p-5 space-y-4 bg-white">
          <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Summary & Estimated Wait</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Maximum Expected Preparation Time</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {maxWaitTime} Minutes
              </span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
              <span>Total Expected Bill</span>
              <span className="text-emerald-600">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href={`/tracking?order=ORD001&table=${tableId}&session=${sessionId}`}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Submit Multi-Item Order</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
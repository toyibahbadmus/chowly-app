import Link from 'next/link';
import { Utensils, ShoppingBag, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; session?: string }>;
}) {
  const params = await searchParams;
  const tableId = params.table || 'TBL001';
  const sessionId = params.session || 'SES001';

  // Simulated live menu items fetched from our database architecture
  const menuItems = [
    {
      id: 'MENU001',
      name: 'Grilled Steak',
      type: 'Food',
      price: 15000,
      prepTime: 25,
      available: true,
      description: 'Juicy premium cut grilled steak served with peppercorn sauce.',
    },
    {
      id: 'MENU002',
      name: 'Margarita',
      type: 'Drink',
      price: 4500,
      prepTime: 10,
      available: true,
      description: 'Refreshing classic cocktail with a salted rim and lime zest.',
    },
    {
      id: 'MENU004',
      name: 'Classic Burger',
      type: 'Food',
      price: 9500,
      prepTime: 15,
      available: true,
      description: 'Flame-grilled beef patty with melted cheese, lettuce, and special sauce.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ocean Basket • Menu</h1>
            <p className="text-xs text-emerald-600 font-medium">Table Active ({tableId})</p>
          </div>
        </div>

        <Link
          href={`/cart?table=${tableId}&session=${sessionId}`}
          className="relative bg-emerald-50 text-emerald-700 p-2.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            2
          </span>
        </Link>
      </header>

      {/* Main Menu Grid */}
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-center gap-2">
          <Utensils className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Browse our fresh offerings. Drinks and food items prepare independently in real-time.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {menuItems.map((item) => (
            <div key={item.id} className="restaurant-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.prepTime} mins</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-900 pt-1">{item.name}</h2>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-base font-bold text-slate-900">
                  ₦{item.price.toLocaleString()}
                </span>
                <button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
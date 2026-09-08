'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Utensils, ShoppingBag, Clock, ArrowLeft, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getMenuItemsAction, getRestaurantsAction } from '@/app/actions';

function MenuContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant') || '1';
  const tableId = searchParams.get('table') || '01';
  const sessionId = searchParams.get('session') || 'SES001';

  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const cartKey = 'chowly_active_cart';

  useEffect(() => {
    async function loadData() {
      try {
        const [items, rests] = await Promise.all([
          getMenuItemsAction(),
          getRestaurantsAction(),
        ]);
        setMenuItems(items);
        const currentRest = rests.find((r: any) => String(r.id) === String(restaurantId));
        if (currentRest) {
          setRestaurantName(currentRest.name);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        const totalQty = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(totalQty);
      } catch (e) {
        setCartCount(0);
      }
    }
  }, [restaurantId]);

  const handleAddToCart = (item: any) => {
    const savedCart = localStorage.getItem(cartKey);
    let cart = savedCart ? JSON.parse(savedCart) : [];

    const existingIndex = cart.findIndex((cartItem: any) => cartItem.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    const totalQty = cart.reduce((acc: number, cartItem: any) => acc + cartItem.quantity, 0);
    setCartCount(totalQty);

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/?restaurant=${restaurantId}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{restaurantName}</h1>
            <p className="text-xs text-emerald-600 font-medium">Table Active ({tableId})</p>
          </div>
        </div>

        <Link
          href={`/cart?restaurant=${restaurantId}&table=${tableId}&session=${sessionId}`}
          className="relative bg-emerald-50 text-emerald-700 p-2.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading global menu items...</div>
        ) : menuItems.length === 0 ? (
          <div className="restaurant-card p-12 bg-white text-center space-y-3 shadow-sm rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-sm">No available menu items found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {menuItems.map((item) => {
              const isJustAdded = addedItems[item.id];
              return (
                <div key={item.id} className="restaurant-card p-5 flex flex-col justify-between space-y-4 bg-white shadow-sm rounded-2xl border border-slate-100">
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
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                        isJustAdded ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
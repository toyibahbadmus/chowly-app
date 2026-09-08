'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Trash2, Clock, CheckCircle } from 'lucide-react';
import { submitOrderAction } from '@/app/actions';

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId: string = searchParams.get('table') ?? 'TBL001';
  const sessionId: string = searchParams.get('session') ?? 'SES001';

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load items from localStorage on mount. If nothing was added, it remains empty ([]).
  useEffect(() => {
    const savedCart = localStorage.getItem('chowly_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('chowly_cart', JSON.stringify(updated));
  };

  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items from the menu.');
      return;
    }

    setIsSubmitting(true);
    
    const payloadItems = cartItems.map(item => ({
      menuId: item.id,
      quantity: item.quantity,
      price: item.price,
      prepTime: item.prepTime
    }));

    const res = await submitOrderAction(sessionId, 'STF001', payloadItems);
    setIsSubmitting(false);

    if (res.success && (res as any).orderId) {
      localStorage.removeItem('chowly_cart');
      router.push(`/tracking?order=${(res as any).orderId}&table=${tableId}&session=${sessionId}`);
    } else {
      alert('Error submitting order to database.');
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const maxWaitTime = cartItems.length > 0 ? Math.max(...cartItems.map((item) => Number(item.prepTime) || 15)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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

      <main className="max-w-xl mx-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="restaurant-card p-12 bg-white text-center space-y-4 shadow-sm rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-slate-900 text-base">Your cart is currently empty</h2>
              <p className="text-xs text-slate-400">Select fresh meals from your database menu to start an order session.</p>
            </div>
            <Link
              href={`/menu?table=${tableId}&session=${sessionId}`}
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              Go to Database Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="restaurant-card p-4 flex items-center justify-between bg-white shadow-sm rounded-2xl border border-slate-100">
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
                      ₦{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="restaurant-card p-5 space-y-4 bg-white shadow-sm rounded-2xl border border-slate-100">
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

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckoutSubmit}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 text-xs"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Writing to Database...' : 'Submit Multi-Item Order'}</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading cart...</div>}>
      <CartContent />
    </Suspense>
  );
}
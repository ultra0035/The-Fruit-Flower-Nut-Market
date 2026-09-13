import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_INFO } from '../data/mockData';
import {
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  RotateCcw,
  Package,
  Database,
  ArrowLeft,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { DatabaseStatusModal } from './common/DatabaseStatusModal';

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenTracking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenTracking }) => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const {
    currentPortal,
    setCurrentPortal,
    cartCount,
    cartTotal,
    orders,
    resetToDefaultData,
    isDatabaseConnected,
  } = useStore();

  const activeCustomerOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      {/* 1. Top Informational Micro-Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] font-medium border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
          {/* Left: Store Status & Address */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-bold text-emerald-300">Open Today</span>
              <span className="text-emerald-400/80">·</span>
              <span className="hidden sm:inline text-emerald-200/90">8:00 AM – 5:30 PM</span>
            </span>

            <span className="hidden md:inline text-emerald-800">|</span>

            <span className="flex items-center gap-1.5 text-emerald-100/90">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hover:text-white transition-colors cursor-pointer" title="2 Fir Cnr, Blairgowrie, Johannesburg">
                2 Fir Cnr, Blairgowrie, JHB
              </span>
            </span>

            <span className="hidden lg:inline text-emerald-800">|</span>

            <span className="hidden lg:flex items-center gap-1.5 text-emerald-200/90">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a href={`tel:${STORE_INFO.phone}`} className="hover:text-white transition-colors">
                {STORE_INFO.phone}
              </a>
            </span>
          </div>

          {/* Right: Suburb Rates & Database Status & Reset */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="hidden xl:flex items-center gap-1.5 text-emerald-200/90 bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              <Truck className="w-3 h-3 text-emerald-400" />
              <span>Deliveries:</span>
              <span className="font-semibold text-emerald-100">Blairgowrie R25</span>
              <span className="text-emerald-500">·</span>
              <span className="font-semibold text-emerald-100">Northcliff R40</span>
              <span className="text-emerald-500">·</span>
              <span className="font-semibold text-emerald-100">Windsor R40</span>
            </div>

            {/* Supabase Database Status Trigger */}
            <button
              id="header-database-status-btn"
              onClick={() => setIsDbModalOpen(true)}
              title="Click to check database synchronization or input Supabase credentials"
              className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs border"
              style={{
                backgroundColor: isDatabaseConnected ? 'rgba(6, 78, 59, 0.7)' : 'rgba(120, 53, 15, 0.7)',
                borderColor: isDatabaseConnected ? 'rgba(52, 211, 153, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                color: isDatabaseConnected ? '#a7f3d0' : '#fde68a',
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDatabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3 h-3" />
              <span>{isDatabaseConnected ? 'Supabase Connected' : 'Connect Database'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Flagship Brand & Customer Action Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div
            onClick={() => setCurrentPortal('customer')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* Custom Brand Emblem */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:shadow-lg group-hover:scale-102 transition-all border border-emerald-600/30 shrink-0">
              <span className="text-2xl drop-shadow-xs group-hover:rotate-6 transition-transform">🌰</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[8px] font-black text-amber-950 shadow-xs">
                🌸
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-stone-900 text-base sm:text-lg md:text-xl tracking-tight leading-tight group-hover:text-emerald-900 transition-colors">
                  The Fruit, Flower &amp; Nut Market
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-emerald-100/80 text-emerald-900 font-bold text-[10px] rounded-full border border-emerald-300/60">
                  Blairgowrie
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="font-serif italic text-emerald-800 font-bold tracking-tight">
                  &ldquo;Come in and see our nuts!&rdquo;
                </span>
                <span className="hidden md:inline text-stone-300">·</span>
                <span className="hidden md:inline text-stone-400">Fresh Produce, Hand-Roasted Nuts &amp; Florist</span>
              </p>
            </div>
          </div>

          {/* Right: Clean Customer Action Suite or Staff Back-Button */}
          <div className="flex items-center gap-2.5 ml-auto">
            {currentPortal === 'customer' ? (
              <>
                {/* Active Order Tracker Button */}
                {activeCustomerOrders.length > 0 && (
                  <button
                    id="header-track-order-btn"
                    onClick={onOpenTracking}
                    title="Track your active delivery"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow"
                  >
                    <Package className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
                    <span className="hidden sm:inline">Track Order</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {activeCustomerOrders.length}
                    </span>
                  </button>
                )}

                {/* Professional Shopping Cart Button */}
                <button
                  id="open-cart-btn"
                  onClick={onOpenCart}
                  className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-900/15 transition-all cursor-pointer hover:shadow-lg hover:scale-102 active:scale-98"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-amber-400 text-amber-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline font-bold">Cart</span>
                  <span className="bg-emerald-950/50 text-emerald-100 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold tracking-tight">
                    R {cartTotal.toFixed(2)}
                  </span>
                </button>
              </>
            ) : (
              /* When viewing Admin or Driver portal from footer, show a clean 'Return to Store' button */
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs bg-stone-100 text-stone-700 border-stone-200">
                  {currentPortal === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Management Mode</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Driver Dispatch Mode</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setCurrentPortal('customer')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow hover:scale-102"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Store</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supabase Connection Diagnostics Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </header>
  );
};

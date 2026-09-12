import React from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_INFO } from '../data/mockData';
import {
  ShoppingBag,
  ShieldAlert,
  Truck,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  RotateCcw,
  Package,
} from 'lucide-react';
import { PortalType } from '../types';

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenTracking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenTracking }) => {
  const {
    currentPortal,
    setCurrentPortal,
    cartCount,
    orders,
    drivers,
    selectedDriverId,
    resetToDefaultData,
    trackedOrderId,
    isDatabaseConnected,
  } = useStore();

  const pendingAdminOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'packing'
  ).length;

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverActiveOrders = orders.filter(
    (o) =>
      o.assignedDriverId === currentDriver?.id &&
      (o.status === 'packing' || o.status === 'out_for_delivery')
  ).length;

  const activeCustomerOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top micro-banner with authentic address and contact info */}
      <div className="bg-emerald-800 text-emerald-50 px-3 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{STORE_INFO.address}</span>
            </span>
            <span className="hidden sm:inline text-emerald-400">|</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <a href={`tel:${STORE_INFO.phone}`} className="hover:underline">
                {STORE_INFO.phone}
              </a>
            </span>
            <span className="hidden md:inline text-emerald-400">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{STORE_INFO.hours}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto text-[11px]">
            {isDatabaseConnected ? (
              <span className="flex items-center gap-1 bg-emerald-900/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1 bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-medium text-[10px]">
                <span>Demo (Local Cache)</span>
              </span>
            )}
            <span className="hidden lg:inline bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100 font-medium">
              Deliveries: Northcliff R40 · Windsor R40 · Blairgowrie R25
            </span>
            <button
              onClick={resetToDefaultData}
              title="Reset initial demo data"
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors cursor-pointer bg-emerald-900/50 px-2 py-0.5 rounded"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main branding & navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Slogan */}
          <div
            onClick={() => setCurrentPortal('customer')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl font-black">🌰</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight leading-tight">
                  The Fruit, Flower &amp; Nut Market
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-[10px] rounded-full border border-amber-200">
                  Blairgowrie
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden xs:block">
                &ldquo;Come in and see our nuts!&rdquo; · Local Grocer &amp; Florist
              </p>
            </div>
          </div>

          {/* Portal Switcher Tabs (Crucial for user testability across all 3 roles!) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200/80 text-xs font-semibold shadow-inner">
              {/* Customer Tab */}
              <button
                id="tab-customer-portal"
                onClick={() => setCurrentPortal('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentPortal === 'customer'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer</span>
              </button>

              {/* Admin Tab */}
              <button
                id="tab-admin-portal"
                onClick={() => setCurrentPortal('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                  currentPortal === 'admin'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
                {pendingAdminOrders > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingAdminOrders}
                  </span>
                )}
              </button>

              {/* Driver Tab */}
              <button
                id="tab-driver-portal"
                onClick={() => setCurrentPortal('driver')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                  currentPortal === 'driver'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Driver</span>
                {driverActiveOrders > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {driverActiveOrders}
                  </span>
                )}
              </button>
            </nav>

            {/* Quick Actions (Customer Cart & Tracking) */}
            {currentPortal === 'customer' && (
              <div className="flex items-center gap-2">
                {activeCustomerOrders.length > 0 && (
                  <button
                    onClick={onOpenTracking}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-700 animate-pulse" />
                    <span className="hidden sm:inline">Track</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-1.5 rounded-full font-bold">
                      {activeCustomerOrders.length}
                    </span>
                  </button>
                )}

                <button
                  id="open-cart-btn"
                  onClick={onOpenCart}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer hover:shadow"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  <span className="bg-emerald-950 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold min-w-[20px] text-center">
                    {cartCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

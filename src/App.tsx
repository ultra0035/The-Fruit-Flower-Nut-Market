/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { DriverPortal } from './components/driver/DriverPortal';
import { OrderTrackerModal } from './components/customer/OrderTrackerModal';
import { STORE_INFO } from './data/mockData';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Truck,
  Heart,
} from 'lucide-react';

function StoreAppContent() {
  const {
    currentPortal,
    setCurrentPortal,
    notification,
    trackedOrderId,
    setTrackedOrderId,
  } = useStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const handleOpenTracking = () => {
    setIsTrackerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Responsive Header with Role Selector */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={handleOpenTracking}
      />

      {/* Main Portal View */}
      <div className="flex-1">
        {currentPortal === 'customer' && (
          <CustomerPortal
            onOpenTracker={handleOpenTracking}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        )}

        {currentPortal === 'admin' && <AdminPortal />}

        {currentPortal === 'driver' && <DriverPortal />}
      </div>

      {/* Global Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => {
          setIsTrackerOpen(false);
          setTrackedOrderId(null);
        }}
        orderId={trackedOrderId}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-950 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Store Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌰</span>
                <span className="font-extrabold text-white text-base">
                  The Fruit, Flower &amp; Nut Market
                </span>
              </div>
              <p className="text-stone-400 text-xs max-w-md leading-relaxed">
                Johannesburg&apos;s beloved local market corner in Blairgowrie. Providing fresh farm produce, floral arrangements, roasted gourmet nuts, and organic pantry items with same-day suburb delivery.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <span>&ldquo;Come in and see our nuts!&rdquo;</span>
                <span>•</span>
                <span>Est. Blairgowrie, JHB</span>
              </div>
            </div>

            {/* Visit & Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Market Location
              </h4>
              <p className="flex items-start gap-1.5 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </p>
              <p className="flex items-center gap-1.5 text-stone-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${STORE_INFO.phone}`} className="hover:underline">
                  {STORE_INFO.phone}
                </a>
              </p>
              <p className="flex items-center gap-1.5 text-stone-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{STORE_INFO.hours}</span>
              </p>
            </div>

            {/* Portals quick switch */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Active Portals
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setCurrentPortal('customer')}
                    className={`hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      currentPortal === 'customer'
                        ? 'text-emerald-400 font-bold'
                        : ''
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Customer Ordering App</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPortal('admin')}
                    className={`hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      currentPortal === 'admin'
                        ? 'text-emerald-400 font-bold'
                        : ''
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Store Management</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPortal('driver')}
                    className={`hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      currentPortal === 'driver'
                        ? 'text-emerald-400 font-bold'
                        : ''
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Delivery Driver Dispatch</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <div>
              © {new Date().getFullYear()} The Fruit, Flower &amp; Nut Market (Blairgowrie, Johannesburg). All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>Local Suburb Deliveries (Northcliff R40 · Windsor R40 · Blairgowrie R25)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreAppContent />
    </StoreProvider>
  );
}

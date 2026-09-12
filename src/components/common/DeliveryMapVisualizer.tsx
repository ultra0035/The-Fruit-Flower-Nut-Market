import React from 'react';
import { MapPin, Navigation, Store, CheckCircle, Clock } from 'lucide-react';
import { OrderStatus } from '../../types';

interface DeliveryMapVisualizerProps {
  suburb: string;
  address: string;
  status: OrderStatus;
  driverName?: string;
  distanceKm?: number;
}

export const DeliveryMapVisualizer: React.FC<DeliveryMapVisualizerProps> = ({
  suburb,
  address,
  status,
  driverName,
  distanceKm = 4.8,
}) => {
  // Determine progress percentage based on status
  let progressPct = 10;
  if (status === 'packing') progressPct = 25;
  if (status === 'out_for_delivery') progressPct = 65;
  if (status === 'delivered') progressPct = 100;

  return (
    <div className="bg-stone-900 text-white rounded-2xl p-4 overflow-hidden relative border border-stone-800 shadow-md">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
            Live Dispatch Radar
          </span>
        </div>
        <span className="text-stone-400 font-medium">
          Route: Conrad Dr ➔ {suburb} (~{distanceKm} km)
        </span>
      </div>

      {/* Styled vector map representation */}
      <div className="h-36 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-xl relative p-4 flex flex-col justify-between border border-stone-800/80 overflow-hidden">
        {/* Subtle grid pattern for map feel */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Road vector simulation */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-stone-800 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 relative"
            style={{ width: `${progressPct}%` }}
          >
            {/* Animated driver pulse beacon */}
            {status === 'out_for_delivery' && (
              <div className="absolute -right-3 -top-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-stone-950 shadow-lg shadow-emerald-400/50 animate-bounce">
                <Navigation className="w-3.5 h-3.5 fill-stone-950 rotate-45" />
              </div>
            )}
          </div>
        </div>

        {/* Origin Store Pin */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center border border-emerald-400/30 shadow-md shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-emerald-300">
              The Fruit, Flower &amp; Nut Market
            </div>
            <div className="text-[10px] text-stone-400">
              2 Fir Cnr, Blairgowrie (Hub)
            </div>
          </div>
        </div>

        {/* Destination Customer Pin */}
        <div className="relative z-10 flex items-center justify-end gap-2 text-right">
          <div>
            <div className="text-[11px] font-extrabold text-amber-300">
              Customer: {suburb}
            </div>
            <div className="text-[10px] text-stone-400 truncate max-w-[200px]">
              {address}
            </div>
          </div>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-md shrink-0 ${
              status === 'delivered'
                ? 'bg-emerald-500 text-white border-emerald-300'
                : 'bg-amber-600/90 text-white border-amber-400/30'
            }`}
          >
            {status === 'delivered' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Driver current status note */}
      <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800/80">
        <div className="flex items-center gap-1.5 text-stone-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {status === 'pending' && 'Order received at Blairgowrie store'}
            {status === 'packing' && 'Staff packing fresh produce & flowers at 2 Fir Cnr'}
            {status === 'out_for_delivery' && (
              <span className="text-emerald-400 font-semibold">
                Driver {driverName || 'Sipho'} is en route via Conrad Dr
              </span>
            )}
            {status === 'delivered' && (
              <span className="text-emerald-400 font-semibold">
                Successfully delivered to {suburb}!
              </span>
            )}
            {status === 'cancelled' && 'Order cancelled.'}
          </span>
        </div>
        <span className="text-[11px] font-bold text-stone-400">
          Johannesburg 2194
        </span>
      </div>
    </div>
  );
};

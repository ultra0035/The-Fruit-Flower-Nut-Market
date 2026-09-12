import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { DeliveryMapVisualizer } from '../common/DeliveryMapVisualizer';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const { orders } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(orderId || null);

  if (!isOpen) return null;

  // Active or selected order
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const currentOrder =
    orders.find((o) => o.id === (selectedId || orderId)) || activeOrders[0];

  const steps = [
    {
      id: 'pending',
      title: 'Order Placed',
      desc: 'Received at 2 Fir Cnr, Blairgowrie',
      icon: Clock,
    },
    {
      id: 'packing',
      title: 'Packing Fresh Market Items',
      desc: 'Sorting fresh fruits, flowers & nuts',
      icon: Package,
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      desc: 'Driver en route to your suburb',
      icon: Truck,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      desc: 'Package handed over with proof',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'packing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
              Real-time Suburb Delivery
            </span>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-300" />
              Live Order Tracker
            </h2>
            {currentOrder && (
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Order #{currentOrder.id} · {currentOrder.suburb} (R{currentOrder.total})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-order switcher if customer has multiple orders */}
        {activeOrders.length > 1 && (
          <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-stone-500 font-semibold shrink-0">Your Orders:</span>
            {activeOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => setSelectedId(ord.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  currentOrder?.id === ord.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                #{ord.id} ({ord.status.replace(/_/g, ' ')})
              </button>
            ))}
          </div>
        )}

        {currentOrder ? (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Live Progress Stepper */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="grid grid-cols-4 gap-2 relative">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-stone-200 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-bold leading-tight ${
                          isDone ? 'text-stone-900' : 'text-stone-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Visualizer */}
            <DeliveryMapVisualizer
              suburb={currentOrder.suburb}
              address={currentOrder.address}
              status={currentOrder.status}
              driverName={currentOrder.assignedDriverName}
            />

            {/* Driver & Delivery Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Driver Card */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Assigned Delivery Driver
                </span>
                {currentOrder.assignedDriverName ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                        {currentOrder.assignedDriverName[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {currentOrder.assignedDriverName}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {currentOrder.assignedDriverPhone}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`tel:${currentOrder.assignedDriverPhone}`}
                        className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </a>
                      <a
                        href={`https://wa.me/${currentOrder.assignedDriverPhone?.replace(
                          /[^0-9]/g,
                          ''
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-stone-500">
                    Order is being packed at 2 Fir Cnr. Driver assignment in progress...
                  </div>
                )}
              </div>

              {/* Delivery Destination */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Delivery Destination
                </span>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentOrder.suburb} (R{currentOrder.deliveryFee} Fee)</span>
                  </div>
                  <p className="text-stone-600 pl-4">{currentOrder.address}</p>
                  {currentOrder.deliveryNotes && (
                    <p className="text-stone-500 italic pl-4 text-[11px]">
                      &ldquo;{currentOrder.deliveryNotes}&rdquo;
                    </p>
                  )}
                  <div className="pt-2 text-stone-600 pl-4">
                    Payment: <span className="font-bold capitalize">{currentOrder.paymentMethod.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Delivery (if delivered) */}
            {currentOrder.status === 'delivered' && currentOrder.proofOfDelivery && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proof of Delivery Received</span>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <div>
                    Delivered at:{' '}
                    <span className="font-bold">
                      {currentOrder.proofOfDelivery.deliveredAt || 'Today'}
                    </span>
                  </div>
                  {currentOrder.proofOfDelivery.signedBy && (
                    <div>
                      Received by:{' '}
                      <span className="font-bold">
                        {currentOrder.proofOfDelivery.signedBy}
                      </span>
                    </div>
                  )}
                  {currentOrder.proofOfDelivery.signatureDataUrl && (
                    <div className="mt-2">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Recipient Signature:
                      </span>
                      <div className="w-48 h-16 border border-emerald-200 rounded-lg bg-white p-1 mt-1">
                        <img
                          src={currentOrder.proofOfDelivery.signatureDataUrl}
                          alt="Signature"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {currentOrder.proofOfDelivery.driverNotes && (
                    <div className="italic text-stone-500 mt-1">
                      Note: {currentOrder.proofOfDelivery.driverNotes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ordered Items Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Items from The Fruit, Flower &amp; Nut Market
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900">{item.productName}</div>
                        <div className="text-stone-500 text-[11px]">
                          {item.quantity} x {item.unit}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-stone-900">
                      R{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-500">
            No active orders to track. Place an order from the shop!
          </div>
        )}
      </div>
    </div>
  );
};

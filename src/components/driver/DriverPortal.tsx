import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { STORE_INFO } from '../../data/mockData';
import {
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Package,
  Clock,
  DollarSign,
  ChevronDown,
  ShieldCheck,
  Check,
  AlertCircle,
  Camera,
  X,
} from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { DeliveryMapVisualizer } from '../common/DeliveryMapVisualizer';
import confetti from 'canvas-confetti';

export const DriverPortal: React.FC = () => {
  const {
    orders,
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    updateOrderStatus,
    completeDelivery,
    isDatabaseConnected,
    refreshFromDatabase,
  } = useStore();

  const currentDriver =
    drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Active orders assigned to this driver
  const assignedOrders = currentDriver
    ? orders.filter(
        (o) =>
          o.assignedDriverId === currentDriver.id &&
          (o.status === 'packing' || o.status === 'out_for_delivery')
      )
    : [];

  const completedOrders = currentDriver
    ? orders.filter(
        (o) => o.assignedDriverId === currentDriver.id && o.status === 'delivered'
      )
    : [];

  // Modal for Proof of Delivery
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [driverNotes, setDriverNotes] = useState('Handed directly to recipient at front gate.');
  const [photoAdded, setPhotoAdded] = useState(false);

  // Active navigation view toggle for specific order
  const [navigatingOrderId, setNavigatingOrderId] = useState<string | null>(null);

  // Checklist of items checked by driver before departure
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleToggleCheckItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleStartDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'out_for_delivery');
  };

  const handleOpenCompleteModal = (orderId: string, customerName: string) => {
    setDeliveringOrderId(orderId);
    setRecipientName(customerName);
    setSignatureData('');
    setPhotoAdded(false);
  };

  const handleFinishDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringOrderId) return;

    completeDelivery(deliveringOrderId, {
      signedBy: recipientName,
      signatureDataUrl: signatureData || undefined,
      photoUrl: photoAdded
        ? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80'
        : undefined,
      deliveredAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      driverNotes,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setDeliveringOrderId(null);
  };

  if (!currentDriver) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-stone-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-stone-900">
            No Driver Records Found
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isDatabaseConnected
              ? 'Your Supabase public.drivers table is currently empty.'
              : 'Connect your Supabase database or sync your driver tables to start driver dispatches.'}
          </p>
          <button
            onClick={() => refreshFromDatabase()}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Refresh from Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Top Driver Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={currentDriver.avatarUrl}
                alt={currentDriver.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {currentDriver.name}
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase rounded-full">
                    {currentDriver.status}
                  </span>
                </div>
                <p className="text-stone-400 text-xs mt-0.5">
                  Vehicle: {currentDriver.vehicle} · Tel: {currentDriver.phone}
                </p>
                <p className="text-emerald-400 text-[11px] font-semibold">
                  Hub: 2 Fir Cnr, Blairgowrie (Tel: {STORE_INFO.phone})
                </p>
              </div>
            </div>

            {/* Driver Profile Switcher (for testing any driver) */}
            <div className="bg-stone-800/90 border border-stone-700 p-2.5 rounded-2xl flex items-center gap-3">
              <span className="text-xs font-bold text-stone-400">
                Switch Driver:
              </span>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-emerald-500"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.activeOrdersCount} active)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-stone-700">
              <span className="text-xs text-stone-400 block mb-1">
                Active Assigned
              </span>
              <span className="text-2xl font-black text-white">
                {assignedOrders.length}
              </span>
              <span className="text-[10px] text-amber-400 block font-medium">
                Pending delivery
              </span>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-stone-700">
              <span className="text-xs text-stone-400 block mb-1">
                Completed Today
              </span>
              <span className="text-2xl font-black text-white">
                {completedOrders.length}
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">
                Delivered safely
              </span>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-stone-700">
              <span className="text-xs text-stone-400 block mb-1">
                Today&apos;s Earnings
              </span>
              <span className="text-2xl font-black text-emerald-400">
                R{currentDriver.todayEarnings}
              </span>
              <span className="text-[10px] text-stone-400 block font-medium">
                Delivery payout
              </span>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-stone-700">
              <span className="text-xs text-stone-400 block mb-1">
                Driver Rating
              </span>
              <span className="text-2xl font-black text-amber-400">
                ★ {currentDriver.rating}
              </span>
              <span className="text-[10px] text-stone-400 block font-medium">
                Over {currentDriver.totalDeliveries} trips
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Driver Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>Current Delivery Trips ({assignedOrders.length})</span>
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              Pick up from 2 Fir Cnr, Blairgowrie
            </span>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base mb-1">
                No pending deliveries for {currentDriver.name}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                You are all caught up! When orders arrive in Blairgowrie, admin will assign them here.
              </p>
              <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 py-1.5 px-3 rounded-xl inline-block">
                Tip: You can place an order in the Customer tab or assign an order in Admin!
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {assignedOrders.map((order) => {
                const isNavOpen = navigatingOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header badge & status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-stone-950">
                            Order #{order.id}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                              order.status === 'packing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800 animate-pulse'
                            }`}
                          >
                            {order.status === 'packing'
                              ? 'Ready for pickup'
                              : 'Out on Route'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Placed at{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-stone-400 block">
                            Trip Earnings
                          </span>
                          <span className="text-lg font-black text-emerald-800">
                            R{order.deliveryFee}
                          </span>
                        </div>
                        <div className="text-right pl-3 border-l border-stone-200">
                          <span className="text-xs text-stone-400 block">
                            Collect from Customer
                          </span>
                          <span className="text-lg font-black text-stone-900">
                            {order.paymentMethod === 'cash_on_delivery'
                              ? `R${order.total} (Cash)`
                              : order.paymentMethod === 'card_on_delivery'
                              ? `R${order.total} (Card)`
                              : 'Paid (EFT)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Destination & Pickup info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                      {/* Store Pickup Location */}
                      <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-800 block mb-1">
                          Step 1: Pick Up Location
                        </span>
                        <div className="font-bold text-stone-900 text-sm">
                          The Fruit, Flower &amp; Nut Market
                        </div>
                        <p className="text-stone-600 mt-0.5">
                          2 Fir Cnr (cnr Conrad Dr), Blairgowrie, 2194
                        </p>
                        <p className="text-stone-500 mt-1">
                          Collect crate from front packaging counter.
                        </p>
                      </div>

                      {/* Dropoff Destination */}
                      <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-stone-400 block mb-1">
                          Step 2: Customer Destination
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">
                            {order.customerName}
                          </span>
                          <span className="font-bold text-emerald-800">
                            {order.suburb}
                          </span>
                        </div>
                        <p className="text-stone-700 font-medium mt-0.5">
                          {order.address}
                        </p>
                        {order.deliveryNotes && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-stone-200 text-amber-900 text-[11px] font-semibold">
                            ⚠️ Note: &ldquo;{order.deliveryNotes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pre-Departure Produce Verification Checklist */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                          Package Produce Checklist ({order.items.length} items)
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Verify contents before leaving 2 Fir Cnr
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => {
                          const itemKey = `${order.id}-${idx}`;
                          const isChecked = checkedItems[itemKey] || false;

                          return (
                            <label
                              key={itemKey}
                              onClick={() => handleToggleCheckItem(itemKey)}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-white border-stone-200 text-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                                    isChecked
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-stone-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span>
                                  {item.quantity}x {item.productName} ({item.unit})
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">
                                Packed
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive GPS Route Visualizer Toggle */}
                    {isNavOpen && (
                      <div className="mb-4">
                        <DeliveryMapVisualizer
                          suburb={order.suburb}
                          address={order.address}
                          status={order.status}
                          driverName={currentDriver.name}
                        />
                      </div>
                    )}

                    {/* Driver Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                      {/* Communication with Customer */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Call ({order.customerPhone})</span>
                        </a>

                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => setNavigatingOrderId(isNavOpen ? null : order.id)}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isNavOpen ? 'Hide Route' : 'View GPS Route'}</span>
                        </button>
                      </div>

                      {/* Main State Progression Action */}
                      <div className="flex items-center gap-2">
                        {order.status === 'packing' ? (
                          <button
                            onClick={() => handleStartDelivery(order.id)}
                            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Depart 2 Fir Cnr (Start Route)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenCompleteModal(order.id, order.customerName)
                            }
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-800/20 flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Complete Delivery &amp; Proof</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Deliveries by this driver */}
        {completedOrders.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-extrabold text-stone-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Deliveries Today ({completedOrders.length})</span>
            </h3>

            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden text-xs">
              {completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">
                        #{ord.id} · {ord.customerName} ({ord.suburb})
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        {ord.address} · Signed by:{' '}
                        {ord.proofOfDelivery?.signedBy || 'Recipient'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Earned</span>
                      <span className="font-bold text-emerald-700">
                        +R{ord.deliveryFee}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-[10px]">
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Proof of Delivery Modal */}
      {deliveringOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Proof of Delivery
                </span>
                <h3 className="font-black text-stone-900 text-lg">
                  Order #{deliveringOrderId}
                </h3>
              </div>
              <button
                onClick={() => setDeliveringOrderId(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishDelivery} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Received By (Name) *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins or Guard Sipho"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-emerald-600"
                />
              </div>

              {/* Digital Signature Pad */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Customer / Recipient Signature
                </label>
                <SignaturePad
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                  onClear={() => setSignatureData('')}
                />
              </div>

              {/* Photo Confirmation Option */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Delivery Photo (Gate / Verandah)
                </label>
                <button
                  type="button"
                  onClick={() => setPhotoAdded(!photoAdded)}
                  className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    photoAdded
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>
                    {photoAdded
                      ? '✓ Drop-off Photo Captured'
                      : 'Simulate Snap Photo at Gate'}
                  </span>
                </button>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Driver Handover Notes
                </label>
                <input
                  type="text"
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  placeholder="e.g. Left with security guard"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Handover &amp; Complete Trip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

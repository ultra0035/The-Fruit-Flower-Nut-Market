import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cart, cartTotal, suburbs, placeOrder } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'card_on_delivery' | 'cash_on_delivery' | 'instant_eft'
  >('card_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentSuburb = suburbs.find((s) => s.suburb === suburb) || suburbs[0];
  const deliveryFee = currentSuburb ? currentSuburb.fee : 40;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      alert('Please fill in your name, phone number, and street address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        imageUrl: item.product.imageUrl,
      }));

      const newOrder = placeOrder({
        customerName,
        customerPhone,
        customerEmail,
        address,
        suburb,
        postalCode: postalCode || '2194',
        deliveryNotes,
        items: orderItems,
        subtotal: cartTotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod,
      });

      // Launch joyful celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {}

      setIsSubmitting(false);
      onClose();
      onSuccess(newOrder.id);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
              Seamless Ordering
            </span>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-300" />
              Delivery Checkout
            </h2>
            <p className="text-xs text-emerald-100">
              Dispatching directly from 2 Fir Cnr, Blairgowrie
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sipho Sithole"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="082 123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Suburb Selector */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
              2. Delivery Address &amp; Suburb Rate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Local Suburb *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <select
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-emerald-600"
                  >
                    {suburbs.map((sub) => (
                      <option key={sub.suburb} value={sub.suburb}>
                        {sub.suburb} — {sub.fee === 0 ? 'FREE Pickup' : `R${sub.fee}`} ({sub.estimatedMinutes})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="2194"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Street Address, Complex / House No. *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 28 Frederick Dr, Unit 5"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Driver Delivery Notes
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate intercom code, complex instructions..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
              3. Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  paymentMethod === 'card_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === 'card_on_delivery'}
                  onChange={() => setPaymentMethod('card_on_delivery')}
                />
                <CreditCard className="w-5 h-5 mb-1 text-emerald-700" />
                <span className="text-xs">Card / Yoco</span>
                <span className="text-[10px] text-stone-500">Speedpoint</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                />
                <Banknote className="w-5 h-5 mb-1 text-emerald-700" />
                <span className="text-xs">Cash on Delivery</span>
                <span className="text-[10px] text-stone-500">Pay driver</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  paymentMethod === 'instant_eft'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  checked={paymentMethod === 'instant_eft'}
                  onChange={() => setPaymentMethod('instant_eft')}
                />
                <Smartphone className="w-5 h-5 mb-1 text-emerald-700" />
                <span className="text-xs">Instant EFT</span>
                <span className="text-[10px] text-stone-500">Ozow / Capitec</span>
              </label>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Market items subtotal ({cart.length} items)</span>
              <span className="font-bold text-stone-900">R{cartTotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>
                Delivery Fee ({suburb})
              </span>
              <span className="font-bold text-stone-900">
                {deliveryFee === 0 ? 'FREE' : `R${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t border-stone-200">
              <span>Total to Pay</span>
              <span className="text-base text-emerald-800">R{grandTotal}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Orders packed fresh at 2 Fir Cnr, Blairgowrie. Driver will be dispatched upon packing.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Confirming Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Order · R{grandTotal}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, MapPin } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    suburbs,
  } = useStore();

  const [previewSuburb, setPreviewSuburb] = useState<string>('Northcliff');
  const selectedSuburbObj = suburbs.find((s) => s.suburb === previewSuburb) || suburbs[0];
  const deliveryFee = selectedSuburbObj ? selectedSuburbObj.fee : 40;
  const grandTotal = cartTotal + deliveryFee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="font-extrabold text-stone-900 text-lg">Your Grocery Basket</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-900 text-base mb-1">
                  Your basket is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-5">
                  Browse fresh fruits, bouquets, roasted nuts and pantry staples from 2 Fir Cnr.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/70"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs truncate">
                          {product.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {product.unit} · R{product.price}
                        </span>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() =>
                                updateCartQuantity(product.id, quantity - 1)
                              }
                              className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(product.id, quantity + 1)
                              }
                              className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-extrabold text-stone-900">
                            R{product.price * quantity}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-xs text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all items</span>
                  </button>
                </div>

                {/* Suburb rate preview */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      Local Suburb Delivery Rates
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      from 2 Fir Cnr
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <select
                      value={previewSuburb}
                      onChange={(e) => setPreviewSuburb(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                    >
                      {suburbs.map((sub) => (
                        <option key={sub.suburb} value={sub.suburb}>
                          {sub.suburb} — R{sub.fee} ({sub.estimatedMinutes})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-medium">
                    Dispatch hub: 2 Fir Cnr, Blairgowrie. Deliveries dispatched with live tracking!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer calculation */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Cart Items</span>
                  <span className="font-semibold text-stone-900">R{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Delivery ({previewSuburb})
                  </span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? 'FREE' : `R${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-stone-950">
                  <span>Estimated Total</span>
                  <span className="text-base text-emerald-800">R{grandTotal}</span>
                </div>
              </div>

              <button
                id="checkout-proceed-btn"
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout (R{grandTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

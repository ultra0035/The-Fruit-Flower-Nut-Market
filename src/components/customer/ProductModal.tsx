import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Plus, Minus, ShoppingBag, MapPin, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Image */}
        <div className="relative aspect-16/10 bg-stone-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone-900/60 text-white hover:bg-stone-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {product.badge && (
            <span className="absolute bottom-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {product.badge}
            </span>
          )}
        </div>

        {/* Modal Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-xl font-bold text-stone-900">{product.name}</h2>
              {product.origin && (
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Origin: {product.origin}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-800">
                R{product.price}
              </div>
              <div className="text-xs text-stone-500 font-medium">{product.unit}</div>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed my-4">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg"
              >
                {tag}
              </span>
            ))}
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg">
              Stock available: {product.stockCount} units
            </span>
          </div>

          {/* Quantity Controls & Add Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-stone-900 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart · R{product.price * quantity}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

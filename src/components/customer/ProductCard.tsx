import React from 'react';
import { Product } from '../../types';
import { Plus, Check, Sparkles, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, cart } = useStore();
  const cartItem = cart.find((i) => i.product.id === product.id);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image container */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-600/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {product.badge}
            </span>
          )}
        </div>

        {/* Stock status overlay if out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Origin tag */}
        {product.origin && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-[11px] font-medium text-white/90 bg-stone-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3
              onClick={() => onSelect(product)}
              className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug line-clamp-1"
            >
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded-md"
              >
                {tag}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md">
              {product.unit}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-stone-400 font-medium">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-stone-900">
                R{product.price}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                /{product.unit.split(' ')[0]}
              </span>
            </div>
          </div>

          {product.inStock ? (
            <button
              id={`add-btn-${product.id}`}
              onClick={() => addToCart(product, 1)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cartItem
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow'
              }`}
            >
              {cartItem ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                  <span>{cartItem.quantity} in cart</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-400 cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

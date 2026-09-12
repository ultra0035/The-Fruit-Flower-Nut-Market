import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryType } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import {
  Search,
  Sparkles,
  Truck,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { STORE_INFO } from '../../data/mockData';

interface CustomerPortalProps {
  onOpenTracker: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onOpenTracker,
  isCartOpen,
  setIsCartOpen,
}) => {
  const { products, cartCount, cartTotal, setTrackedOrderId } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items', emoji: '🛒' },
    { id: 'nuts-dried', label: 'Nuts & Dried Fruit', emoji: '🥜' },
    { id: 'fruits-veg', label: 'Fresh Produce', emoji: '🍎' },
    { id: 'flowers-plants', label: 'Flowers & Plants', emoji: '💐' },
    { id: 'health-pantry', label: 'Health & Pantry', emoji: '🌾' },
  ];

  const quickTags = [
    'all',
    'Store Roasted',
    'Fresh Cut',
    'Organic',
    'Gluten-Free',
    'Vegan',
    'Local Farm',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.origin && p.origin.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag =
        selectedTag === 'all' ||
        p.tags.includes(selectedTag) ||
        p.badge?.includes(selectedTag);

      return matchesCategory && matchesSearch && matchesTag;
    });
  }, [products, selectedCategory, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Local Store Spotlight Hero */}
      <section className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 text-white relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Store Information */}
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Blairgowrie&apos;s Iconic Corner Market Since 1994</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                The Fruit, Flower &amp; Nut Market
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 font-medium max-w-2xl">
                &ldquo;Come in and see our nuts!&rdquo; Hand-sorted fresh fruits, blooming flower bouquets, small-batch roasted nuts, and organic health groceries delivered directly to your doorstep.
              </p>

              {/* Delivery badges for requested suburbs */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Suburb Deliveries:
                </span>
                <span className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 font-semibold text-emerald-100">
                  📍 Northcliff <b className="text-white">R40</b>
                </span>
                <span className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 font-semibold text-emerald-100">
                  📍 Windsor West / East <b className="text-white">R40</b>
                </span>
                <span className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 font-semibold text-emerald-100">
                  📍 Blairgowrie (Local) <b className="text-white">R25</b>
                </span>
                <span className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 font-semibold text-emerald-100">
                  📍 Linden <b className="text-white">R35</b>
                </span>
              </div>
            </div>

            {/* Quick Highlights Card */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Physical Market</span>
                  <span className="text-emerald-100">2 Fir Cnr, Blairgowrie, Johannesburg, 2194</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Trading Hours</span>
                  <span className="text-emerald-100">Open 8:00 am – 5:30 pm (Mon-Sat)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/30 text-green-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Store Direct Order Line</span>
                  <a href={`tel:${STORE_INFO.phone}`} className="text-amber-300 font-bold hover:underline">
                    {STORE_INFO.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-200/80 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search raw almonds, proteas, avocados, coconut oil..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:outline-emerald-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Total Results & Quick Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs text-stone-400 font-semibold shrink-0 hidden sm:inline">
                Tag:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag === 'all' ? 'All Tags' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-stone-900 text-lg sm:text-xl">
              Fresh in Stock ({filteredProducts.length} items)
            </h2>
            <span className="text-xs text-stone-500">
              Daily deliveries direct from Blairgowrie
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-8">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-stone-900 text-base mb-1">
                No items match your search
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Try searching for almonds, flowers, dates, or browse all categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag('all');
                }}
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Mobile Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-40">
          <div className="bg-emerald-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-emerald-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-black text-white relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-200 block">
                  Market Basket
                </span>
                <span className="text-base font-black text-white">
                  R{cartTotal}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Review
              </button>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(newOrderId) => {
          setTrackedOrderId(newOrderId);
          onOpenTracker();
        }}
      />
    </div>
  );
};

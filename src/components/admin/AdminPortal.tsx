import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, Product, CategoryType, OrderStatus, SuburbDelivery } from '../../types';
import { STORE_INFO } from '../../data/mockData';
import {
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Users,
  Settings,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    orders,
    products,
    drivers,
    suburbs,
    updateOrderStatus,
    assignDriver,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSuburbFee,
    addSuburb,
    cancelOrder,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'suburbs' | 'drivers'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<CategoryType>('nuts-dried');
  const [newProdPrice, setNewProdPrice] = useState('65');
  const [newProdUnit, setNewProdUnit] = useState('500g bag');
  const [newProdOrigin, setNewProdOrigin] = useState('Blairgowrie Market');
  const [newProdBadge, setNewProdBadge] = useState('New In');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80'
  );

  // New Suburb Modal State
  const [isAddSuburbOpen, setIsAddSuburbOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubFee, setNewSubFee] = useState('40');
  const [newSubEst, setNewSubEst] = useState('25-35 min');
  const [newSubDist, setNewSubDist] = useState('5.5');

  // Key performance indicators
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeDeliveriesCount = orders.filter(
    (o) => o.status === 'out_for_delivery' || o.status === 'packing'
  ).length;

  const lowStockCount = products.filter((p) => p.stockCount <= 20).length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    addProduct({
      name: newProdName,
      category: newProdCat,
      price: Number(newProdPrice) || 50,
      unit: newProdUnit,
      inStock: true,
      stockCount: 40,
      description: newProdDesc || 'Freshly stocked at The Fruit, Flower & Nut Market.',
      badge: newProdBadge || undefined,
      tags: [newProdBadge, 'Local Store'],
      origin: newProdOrigin,
      imageUrl: newProdImage,
    });

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdDesc('');
  };

  const handleCreateSuburb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;

    addSuburb({
      suburb: newSubName,
      fee: Number(newSubFee) || 40,
      estimatedMinutes: newSubEst || '25 min',
      distanceKm: Number(newSubDist) || 5.0,
      popular: true,
    });

    setIsAddSuburbOpen(false);
    setNewSubName('');
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Admin Top Dashboard Bar */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Store Operations Hub</span>
                <span>•</span>
                <span>2 Fir Cnr, Blairgowrie (2194)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Store Admin Portal
              </h1>
              <p className="text-stone-400 text-xs">
                Manage grocery orders, dispatch drivers to local suburbs, and update inventory.
              </p>
            </div>

            {/* Navigation tabs inside Admin */}
            <div className="flex items-center gap-1.5 bg-stone-800/80 p-1.5 rounded-xl border border-stone-700/80 overflow-x-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Inventory ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('suburbs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'suburbs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Suburb Rates ({suburbs.length})
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'drivers'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Drivers ({drivers.length})
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-stone-800/90 rounded-2xl p-4 border border-stone-700">
              <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
                <span>Total Orders Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">R{totalRevenue}</div>
              <span className="text-[10px] text-emerald-400 font-medium">
                From {orders.length} store orders
              </span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-4 border border-stone-700">
              <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
                <span>Active Deliveries</span>
                <Truck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{activeDeliveriesCount}</div>
              <span className="text-[10px] text-amber-400 font-medium">
                En route / packing
              </span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-4 border border-stone-700">
              <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
                <span>Active Suburbs</span>
                <MapPin className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{suburbs.length}</div>
              <span className="text-[10px] text-stone-400 font-medium">
                Northcliff, Windsor, etc.
              </span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-4 border border-stone-700">
              <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
                <span>Low Stock Items</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-white">{lowStockCount}</div>
              <span className="text-[10px] text-stone-400 font-medium">
                ≤ 20 units remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Tab View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ======================= ORDERS TAB ======================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-stone-500">Filter:</span>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'packing', label: 'Packing' },
                  { id: 'out_for_delivery', label: 'Out for Delivery' },
                  { id: 'delivered', label: 'Delivered' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === f.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-semibold text-stone-500">
                Showing {filteredOrders.length} orders
              </span>
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
                        {order.id.replace('FFN-', '')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-stone-900 text-base">
                            #{order.id}
                          </h3>
                          <span className="text-xs text-stone-500">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                              order.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'packing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'out_for_delivery'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-stone-600 mt-1 flex-wrap">
                          <span className="font-bold text-stone-900">
                            {order.customerName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {order.customerPhone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-800">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {order.suburb} (Fee: R{order.deliveryFee})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-3 flex-wrap lg:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Total</span>
                        <span className="text-lg font-black text-stone-900">
                          R{order.total}
                        </span>
                      </div>

                      {/* Status advancement buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'packing')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Start Packing
                          </button>
                        )}

                        {(order.status === 'pending' || order.status === 'packing') && (
                          <button
                            onClick={() => setAssigningOrderId(order.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>
                              {order.assignedDriverName
                                ? `Driver: ${order.assignedDriverName.split(' ')[0]}`
                                : 'Assign Driver'}
                            </span>
                          </button>
                        )}

                        {order.status === 'packing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Dispatch Order
                          </button>
                        )}

                        {order.status === 'out_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>
                        )}

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                    {/* Delivery Address */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-stone-400 block mb-1">
                        Delivery Destination
                      </span>
                      <p className="font-semibold text-stone-900">{order.address}</p>
                      <p className="text-stone-500">{order.suburb}, JHB {order.postalCode}</p>
                      {order.deliveryNotes && (
                        <p className="text-stone-600 italic mt-1 bg-white p-1.5 rounded border border-stone-200 text-[11px]">
                          &ldquo;{order.deliveryNotes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Driver & Payment Info */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-stone-400 block mb-1">
                        Dispatch &amp; Payment
                      </span>
                      <div className="space-y-1">
                        <div>
                          Driver:{' '}
                          <span className="font-bold text-stone-900">
                            {order.assignedDriverName || 'Unassigned'}
                          </span>
                          {order.assignedDriverPhone && (
                            <span className="text-stone-500 ml-1">
                              ({order.assignedDriverPhone})
                            </span>
                          )}
                        </div>
                        <div>
                          Payment:{' '}
                          <span className="font-bold text-stone-900 capitalize">
                            {order.paymentMethod.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          Delivery Fee:{' '}
                          <span className="font-bold text-emerald-800">
                            R{order.deliveryFee}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Packed Items */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-stone-400 block mb-1">
                        Market Produce List ({order.items.length} items)
                      </span>
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-stone-700">
                            <span className="truncate pr-2">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-bold text-stone-900 shrink-0">
                              R{item.price * item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= INVENTORY TAB ======================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                />
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Inventory Table / Grid */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price (ZAR)</th>
                      <th className="p-3.5">Unit</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">
                              {p.name}
                            </span>
                            {p.origin && (
                              <span className="text-[10px] text-stone-400">
                                {p.origin}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 capitalize text-stone-600 font-medium">
                          {p.category.replace('-', ' ')}
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          R{p.price}
                        </td>
                        <td className="p-3.5 text-stone-500">{p.unit}</td>
                        <td className="p-3.5">
                          <span
                            className={`font-semibold ${
                              p.stockCount <= 20
                                ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded'
                                : 'text-stone-700'
                            }`}
                          >
                            {p.stockCount} in stock
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() =>
                              updateProduct({ ...p, inStock: !p.inStock })
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                              p.inStock
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              const newPrice = prompt(`Enter new price in ZAR for ${p.name}:`, p.price.toString());
                              if (newPrice && !isNaN(Number(newPrice))) {
                                updateProduct({ ...p, price: Number(newPrice) });
                              }
                            }}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 rounded-lg hover:bg-stone-100 transition-colors"
                            title="Quick Edit Price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${p.name} from catalog?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= SUBURB DELIVERY RATES TAB ======================= */}
        {activeTab === 'suburbs' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Local Delivery Zones &amp; Delivery Fees
                </h3>
                <p className="text-xs text-stone-500">
                  Deliveries originate from 2 Fir Cnr, Blairgowrie. Edit rates per suburb.
                </p>
              </div>

              <button
                onClick={() => setIsAddSuburbOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Local Suburb</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suburbs.map((sub) => (
                <div
                  key={sub.suburb}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-stone-900 text-sm block">
                        {sub.suburb}
                      </span>
                      <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {sub.estimatedMinutes} · ~{sub.distanceKm} km from 2 Fir Cnr
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-800">
                        {sub.fee === 0 ? 'FREE' : `R${sub.fee}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Standard delivery rate
                    </span>
                    <button
                      onClick={() => {
                        const newFee = prompt(
                          `Update delivery fee for ${sub.suburb} (in Rands):`,
                          sub.fee.toString()
                        );
                        if (newFee !== null && !isNaN(Number(newFee))) {
                          updateSuburbFee(sub.suburb, Number(newFee));
                        }
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Change Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= DRIVERS TAB ======================= */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="font-extrabold text-stone-900 text-base">
                Market Dispatch Delivery Fleet
              </h3>
              <p className="text-xs text-stone-500">
                Active drivers delivering fresh groceries from Blairgowrie across Johannesburg North.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={driver.avatarUrl}
                        alt={driver.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {driver.name}
                        </h4>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            driver.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {driver.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600">
                      <div>
                        Phone:{' '}
                        <a
                          href={`tel:${driver.phone}`}
                          className="font-bold text-stone-900 hover:underline"
                        >
                          {driver.phone}
                        </a>
                      </div>
                      <div>
                        Vehicle: <span className="font-medium text-stone-800">{driver.vehicle}</span>
                      </div>
                      <div>
                        Deliveries completed: <span className="font-bold text-stone-900">{driver.totalDeliveries}</span>
                      </div>
                      <div>
                        Today&apos;s Earnings: <span className="font-bold text-emerald-800">R{driver.todayEarnings}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400">
                      Active: {driver.activeOrdersCount} orders
                    </span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      ★ {driver.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Assign Driver Modal */}
      {assigningOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-stone-900 text-base">
                Assign Driver to #{assigningOrderId}
              </h3>
              <button
                onClick={() => setAssigningOrderId(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              Select a delivery driver to pick up this package from 2 Fir Cnr, Blairgowrie.
            </p>

            <div className="space-y-2.5">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  onClick={() => {
                    assignDriver(assigningOrderId, drv.id);
                    setAssigningOrderId(null);
                  }}
                  className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={drv.avatarUrl}
                      alt={drv.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-xs">
                        {drv.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {drv.vehicle.split('(')[0]} · {drv.phone}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700">
                    Assign ➔
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-stone-900 text-base">
                Add New Market Product
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Raw Walnuts Halves"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  >
                    <option value="nuts-dried">Nuts &amp; Dried Fruit</option>
                    <option value="fruits-veg">Fresh Produce</option>
                    <option value="flowers-plants">Flowers &amp; Plants</option>
                    <option value="health-pantry">Health &amp; Pantry</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Price in ZAR (R) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="75"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Unit / Packaging
                  </label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="500g bag / 1kg / bunch"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    placeholder="Farm Fresh / Organic / Raw"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Fresh quality item description..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Suburb Modal */}
      {isAddSuburbOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-stone-900 text-base">
                Add Delivery Suburb Rate
              </h3>
              <button
                onClick={() => setIsAddSuburbOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSuburb} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Suburb Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Parkhurst / Greenside"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Delivery Fee in Rands (R) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSubFee}
                    onChange={(e) => setNewSubFee(e.target.value)}
                    placeholder="40"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Distance (km from 2 Fir Cnr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSubDist}
                    onChange={(e) => setNewSubDist(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={newSubEst}
                  onChange={(e) => setNewSubEst(e.target.value)}
                  placeholder="20-30 min"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Add Suburb Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

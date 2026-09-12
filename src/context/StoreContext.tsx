import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Order,
  CartItem,
  Driver,
  SuburbDelivery,
  PortalType,
  OrderStatus,
  ProofOfDelivery,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUBURBS,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
} from '../data/mockData';
import { supabaseService, isSupabaseConfigured } from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  suburbs: SuburbDelivery[];
  drivers: Driver[];
  cart: CartItem[];
  currentPortal: PortalType;
  selectedDriverId: string;
  trackedOrderId: string | null;
  notification: string | null;
  isDatabaseConnected: boolean;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Order Actions
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  completeDelivery: (orderId: string, proof: ProofOfDelivery) => void;
  cancelOrder: (orderId: string) => void;
  // Product & Suburb Management
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateSuburbFee: (suburbName: string, fee: number) => void;
  addSuburb: (suburb: SuburbDelivery) => void;
  // Portal & Tracking
  setCurrentPortal: (portal: PortalType) => void;
  setSelectedDriverId: (driverId: string) => void;
  setTrackedOrderId: (orderId: string | null) => void;
  showNotification: (msg: string) => void;
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ffn_products_v1',
  ORDERS: 'ffn_orders_v1',
  SUBURBS: 'ffn_suburbs_v1',
  DRIVERS: 'ffn_drivers_v1',
  CART: 'ffn_cart_v1',
  PORTAL: 'ffn_portal_v1',
  DRIVER_ID: 'ffn_driver_id_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [suburbs, setSuburbs] = useState<SuburbDelivery[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBURBS);
      return saved ? JSON.parse(saved) : INITIAL_SUBURBS;
    } catch {
      return INITIAL_SUBURBS;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentPortal, setCurrentPortalState] = useState<PortalType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTAL) as PortalType;
      return saved && ['customer', 'admin', 'driver'].includes(saved) ? saved : 'customer';
    } catch {
      return 'customer';
    }
  });

  const [selectedDriverId, setSelectedDriverIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      return saved || 'driver-1';
    } catch {
      return 'driver-1';
    }
  });

  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDatabaseConnected] = useState<boolean>(isSupabaseConfigured());

  // Hydrate from Supabase database if configured, with fallback to local storage
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    async function loadSupabaseData() {
      try {
        const [dbProducts, dbDrivers, dbZones, dbOrders] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getDrivers(),
          supabaseService.getDeliveryZones(),
          supabaseService.getOrders(),
        ]);

        if (isMounted) {
          if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
          if (dbDrivers && dbDrivers.length > 0) setDrivers(dbDrivers);
          if (dbZones && dbZones.length > 0) setSuburbs(dbZones);
          if (dbOrders && dbOrders.length > 0) setOrders(dbOrders);
        }
      } catch (err) {
        console.warn('Failed to load initial Supabase data:', err);
      }
    }

    loadSupabaseData();

    // Subscribe to real-time order updates across all devices/portals
    const unsubscribe = supabaseService.subscribeToOrders(async () => {
      try {
        const latestOrders = await supabaseService.getOrders();
        if (isMounted && latestOrders && latestOrders.length > 0) {
          setOrders(latestOrders);
        }
      } catch (err) {
        console.warn('Realtime orders refresh error:', err);
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync to localStorage as offline / local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBURBS, JSON.stringify(suburbs));
    } catch {}
  }, [suburbs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    } catch {}
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const setCurrentPortal = (portal: PortalType) => {
    setCurrentPortalState(portal);
    try {
      localStorage.setItem(STORAGE_KEYS.PORTAL, portal);
    } catch {}
  };

  const setSelectedDriverId = (id: string) => {
    setSelectedDriverIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVER_ID, id);
    } catch {}
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showNotification(`Added ${product.name} to cart`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order operations
  const placeOrder = (
    orderData: Omit<Order, 'id' | 'status' | 'createdAt'>
  ): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `FFN-${randomNum}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setTrackedOrderId(newOrder.id);
    showNotification(`Order #${newOrder.id} placed successfully!`);

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      supabaseService
        .createOrder(newOrder)
        .then((res) => {
          if (!res.success) {
            console.warn('Could not save order to Supabase:', res.error);
            showNotification(`⚠️ Order saved locally, but database sync error: ${res.error}`);
          } else {
            showNotification(`✅ Order #${newOrder.id} saved to live Supabase database!`);
          }
        })
        .catch((err) => {
          console.warn('Could not save order to Supabase:', err);
          showNotification(`⚠️ Order saved locally (database unreachable)`);
        });
    } else {
      showNotification(`Order #${newOrder.id} placed! (Stored in Demo Local Cache)`);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showNotification(`Order #${orderId} marked as ${status.replace(/_/g, ' ')}`);

    if (isSupabaseConfigured()) {
      supabaseService.updateOrderStatus(orderId, status).catch(console.warn);
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              assignedDriverId: driver.id,
              assignedDriverName: driver.name,
              assignedDriverPhone: driver.phone,
              status: ord.status === 'pending' ? 'packing' : ord.status,
              estimatedDeliveryTime: 'Assigned · Packing at 2 Fir Cnr',
            }
          : ord
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              activeOrdersCount: d.activeOrdersCount + 1,
              status: 'busy',
            }
          : d
      )
    );

    showNotification(`Assigned ${driver.name} to order #${orderId}`);

    if (isSupabaseConfigured()) {
      supabaseService.assignDriver(orderId, driver.id, driver.name, driver.phone).catch(console.warn);
    }
  };

  const completeDelivery = (orderId: string, proof: ProofOfDelivery) => {
    const order = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'delivered',
              proofOfDelivery: proof,
            }
          : ord
      )
    );

    if (order?.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === order.assignedDriverId) {
            return {
              ...d,
              activeOrdersCount: Math.max(0, d.activeOrdersCount - 1),
              totalDeliveries: d.totalDeliveries + 1,
              todayEarnings: d.todayEarnings + (order.deliveryFee || 40),
              status: d.activeOrdersCount <= 1 ? 'available' : 'busy',
            };
          }
          return d;
        })
      );
    }

    showNotification(`Order #${orderId} delivered!`);

    if (isSupabaseConfigured()) {
      supabaseService.completeDelivery(orderId, proof).catch(console.warn);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: 'cancelled' } : ord
      )
    );
    showNotification(`Order #${orderId} was cancelled.`);

    if (isSupabaseConfigured()) {
      supabaseService.updateOrderStatus(orderId, 'cancelled').catch(console.warn);
    }
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showNotification(`Added new product: ${newProduct.name}`);

    if (isSupabaseConfigured()) {
      supabaseService.upsertProduct(newProduct).catch(console.warn);
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showNotification(`Updated: ${updated.name}`);

    if (isSupabaseConfigured()) {
      supabaseService.upsertProduct(updated).catch(console.warn);
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification('Product removed from catalog.');
  };

  // Suburb management
  const updateSuburbFee = (suburbName: string, fee: number) => {
    setSuburbs((prev) =>
      prev.map((s) => (s.suburb === suburbName ? { ...s, fee } : s))
    );
    showNotification(`Updated ${suburbName} delivery fee to R${fee}`);
  };

  const addSuburb = (newSub: SuburbDelivery) => {
    setSuburbs((prev) => [...prev, newSub]);
    showNotification(`Added suburb ${newSub.suburb} (R${newSub.fee})`);
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSuburbs(INITIAL_SUBURBS);
    setDrivers(INITIAL_DRIVERS);
    setCart([]);
    showNotification('Demo store data refreshed to default!');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        suburbs,
        drivers,
        cart,
        currentPortal,
        selectedDriverId,
        trackedOrderId,
        notification,
        isDatabaseConnected,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        placeOrder,
        updateOrderStatus,
        assignDriver,
        completeDelivery,
        cancelOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSuburbFee,
        addSuburb,
        setCurrentPortal,
        setSelectedDriverId,
        setTrackedOrderId,
        showNotification,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

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
  isLoadingData: boolean;
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
  refreshFromDatabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'ffn_cart_v2',
  PORTAL: 'ffn_portal_v2',
  DRIVER_ID: 'ffn_driver_id_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any legacy demo data from previous sessions
  useEffect(() => {
    try {
      localStorage.removeItem('ffn_products_v1');
      localStorage.removeItem('ffn_orders_v1');
      localStorage.removeItem('ffn_suburbs_v1');
      localStorage.removeItem('ffn_drivers_v1');
    } catch {}
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suburbs, setSuburbs] = useState<SuburbDelivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

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
      return saved || '';
    } catch {
      return '';
    }
  });

  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(isSupabaseConfigured());

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  const refreshFromDatabase = async () => {
    setIsLoadingData(true);
    if (!isSupabaseConfigured()) {
      setIsDatabaseConnected(false);
      setIsLoadingData(false);
      return;
    }

    try {
      const [productsRes, driversRes, zonesRes, ordersRes] = await Promise.all([
        supabaseService.getProducts(),
        supabaseService.getDrivers(),
        supabaseService.getDeliveryZones(),
        supabaseService.getOrders(),
      ]);

      if (!productsRes.error && productsRes.data !== null) {
        setProducts(productsRes.data);
        setIsDatabaseConnected(true);
      } else {
        setIsDatabaseConnected(false);
      }

      if (driversRes) {
        setDrivers(driversRes);
        if (driversRes.length > 0 && !selectedDriverId) {
          setSelectedDriverIdState(driversRes[0].id);
        }
      }

      if (zonesRes) {
        setSuburbs(zonesRes);
      }

      if (ordersRes) {
        setOrders(ordersRes);
      }
    } catch (err) {
      console.warn('Failed to refresh Supabase data:', err);
      setIsDatabaseConnected(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Initial load directly from Supabase
  useEffect(() => {
    refreshFromDatabase();

    // Subscribe to real-time order updates
    const unsubscribeOrders = supabaseService.subscribeToOrders(async () => {
      try {
        const res = await supabaseService.getOrders();
        if (res) {
          setOrders(res);
        }
      } catch (err) {
        console.warn('Realtime orders refresh error:', err);
      }
    });

    // Subscribe to real-time product updates
    const unsubscribeProducts = supabaseService.subscribeToProducts(async () => {
      try {
        const res = await supabaseService.getProducts();
        if (!res.error && res.data !== null) {
          setProducts(res.data);
        }
      } catch (err) {
        console.warn('Realtime products refresh error:', err);
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const setCurrentPortal = (portal: PortalType) => {
    setCurrentPortalState(portal);
    try {
      localStorage.setItem(STORAGE_KEYS.PORTAL, portal);
    } catch {}
  };

  const setSelectedDriverId = (driverId: string) => {
    setSelectedDriverIdState(driverId);
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVER_ID, driverId);
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
    showNotification(`Added ${product.name} to cart.`);
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
    showNotification('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Place order
  const placeOrder = (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setTrackedOrderId(newOrder.id);
    showNotification(`Order ${newOrder.id} placed successfully!`);

    // Sync to Supabase directly
    if (isSupabaseConfigured()) {
      supabaseService.createOrder(newOrder).catch((err) => {
        console.warn('Failed to push order to Supabase:', err);
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showNotification(`Order status updated to "${status}".`);

    if (isSupabaseConfigured()) {
      supabaseService.updateOrderStatus(orderId, status).catch(console.warn);
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assignedDriverId: driver.id,
              assignedDriverName: driver.name,
              assignedDriverPhone: driver.phone,
              status: 'packing' as OrderStatus,
            }
          : o
      )
    );
    showNotification(`Assigned driver ${driver.name} to order.`);

    if (isSupabaseConfigured()) {
      supabaseService.assignDriver(orderId, driver.id, driver.name, driver.phone).catch(console.warn);
    }
  };

  const completeDelivery = (orderId: string, proof: ProofOfDelivery) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'delivered' as OrderStatus,
              proofOfDelivery: proof,
            }
          : o
      )
    );
    showNotification('Delivery confirmed and marked as complete!');

    if (isSupabaseConfigured()) {
      supabaseService.completeDelivery(orderId, proof).catch(console.warn);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
      )
    );
    showNotification('Order has been cancelled.');

    if (isSupabaseConfigured()) {
      supabaseService.updateOrderStatus(orderId, 'cancelled').catch(console.warn);
    }
  };

  // Product management
  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showNotification(`Added product ${newProduct.name}`);

    if (isSupabaseConfigured()) {
      supabaseService.upsertProduct(newProduct).catch((err) => {
        console.warn('Failed to save product to Supabase:', err);
      });
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showNotification(`Updated product ${updated.name}`);

    if (isSupabaseConfigured()) {
      supabaseService.upsertProduct(updated).catch(console.warn);
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification('Product removed from catalog.');

    if (isSupabaseConfigured()) {
      supabaseService.deleteProduct(productId).catch((err) => {
        console.warn('Failed to delete product from Supabase:', err);
      });
    }
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
        isLoadingData,
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
        refreshFromDatabase,
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

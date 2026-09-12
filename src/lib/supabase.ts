import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Driver, SuburbDelivery, Order, OrderStatus, ProofOfDelivery } from '../types';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem('supabase_custom_url') || '';
    localKey = localStorage.getItem('supabase_custom_key') || '';
  } catch {}

  const url = (envUrl || localUrl || '').trim();
  const key = (envKey || localKey || '').trim();

  const isConfigured = Boolean(
    url &&
    key &&
    url !== 'https://your-project-id.supabase.co' &&
    url.startsWith('https://') &&
    key !== 'your-anon-public-key'
  );

  return {
    url,
    key,
    isConfigured,
    source: envUrl ? 'env' : localUrl ? 'local' : 'none',
  };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

let clientInstance: SupabaseClient | null = null;
let lastUsedKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!clientInstance || lastUsedKey !== config.key) {
    clientInstance = createClient(config.url, config.key);
    lastUsedKey = config.key;
  }
  return clientInstance;
};

export const supabase: SupabaseClient | null = getSupabase();

export const saveCustomCredentials = (url: string, key: string) => {
  try {
    localStorage.setItem('supabase_custom_url', url.trim());
    localStorage.setItem('supabase_custom_key', key.trim());
  } catch {}
  clientInstance = null;
};

export const clearCustomCredentials = () => {
  try {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_key');
  } catch {}
  clientInstance = null;
};

// Map database order row + items to application Order type
export const formatDbOrder = (row: any, items: any[] = []): Order => {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    address: row.address,
    suburb: row.suburb,
    postalCode: row.postal_code || '2194',
    deliveryNotes: row.delivery_notes || undefined,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    assignedDriverId: row.assigned_driver_id || undefined,
    assignedDriverName: row.assigned_driver_name || undefined,
    assignedDriverPhone: row.assigned_driver_phone || undefined,
    estimatedDeliveryTime: row.estimated_delivery_time || undefined,
    proofOfDelivery: row.proof_of_delivery || undefined,
    items: items.map((it: any) => ({
      productId: it.product_id || it.productId,
      productName: it.product_name || it.productName,
      price: Number(it.price),
      quantity: Number(it.quantity),
      unit: it.unit,
      imageUrl: it.image_url || it.imageUrl,
    })),
  };
};

export const supabaseService = {
  // Test connection to Supabase
  async testConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return {
        connected: false,
        message:
          'Supabase environment variables are missing or set to placeholder values. Enter your Supabase URL and Anon Key below and click "Apply & Test Connection".',
      };
    }
    const client = getSupabase();
    if (!client) {
      return { connected: false, message: 'Could not initialize Supabase client.' };
    }
    try {
      // Try products table first since user is managing products catalog
      const { data: prodData, error: prodErr } = await client.from('products').select('id').limit(1);
      if (!prodErr) {
        return {
          connected: true,
          message: `Connected successfully to Supabase! Table public.products is accessible (${prodData?.length || 0} rows found).`,
          details: { rowsFound: prodData?.length || 0, table: 'products' },
        };
      }

      // Fallback check on orders table
      const { data, error } = await client.from('orders').select('id').limit(1);
      if (error) {
        return {
          connected: false,
          message: `Supabase returned error: ${prodErr?.message || error.message} (Code: ${error.code || prodErr?.code || 'UNKNOWN'})`,
          details: { prodErr, orderErr: error },
        };
      }
      return {
        connected: true,
        message: 'Connected successfully to Supabase! Table public.orders is accessible.',
        details: { rowsFound: data?.length || 0, table: 'orders' },
      };
    } catch (err: any) {
      return {
        connected: false,
        message: err.message || 'Unknown network error connecting to Supabase.',
        details: err,
      };
    }
  },

  // Products
  async getProducts(): Promise<{ data: Product[] | null; error?: string }> {
    const client = getSupabase();
    if (!client) return { data: null, error: 'Database not initialized' };
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getProducts error:', error.message);
      return { data: null, error: error.message };
    }

    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      unit: p.unit,
      inStock: p.in_stock,
      stockCount: Number(p.stock_count),
      description: p.description || '',
      badge: p.badge || undefined,
      tags: p.tags || [],
      imageUrl: p.image_url,
      origin: p.origin || undefined,
    }));

    return { data: mapped };
  },

  async upsertProduct(product: Product): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client.from('products').upsert({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      in_stock: product.inStock,
      stock_count: product.stockCount,
      description: product.description,
      badge: product.badge,
      tags: product.tags,
      image_url: product.imageUrl,
      origin: product.origin,
    });
    return !error;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client.from('products').delete().eq('id', productId);
    return !error;
  },

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('drivers').select('*');
    if (error) {
      console.warn('Supabase getDrivers error:', error.message);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      vehicle: d.vehicle,
      rating: Number(d.rating),
      activeOrdersCount: Number(d.active_orders_count || 0),
      totalDeliveries: Number(d.total_deliveries || 0),
      todayEarnings: Number(d.today_earnings || 0),
      avatarUrl: d.avatar_url,
      status: d.status,
    }));
  },

  // Delivery Zones
  async getDeliveryZones(): Promise<SuburbDelivery[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('delivery_zones').select('*');
    if (error) {
      console.warn('Supabase getDeliveryZones error:', error.message);
      return [];
    }

    return (data || []).map((z: any) => ({
      suburb: z.suburb,
      fee: Number(z.fee),
      estimatedMinutes: z.estimated_minutes,
      distanceKm: Number(z.distance_km),
      popular: Boolean(z.popular),
    }));
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data: orderRows, error: ordersError } = await client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.warn('Supabase getOrders error:', ordersError.message);
      return [];
    }

    return (orderRows || []).map((row: any) =>
      formatDbOrder(row, row.order_items || [])
    );
  },

  async createOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client) return { success: false, error: 'Database client not initialized' };

    // 1. Insert order parent record
    const { error: orderError } = await client.from('orders').insert({
      id: order.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail || null,
      address: order.address,
      suburb: order.suburb,
      postal_code: order.postalCode,
      delivery_notes: order.deliveryNotes || null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      assigned_driver_id: order.assignedDriverId || null,
      assigned_driver_name: order.assignedDriverName || null,
      assigned_driver_phone: order.assignedDriverPhone || null,
      estimated_delivery_time: order.estimatedDeliveryTime || null,
      proof_of_delivery: order.proofOfDelivery || null,
      created_at: order.createdAt,
    });

    if (orderError) {
      console.error('Failed to create order in Supabase:', orderError);
      return { success: false, error: orderError.message };
    }

    // 2. Insert order items
    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.imageUrl,
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Failed to insert order items in Supabase:', itemsError);
        return { success: true, error: `Order saved, but items warning: ${itemsError.message}` };
      }
    }

    return { success: true };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    return !error;
  },

  async assignDriver(
    orderId: string,
    driverId: string,
    driverName: string,
    driverPhone: string
  ): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
      .from('orders')
      .update({
        assigned_driver_id: driverId,
        assigned_driver_name: driverName,
        assigned_driver_phone: driverPhone,
        status: 'packing',
      })
      .eq('id', orderId);

    return !error;
  },

  async completeDelivery(orderId: string, proof: ProofOfDelivery): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
      .from('orders')
      .update({
        status: 'delivered',
        proof_of_delivery: proof,
      })
      .eq('id', orderId);

    return !error;
  },

  // Real-time listener for orders table
  subscribeToOrders(onUpdate: () => void) {
    const client = getSupabase();
    if (!client) return null;

    const channel = client
      .channel('orders-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client?.removeChannel(channel);
    };
  },

  // Real-time listener for products table
  subscribeToProducts(onUpdate: () => void) {
    const client = getSupabase();
    if (!client) return null;

    const channel = client
      .channel('products-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client?.removeChannel(channel);
    };
  },
};

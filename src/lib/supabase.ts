import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Driver, SuburbDelivery, Order, OrderStatus, ProofOfDelivery } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey !== 'your-anon-public-key'
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  // Products
  async getProducts(): Promise<Product[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getProducts error:', error.message);
      return [];
    }

    return (data || []).map((p: any) => ({
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
  },

  async upsertProduct(product: Product): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('products').upsert({
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

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('drivers').select('*');
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
    if (!supabase) return [];
    const { data, error } = await supabase.from('delivery_zones').select('*');
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
    if (!supabase) return [];
    const { data: orderRows, error: ordersError } = await supabase
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

  async createOrder(order: Order): Promise<boolean> {
    if (!supabase) return false;

    // 1. Insert order parent record
    const { error: orderError } = await supabase.from('orders').insert({
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
      return false;
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

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Failed to insert order items in Supabase:', itemsError);
      }
    }

    return true;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
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
    if (!supabase) return false;
    const { error } = await supabase
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
    if (!supabase) return false;
    const { error } = await supabase
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
    if (!supabase) return null;

    const channel = supabase
      .channel('schema-db-changes')
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
      supabase?.removeChannel(channel);
    };
  },
};

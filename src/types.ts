export type CategoryType = 'all' | 'fruits-veg' | 'nuts-dried' | 'flowers-plants' | 'health-pantry';

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number; // in South African Rands (ZAR)
  unit: string; // e.g., '1kg', '500g bag', 'per bunch', 'each'
  inStock: boolean;
  stockCount: number;
  description: string;
  badge?: string; // e.g., 'Fresh Cut', 'Local Farm', 'Store Favorite', 'Raw & Organic'
  tags: string[];
  imageUrl: string;
  origin?: string; // e.g. 'Western Cape', 'Tzaneen', 'Store Roasted'
}

export interface SuburbDelivery {
  suburb: string;
  fee: number; // in ZAR (Rand)
  estimatedMinutes: string;
  distanceKm: number;
  popular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
}

export interface ProofOfDelivery {
  signedBy?: string;
  signatureDataUrl?: string;
  photoUrl?: string;
  deliveredAt?: string;
  driverNotes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  suburb: string;
  postalCode: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'card_on_delivery' | 'cash_on_delivery' | 'instant_eft';
  status: OrderStatus;
  createdAt: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  estimatedDeliveryTime?: string;
  proofOfDelivery?: ProofOfDelivery;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  activeOrdersCount: number;
  totalDeliveries: number;
  todayEarnings: number;
  avatarUrl: string;
  status: 'available' | 'busy' | 'offline';
}

export type PortalType = 'customer' | 'admin' | 'driver';

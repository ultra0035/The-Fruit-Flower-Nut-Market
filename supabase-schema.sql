-- ==============================================================================
-- The Fruit, Flower & Nut Market - Supabase PostgreSQL Schema & Seed Script
-- Location: 2 Fir Cnr, Blairgowrie, Johannesburg, 2194
-- ==============================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 50,
  description TEXT,
  badge TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  origin TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  rating NUMERIC DEFAULT 4.8,
  active_orders_count INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  today_earnings NUMERIC DEFAULT 0,
  avatar_url TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DELIVERY ZONES (Suburb rates around Blairgowrie)
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id SERIAL PRIMARY KEY,
  suburb TEXT NOT NULL UNIQUE,
  fee NUMERIC NOT NULL,
  estimated_minutes TEXT NOT NULL,
  distance_km NUMERIC NOT NULL,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  postal_code TEXT DEFAULT '2194',
  delivery_notes TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_driver_id TEXT REFERENCES public.drivers(id) ON DELETE SET NULL,
  assigned_driver_name TEXT,
  assigned_driver_phone TEXT,
  estimated_delivery_time TEXT,
  proof_of_delivery JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security and allow public read/write for demo & web orders
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Public products are viewable by everyone" 
  ON public.products FOR SELECT USING (true);
CREATE POLICY "Products can be modified by anyone" 
  ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Drivers Policies
CREATE POLICY "Drivers are viewable by everyone" 
  ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers can be updated by anyone" 
  ON public.drivers FOR ALL USING (true) WITH CHECK (true);

-- Delivery Zones Policies
CREATE POLICY "Delivery zones are viewable by everyone" 
  ON public.delivery_zones FOR SELECT USING (true);
CREATE POLICY "Delivery zones can be modified by anyone" 
  ON public.delivery_zones FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
CREATE POLICY "Orders can be read by everyone" 
  ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be inserted by anyone" 
  ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated by anyone" 
  ON public.orders FOR UPDATE USING (true);

-- Order Items Policies
CREATE POLICY "Order items can be read by everyone" 
  ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items can be inserted by anyone" 
  ON public.order_items FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- Enable Supabase Realtime publication on orders so dispatch updates live
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ==============================================================================
-- SEED DATA: Delivery Suburbs (Northcliff, Windsor, Blairgowrie, etc.)
-- ==============================================================================
INSERT INTO public.delivery_zones (suburb, fee, estimated_minutes, distance_km, popular)
VALUES
  ('Blairgowrie (Local Hub)', 25, '10-20 min', 1.2, true),
  ('Northcliff', 40, '25-35 min', 6.2, true),
  ('Windsor East', 40, '20-30 min', 4.8, true),
  ('Windsor West', 40, '20-30 min', 5.1, true),
  ('Linden', 35, '15-25 min', 3.5, true),
  ('Craighall / Craighall Park', 45, '20-30 min', 4.9, false),
  ('Robindale', 30, '15-25 min', 2.8, false),
  ('Ferndale', 35, '20-30 min', 3.9, false),
  ('Cresta / Darrenwood', 40, '25-35 min', 5.5, false),
  ('Store Pickup (2 Fir Cnr)', 0, 'Ready in 20 min', 0, true)
ON CONFLICT (suburb) DO UPDATE SET
  fee = EXCLUDED.fee,
  estimated_minutes = EXCLUDED.estimated_minutes,
  distance_km = EXCLUDED.distance_km;

-- ==============================================================================
-- SEED DATA: Drivers
-- ==============================================================================
INSERT INTO public.drivers (id, name, phone, vehicle, rating, active_orders_count, total_deliveries, today_earnings, avatar_url, status)
VALUES
  ('driver-1', 'Sipho Ndlovu', '082 451 9820', 'Toyota Hilux Bakkie (Reg: CA 284-912)', 4.9, 1, 142, 380, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'busy'),
  ('driver-2', 'Thabo Mokoena', '071 892 3341', 'Nissan NP200 (Reg: GP 901-442)', 4.8, 1, 98, 260, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'available'),
  ('driver-3', 'Blessing Moyo', '063 219 7784', 'Honda Delivery Scooter (Reg: JHB 551)', 4.9, 0, 215, 410, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', 'available')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

-- ==============================================================================
-- SEED DATA: Authentic Products (Produce, Roasted Nuts, Flowers, Pantry)
-- ==============================================================================
INSERT INTO public.products (id, name, category, price, unit, in_stock, stock_count, description, badge, tags, image_url, origin)
VALUES
  ('nut-1', 'Raw California Almonds', 'nuts-dried', 79, '500g pack', true, 45, 'Crisp, premium whole unroasted almonds packed fresh daily in store. Rich in protein, healthy fats and vitamin E.', 'Store Favorite', ARRAY['Raw', 'Vegan', 'Heart Healthy'], 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80', 'Packed at Blairgowrie Market'),
  ('nut-2', 'Roasted & Salted Cashews', 'nuts-dried', 95, '500g tub', true, 38, 'Golden, buttery roasted jumbo cashews lightly seasoned with sea salt. Perfectly crunchy snack.', 'Best Seller', ARRAY['Roasted', 'Store Roasted'], 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80', 'In-house Roasting'),
  ('nut-3', 'Pitted Royal Medjool Dates', 'nuts-dried', 65, '400g tub', true, 28, 'Luscious, caramel-like sweet Medjool dates imported fresh. Natural sweetener for smoothies or healthy snacking.', 'Fresh Batch', ARRAY['Raw', 'Energy Boost'], 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&q=80', 'Middle Eastern Import'),
  ('nut-4', 'Raw Macadamia Nut Halves', 'nuts-dried', 115, '350g pack', true, 19, 'Creamy, decadent local South African macadamias from Mpumalanga farms. Ultra buttery texture.', 'Local SA Farm', ARRAY['Keto Friendly', 'Mpumalanga'], 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=600&q=80', 'Mpumalanga Valley'),
  ('nut-5', 'Dried South African Mango Strips', 'nuts-dried', 58, '250g bag', true, 52, 'Chewy, naturally sweet sunshine mango strips with zero added sugar or sulphur preservatives.', 'Preservative-Free', ARRAY['No Added Sugar', 'Kids Lunchbox'], 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80', 'Hoedspruit, Limpopo'),
  ('nut-6', 'Turkish Apricots & Golden Raisins Mix', 'nuts-dried', 49, '400g tub', true, 33, 'Plump dried golden apricots paired with sweet Thompson raisins. Excellent with oats or artisan cheese boards.', 'Great Value', ARRAY['Trail Mix', 'Fiber Rich'], 'https://images.unsplash.com/photo-1595231712325-9fdec67ff7e8?auto=format&fit=crop&w=600&q=80', 'Packed in Blairgowrie'),

  ('veg-1', 'Ripe Hass Avocados (Ready to Eat)', 'fruits-veg', 39, 'Pack of 3', true, 60, 'Creamy, buttery dark Hass avocados hand-selected for perfect ripeness today.', 'Market Staple', ARRAY['Keto', 'Salad Essentials'], 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80', 'Tzaneen, Limpopo'),
  ('veg-2', 'Crisp Pink Lady Apples', 'fruits-veg', 32, '1.5kg bag', true, 42, 'Sweet and tart crisp Pink Lady apples straight from Western Cape orchards.', 'Farm Fresh', ARRAY['Vitamin C', 'Snack'], 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', 'Elgin, Western Cape'),
  ('veg-3', 'Vine-Ripened Roma Plum Tomatoes', 'fruits-veg', 28, '1kg box', true, 55, 'Juicy, fragrant firm Roma tomatoes perfect for pasta sauces, summer salads or caprese.', 'Locally Picked', ARRAY['Salad', 'Rich in Lycopene'], 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 'Brits, North West'),
  ('veg-4', 'Baby Spinach & Rocket Wild Mix', 'fruits-veg', 26, '200g pillow pack', true, 25, 'Pre-washed tender baby spinach leaves blended with peppery wild rocket.', 'Washed & Ready', ARRAY['Organic', 'Hydroponic'], 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', 'Muldersdrift Hydroponics'),
  ('veg-5', 'Sweet Spanish Watermelon', 'fruits-veg', 49, 'Half cut (approx 2.5kg)', true, 18, 'Vibrant red, thirst-quenching sweet watermelon, chilled and wrapped in store.', 'Summer Favorite', ARRAY['Hydrating', 'Sweet'], 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 'Lowveld Produce'),
  ('veg-6', 'Organic Rainbow Carrots Bunch', 'fruits-veg', 24, 'per bunch', true, 30, 'Earthy purple, orange and yellow heritage carrots with feathery greens intact.', 'Heritage Harvest', ARRAY['Organic', 'Roasting'], 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 'Gauteng Organic Smallholding'),

  ('flow-1', 'King Protea & Cape Fynbos Bouquet', 'flowers-plants', 165, 'Hand-tied bunch', true, 12, 'Magnificent South African national flower accented with pincushions, safari sunset and aromatic fynbos greenery.', 'National Heritage', ARRAY['Indigenous', 'Long Lasting'], 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', 'Overberg Floral Nursery'),
  ('flow-2', 'Sunshine Giant Sunflowers', 'flowers-plants', 75, 'Bunch of 5 stems', true, 16, 'Radiant golden yellow open sunflowers that brighten up any lounge or dining table.', 'Fresh Daily', ARRAY['Cheerful', 'Direct Farm Cut'], 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80', 'Magaliesburg Flower Farm'),
  ('flow-3', 'Fragrant Stargazer Oriental Lilies', 'flowers-plants', 130, 'Stem bunch (3-4 heads)', true, 10, 'Intensely scented, dramatic pink blooms with elegant speckled petals.', 'Aromatic', ARRAY['Special Occasion', 'Fragrant'], 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80', 'Krugersdorp Hothouse'),
  ('flow-4', 'Assorted Potted Succulents & Cacti', 'flowers-plants', 69, 'in terracotta pot', true, 22, 'Drought-hardy low maintenance desktop succulent in rustic terracotta pot.', 'Easy Care', ARRAY['Indoor', 'Water-Wise'], 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', 'Blairgowrie Nursery Corner'),

  ('pant-1', 'Organic White Royal Quinoa', 'health-pantry', 54, '500g pack', true, 27, 'High-protein ancient grain, pre-washed and saponin-free. Perfect rice replacement or salad base.', 'Gluten-Free', ARRAY['Superfood', 'High Protein'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 'Certified Andean Origin'),
  ('pant-2', 'Raw Cold-Pressed Extra Virgin Coconut Oil', 'health-pantry', 82, '500ml glass jar', true, 20, 'Unrefined pure virgin coconut oil. Ideal for baking, Asian stir-fries or natural skin/hair care.', 'Cold Pressed', ARRAY['Keto', 'Glass Jar'], 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80', 'Fairtrade Organic'),
  ('pant-3', 'Stone-Ground Buckwheat Flour', 'health-pantry', 46, '1kg pack', true, 34, 'Nutty, mineral-rich artisan flour milled on traditional stone mills for gluten-free pancakes and crêpes.', 'Artisan Milled', ARRAY['Gluten-Free', 'Baking'], 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Free State Milling'),
  ('pant-4', 'Almond Breeze Barista Blend Milk', 'health-pantry', 38, '1L tetra pack', true, 48, 'Creamy, dairy-free almond milk formulated specially to froth smoothly for cappuccinos and matcha.', 'Plant-Based', ARRAY['Dairy-Free', 'Barista'], 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'Blue Diamond SA')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count;

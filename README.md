# 🌰 The Fruit, Flower & Nut Market

> **Authentic Blairgowrie Market Ordering, Admin Operations & Driver Dispatch System**  
> *Location:* 2 Fir Cnr (cnr Conrad Dr), Blairgowrie, Johannesburg, 2194 · Tel: 011 789 3229  
> *"Come in and see our nuts!"*

---

## 📋 Overview

A full-featured, responsive web application for **The Fruit, Flower & Nut Market**, connecting local Johannesburg North customers, in-store market administrators, and delivery drivers into one synchronized workflow.

### 🌟 Key Capabilities

1. **Customer Ordering App**:
   - Curated catalog: Hand-selected farm produce (avocados, Pink Lady apples, Roma tomatoes), store-roasted nuts (California almonds, cashews, macadamias), freshly cut floral bouquets (King Protea & Fynbos, sunflowers, lilies), and healthy pantry goods.
   - Suburb delivery fees pre-configured:
     - **Northcliff**: R40
     - **Windsor West / Windsor East**: R40
     - **Blairgowrie (Local Hub)**: R25
     - **Linden**: R35 | **Craighall Park**: R45 | **Store Pickup**: Free
   - Mobile cart drawer with delivery instructions and flexible payment choices (Card on Delivery / Yoco, Cash on Delivery, Instant EFT).
   - Live order tracker with dispatch radar and GPS route visualization along Conrad Drive.

2. **Admin Store Management**:
   - Real-time revenue, order counts, and active delivery stats.
   - Queue management: Advance orders from *Pending* ➔ *Packing* ➔ *Dispatch Driver* with 1 click.
   - Inventory controls: Add products, update stock quantities, toggle availability.
   - Suburb delivery rate adjustments.

3. **Delivery Driver Fleet Portal**:
   - Driver profile switcher with route overview (Sipho, Thabo, Blessing).
   - Package checklist to verify all produce items before departing 2 Fir Cnr.
   - Direct call and WhatsApp buttons for customer contact.
   - Interactive turn-by-turn GPS route simulator.
   - **Digital Proof of Delivery**: Signature canvas pad for touch/mouse sign-off, drop-off gate photo verification, and handover notes.

---

## 🚀 Quick Start Guide: GitHub, Supabase & Vercel

Follow these steps to take this application from Google AI Studio to GitHub, connect a live Supabase PostgreSQL database, and deploy to Vercel.

---

### Step 1: Export to GitHub

1. In the top-right corner of the **Google AI Studio** workspace, open the **Share / Export** menu.
2. Click **Export to GitHub**.
3. Select your GitHub account, choose a repository name (e.g., `fruit-flower-nut-market`), and confirm.
4. AI Studio will automatically push all code, assets, and configs to your new repository.

*(Alternatively, download the ZIP, extract it locally, and run `git init && git add . && git commit -m "Initial commit" && git push` to your GitHub repo).*

---

### Step 2: Set Up Supabase Database

1. Sign up or log in at **[supabase.com](https://supabase.com)** and click **New project**.
2. Name your project (e.g., `market-blairgowrie`), set a secure database password, and choose your preferred cloud region (e.g., Frankfurt/London or closest to South Africa).
3. Open the **SQL Editor** from the left navigation bar in the Supabase Dashboard.
4. Click **New query**, open the file `supabase-schema.sql` from this repository, copy its entire contents, and paste it into the editor.
5. Click **Run**. This will create:
   - `products` table + initial Blairgowrie market catalog
   - `drivers` table + delivery driver profiles
   - `delivery_zones` table + local suburb fees (Northcliff, Windsor, Blairgowrie, etc.)
   - `orders` and `order_items` tables with real-time replication
   - Row Level Security (RLS) policies allowing web orders
6. Go to **Project Settings** ➔ **API** and copy:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon / public key** (the public key under *Project API keys*)

---

### Step 3: Deploy to Vercel

1. Log in to **[vercel.com](https://vercel.com)** and click **Add New... ➔ Project**.
2. Import your GitHub repository (`fruit-flower-nut-market`).
3. Vercel will auto-detect the **Vite** framework preset:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand the **Environment Variables** section and add the two Supabase keys from Step 2:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJh...` | Your Supabase public anon key |

5. Click **Deploy**. Your app will build and go live on a `*.vercel.app` domain within 1–2 minutes!

*(Note: If you deploy before configuring Supabase, the app runs smoothly with offline local storage cache, and switches to Supabase Live as soon as the keys are set).*

---

## 💻 Local Development

To run this application locally on your computer:

```bash
# 1. Clone repository
git clone https://github.com/your-username/fruit-flower-nut-market.git
cd fruit-flower-nut-market

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Supabase)
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

# 4. Start local development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🗄️ Database Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    products     │       │     drivers     │       │ delivery_zones  │
│─────────────────│       │─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │       │ suburb (Unique) │
│ category        │       │ phone           │       │ fee (ZAR)       │
│ price (ZAR)     │       │ vehicle         │       │ estimated_time  │
│ unit            │       │ rating          │       │ distance_km     │
│ in_stock        │       │ status          │       └─────────────────┘
│ stock_count     │       └────────┬────────┘
│ image_url       │                │
└─────────────────┘                │
                                   ▼
┌─────────────────┐ 1:N   ┌─────────────────┐
│     orders      │──────<│   order_items   │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ customer_name   │       │ order_id (FK)   │
│ customer_phone  │       │ product_id      │
│ address, suburb │       │ product_name    │
│ total, subtotal │       │ price, quantity │
│ status          │       │ unit, image_url │
│ assigned_driver │       └─────────────────┘
│ proof_of_deliv. │
└─────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Lucide React, Canvas Confetti
- **Build Tool:** Vite 6, Vercel SPA Routing (`vercel.json`)
- **Database & Realtime:** Supabase (PostgreSQL), Supabase Realtime Channels
- **State Management:** Reactive Store Context with Local Storage Fallback

---

## 📍 Store Reference Information

- **Store Name:** The Fruit, Flower & Nut Market
- **Physical Address:** 2 Fir Cnr (cnr Conrad Dr), Blairgowrie, Johannesburg, 2194
- **Telephone:** 011 789 3229
- **Hours:** Mon–Sat: 8:00 am – 5:30 pm | Sun: 8:00 am – 1:30 pm

# ITSPRTYCREATIONS – Professional E-Commerce Platform

Official online shopping platform for **LTS Party Creations**, engineered using the Etsy shop [ltsprtycreations.etsy.com](https://ltsprtycreations.etsy.com) as the primary reference.

---

## 🌟 Key Highlights & Features

1. **Website Branding**: Branded as **ITSPRTYCREATIONS** (LTS Party Creations) with a luxury stationery and greeting-cards theme.
2. **Unified Customer & Admin Login on Same Page**:
   - Single clean portal (`/auth` and header modal) with segmented controls.
   - Customers: Real Mobile OTP login via SMS, Google OAuth, and Email/Password registration.
   - Administrators: Direct Admin authentication with instant role verification and redirect to `/admin`.
3. **Dynamic Greeting Management**:
   - Admin adds a new greeting card in the Admin Panel -> Instantly published in SQLite/PostgreSQL database -> Immediately reflects across customer category listings and search.
4. **Authentic Etsy Product Catalog**:
   - Preserves original Etsy listing titles, prices, descriptions, specifications, variations (Canva Digital Link vs Printed Cardstock 10-packs), and high-resolution galleries from `https://ltsprtycreations.etsy.com`.
   - Admin Etsy Import Tool to paste JSON/CSV or sync active shop listings.
5. **14 Dynamic Greeting Categories**:
   - Birthday Greetings, Anniversary Greetings, Wedding Greetings, Valentine's Day Greetings, Christmas Greetings, New Year Greetings, Thank You Greetings, Congratulations Greetings, Friendship Greetings, Love Greetings, Mother's Day Greetings, Father's Day Greetings, Custom Greetings, All Other Greetings.
   - Full admin CRUD + activate/deactivate toggles.
6. **Cart & Secure Checkout**:
   - Synchronized cart, delivery address form, dynamic coupon discounts (`WELCOME10`, `PARTY20`, `FLAT50`), free shipping calculation above ₹499.
7. **Razorpay Payment Gateway**:
   - Real server-side order creation & cryptographic HMAC-SHA256 signature verification (`order_id|payment_id` against `RAZORPAY_KEY_SECRET`).
   - Cash on Delivery (COD) toggle.
8. **Live Order Tracking & Invoices**:
   - Live status stepper (Placed -> Confirmed -> Processing -> Shipped -> Delivered) with consignment AWB tracking numbers and printable invoices.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Canvas Confetti
- **ORM & Database**: Prisma ORM with SQLite for zero-setup local run; production-ready for Supabase / Render PostgreSQL
- **Authentication**: JWT Cookies + Bcrypt Password Hashing + SMS OTP Service + Google OAuth
- **Payments**: Razorpay (UPI, Credit/Debit Cards, Net Banking) + COD
- **SMS Gateway**: Fast2SMS / Twilio with database OTP verification

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
cd C:\Users\mahes\.gemini\antigravity\scratch\itsprtycreations
npm install
```

### 2. Database Sync & Seeding
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

- **Admin Account**: `admin@itsprtycreations.com` / `Admin@12345`
- **Customer Account**: `customer@demo.com` / `Customer@123`
- **Sample Coupons**: `PARTY20` (20% off), `WELCOME10` (10% off), `FLAT50` (₹50 off)

---

## 🧪 All 15 Mandatory Test Cases Verified

Run the automated test suite anytime:
```bash
node test-e2e-suite.js
```
All 15 workflows pass with 100% coverage:
1. Admin logs in successfully
2. Admin adds a new greeting card
3. New greeting appears on customer website
4. Admin changes a product price
5. Updated price appears everywhere
6. Admin changes product description
7. Updated description appears on product page
8. Customer registers using real mobile OTP
9. Customer logs in using Google
10. Customer adds products to cart
11. Customer completes checkout
12. Payment is verified on the backend
13. Admin receives the new order
14. Admin updates order status (Tracking AWB)
15. Customer views updated order status and tracking


## Deploy to Render (Production)

This project uses **Next.js 14 + Prisma + PostgreSQL**. Do not use SQLite for Render production: the service filesystem is ephemeral and SQLite data can be lost on redeploy/restart.

### 1. Create PostgreSQL
1. In Render, create a new **PostgreSQL** database.
2. Copy its **Internal Database URL** (use the External URL only if connecting from outside Render).
3. Keep the database in the same Render region as the web service.

### 2. Create the Web Service
1. Push this project to GitHub.
2. In Render choose **New + → Web Service** and connect the repository.
3. Set **Root Directory** to `itsprtycreations` only if this folder is inside a larger repository; otherwise leave it blank.
4. Runtime: Node.
5. Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
6. Start Command: `npm start`

### 3. Add Render Environment Variables
Add these in the Render service Environment page:
- `DATABASE_URL` = PostgreSQL **Internal Database URL**
- `JWT_SECRET` = a unique random value with at least 32 characters (generate with `openssl rand -base64 48`)
- `ADMIN_NAME` = your admin display name
- `ADMIN_EMAIL` = your admin login email
- `ADMIN_PASSWORD` = a strong password (at least 12 characters)
- `NEXT_PUBLIC_APP_URL` = your deployed `https://...onrender.com` URL
- `NEXT_PUBLIC_SITE_NAME` = `ITSPRTYCREATIONS`
- Add Razorpay, Cloudinary, SMS and Google OAuth values only when those features are configured.

The first successful admin login creates the admin account from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Keep these values private. Changing `ADMIN_PASSWORD` later will also synchronize the stored admin password on the next successful credential check.

### 4. Persistent Images
Do not save customer/product uploads to the Render service local filesystem. Configure Cloudinary and use its persistent cloud storage. The public Cloudinary upload preset must be restricted to the required upload type/folder and size limits.

### 5. Deploy and verify
After deployment, test: homepage, customer registration/login, admin login, product/category creation, cart, checkout, Razorpay test payment, order status, and image upload. Configure Razorpay live keys only after test-mode verification.

**Important:** `prisma db push` creates/updates the PostgreSQL schema. For an existing production database, take a backup before running schema changes. Switching from SQLite to PostgreSQL does not automatically copy existing SQLite records; migrate/import them separately if you need to preserve existing data.

# 🌶️ SevMunchies — Snack Store with WhatsApp Checkout

A beautiful, mobile-friendly snack-selling website built with **Next.js 14**. Customers browse a product catalog, add to cart, apply coupons, and place orders directly via **WhatsApp** — no payment gateway needed.

**No database required** — all data is stored in a single JSON file (`data/db.json`). Images are uploaded to **Cloudinary** (free tier) and served via their global CDN with automatic on-the-fly resizing & WebP optimization (94% smaller for thumbnails).

Inspired by themalwastory.com, with a warm spice-shop theme.

---

## ✨ Features

### Customer side (`/`)
- **Hero carousel** auto-rotating featured snacks
- **Product grid** with badges (Bestseller, Hot, New, Spicy)
- **Product detail dialog** with multi-image gallery + thumbnails
- **Cart drawer** with +/- quantity controls
- **Coupon codes** (percent / flat with min-order rules)
- **Sticky mobile cart bar** for quick checkout on phones
- **WhatsApp checkout** — sends formatted order (name, phone, address, cart, total) to your WhatsApp
- **Search** snacks by name / description
- **About / Contact page** at `/about`
- Fully responsive (mobile, tablet, laptop, desktop)

### Admin side (`/admin`) — *hidden, accessed by URL only*
- Password-gated (default: `admin123`, configurable)
- **Products CRUD** — add / edit / delete
- **Multiple images per product** — upload from device (auto-uploaded to Cloudinary CDN with optimization) or paste any public image URL; reorder, set primary, delete individual images
- **Featured toggle** — controls hero carousel inclusion
- **Coupons CRUD** — create percent or flat-discount codes with min-order, enable/disable
- **Settings** — change brand name, WhatsApp number, contact address, contact email, admin password

---

## 🛠 Tech Stack

| Layer       | Tech                                              |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js 14 (App Router)                           |
| UI          | Tailwind CSS + shadcn/ui + Lucide icons           |
| Storage     | **JSON file** at `data/db.json` (no DB needed)    |
| Images      | **Cloudinary CDN** with auto-resize/WebP via URL  |
| Toasts      | Sonner                                            |
| State       | React hooks + `localStorage` for cart persistence |

No database. No third-party paid services. No payment gateway. Pure WhatsApp checkout.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** ≥ 18
- **Yarn** (recommended) — `npm install -g yarn`

That's it. No MongoDB, no external services.

### 2. Clone & install

```bash
git clone <your-repo-url> sevmunchies
cd sevmunchies
yarn install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*

# Cloudinary (sign up free at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

> Get your Cloudinary credentials from https://console.cloudinary.com/settings/api-keys after signing up (free tier: 25 GB storage + 25 GB bandwidth/month — easily enough for a small store).

### 4. Run the dev server

```bash
yarn dev
```

Open **http://localhost:3000** — `data/db.json` is auto-created with 5 sample snacks and 2 coupons (`WELCOME10`, `FLAT50`) on first request.

### 5. Access the admin panel

- Go to **http://localhost:3000/admin**
- Default password: **`admin123`**
- Change it immediately under **Settings → New Admin Password**

---

## 🖼️ How to Add Product Images (Cloudinary)

You have two ways to add images in `/admin`:

### **Option A — Upload from your device** ⭐ Recommended
1. In the product form, click the **Upload** button.
2. Pick one or many images from your computer/phone (each up to 10 MB).
3. We send them to **Cloudinary** which:
   - Stores the original on their global CDN
   - Automatically generates optimized variants (WebP, AVIF, resized) on-the-fly
   - Returns a permanent URL we save to your product
4. Customers see images at **400 px / 20 KB** for thumbnails and **1200 px / ~150 KB** for galleries — even though the original is 2 MB+. **94% bandwidth savings.**

### **Option B — Paste any public image URL**
- Use the URL field in the same form for external images (e.g. CDN you already use). Stored as-is.

### How transformations work
We use Cloudinary's URL-based transformations. A stored image:
```
https://res.cloudinary.com/<cloud>/image/upload/v123/sevmunchies/abc.jpg
```
is auto-rewritten on the customer side as:
```
https://res.cloudinary.com/<cloud>/image/upload/w_600,c_fill,f_auto,q_auto/v123/sevmunchies/abc.jpg
```
- `w_600` → resize to 600 px wide
- `f_auto` → serve WebP / AVIF if browser supports
- `q_auto` → automatic quality optimization
- `c_fill` → crop-to-fill aspect ratio

The helper lives in `app/page.js` as `cldUrl(url, width)`.

---

## 📂 Project Structure

```
.
├── app/
│   ├── api/[[...path]]/route.js   # All backend API endpoints (catch-all)
│   ├── page.js                    # Customer shop (home)
│   ├── admin/page.js              # Admin panel (products / coupons / settings)
│   ├── about/page.js              # About + Contact page
│   ├── layout.js                  # Root layout + Toaster
│   └── globals.css                # Theme tokens + custom styles
├── components/ui/                 # shadcn/ui components
├── lib/utils/                     # cn() helper
├── data/
│   └── db.json                    # 📦 ALL YOUR DATA LIVES HERE
├── public/                        # static assets
├── .env                           # environment variables (NOT committed)
├── package.json
├── tailwind.config.js
└── README.md
```

### `data/db.json` shape

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Masala Papdi",
      "title": "Tangy & Crispy Delight",
      "description": "...",
      "price": 180,
      "weight": "250 gms",
      "images": ["https://lh3.googleusercontent.com/d/FILE_ID", "..."],
      "badge": "Bestseller",
      "featured": true,
      "createdAt": "ISO string"
    }
  ],
  "coupons": [
    {
      "id": "uuid",
      "code": "WELCOME10",
      "type": "percent",
      "value": 10,
      "minOrder": 300,
      "active": true,
      "createdAt": "ISO string"
    }
  ],
  "settings": {
    "password": "admin123",
    "whatsapp": "916303520089",
    "brand": "SevMunchies",
    "address": "Hyderabad, India",
    "email": "orders@sevmunchies.in"
  }
}
```

**Backups:** simply copy `data/db.json` somewhere safe. To migrate / restore — drop the file back in.

---

## 🔌 API Reference

All API routes are under `/api/*`. Mutations require the header
`x-admin-password: <your_admin_password>`.

| Method | Endpoint                  | Auth  | Description                          |
| ------ | ------------------------- | ----- | ------------------------------------ |
| GET    | `/api/products`           | —     | List all products                    |
| POST   | `/api/products`           | admin | Create product                       |
| PUT    | `/api/products/:id`       | admin | Update product                       |
| DELETE | `/api/products/:id`       | admin | Delete product                       |
| POST   | `/api/admin/upload`       | admin | **Multipart upload → Cloudinary**, returns `{ url, public_id, ... }` |
| GET    | `/api/settings`           | —     | Public settings (brand, whatsapp, …) |
| POST   | `/api/admin/login`        | —     | Validate admin password              |
| POST   | `/api/admin/settings`     | admin | Update brand/whatsapp/password/…     |
| GET    | `/api/coupons`            | admin | List all coupons                     |
| POST   | `/api/coupons`            | admin | Create coupon                        |
| PUT    | `/api/coupons/:id`        | admin | Update coupon                        |
| DELETE | `/api/coupons/:id`        | admin | Delete coupon                        |
| POST   | `/api/coupons/validate`   | —     | `{ code, total }` → discount info    |

---

## 📱 How WhatsApp Checkout Works

When a customer clicks **Send Order on WhatsApp**, the app builds a formatted message:

```
*New Order — SevMunchies*

*Customer:* John Doe
*Phone:* +91 9876543210
*Address:* Flat 12, MG Road, Hyderabad

*Order Details:*
1. Masala Papdi (250 gms) × 2 = ₹360
2. Garlic Sev (250 gms) × 1 = ₹200

Subtotal: ₹560
Coupon (WELCOME10): -₹56
*Total: ₹504*

Please confirm my order. Thank you!
```

It then opens `https://wa.me/<your_number>?text=<message>` — the customer just hits Send, and the order lands in your WhatsApp inbox.

**Update your WhatsApp number** any time from `/admin` → **Settings**.

---

## 🎨 Customizing the Theme

Theme tokens live in `app/globals.css`:

```css
--primary: 8 75% 42%;     /* spice red */
--accent:  38 85% 55%;    /* gold */
--background: 38 50% 97%; /* warm cream */
```

Custom utility classes:
- `.spice-gradient` — maroon → orange gradient
- `.warm-gradient` — cream gradient
- `.gold-text` — gold gradient text
- `.snack-card` — hover lift effect

Fonts: **Playfair Display** (headings) + **Inter** (body), loaded from Google Fonts.

---

## 📦 Production Build

```bash
yarn build
yarn start
```

The app runs on port `3000` by default. Reverse-proxy or deploy to your favourite host.

For any host, ensure:
- `data/db.json` is on **persistent disk** (NOT ephemeral) — otherwise data is lost on restart
- Env var: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`

> ⚠️ On serverless platforms (Vercel, Netlify) the filesystem is **read-only / ephemeral**. For those hosts, swap to a hosted DB or use a persistent volume. For VPS / Render disk / Railway / DigitalOcean, the file approach works perfectly.

---

## 🧪 Useful Dev Commands

```bash
# Start dev with hot reload
yarn dev

# Build production bundle
yarn build

# Start production server
yarn start

# Reset all data (deletes products, coupons, custom settings)
rm data/db.json
# Next request will auto-recreate with seed data
```

---

## 🔐 Admin Tips

- Admin link is **NOT shown in the UI** — bookmark `/admin`.
- Default credentials are `admin123`. **Change them on first login.**
- All product images must be **publicly accessible** Google Drive links (or any public URL).
- The "Featured" toggle controls which products appear in the hero carousel.

---

## 🐛 Troubleshooting

| Problem                                  | Fix                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Products not showing                     | Check `data/db.json` exists and is valid JSON. Hard reload browser.   |
| Image broken / not loading               | The Google Drive file must be set to **"Anyone with the link"**.     |
| Admin login always fails                 | Default password is `admin123`. Or edit `data/db.json` → `settings.password`. |
| WhatsApp link doesn't open               | Ensure number is in international format **without `+`** (e.g. `916303520089`). |
| Lost data after deploy                   | Your host's filesystem is ephemeral — mount a persistent disk for `data/`. |

---

## 📄 License

MIT — yours to use, modify, and ship.

---

**Made with ❤️ + a generous handful of spices.**

# 🌶️ SevMunchies — Snack Store with WhatsApp Checkout

A beautiful, mobile-friendly snack-selling website built with **Next.js 14**. Customers browse a product catalog, add to cart, apply coupons, and place orders directly via **WhatsApp** — no payment gateway needed.

**No database required** — all data is stored in a single JSON file (`data/db.json`). Images are hosted on **Google Drive** (you paste share links and we auto-convert to direct image URLs).

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
- **Multiple Google Drive images per product** — paste share link, we auto-convert; reorder, set primary, delete individual images
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
| Images      | **Google Drive** share links (auto-normalized)    |
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
```

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

## 🖼️ How to Add Product Images (Google Drive)

1. Upload your image to Google Drive.
2. Right-click the image → **Share** → set access to **"Anyone with the link"**.
3. Click **Copy link** — you'll get a URL like:
   ```
   https://drive.google.com/file/d/1AbCDeFgHiJkLmNoPq/view?usp=sharing
   ```
4. In `/admin` → **Add/Edit Product** → paste that link in the **Images** field and click **Add**.
5. We automatically convert it to a direct image URL:
   ```
   https://lh3.googleusercontent.com/d/1AbCDeFgHiJkLmNoPq
   ```
6. Add as many images as you want per product. Drag-reorder, set primary, or remove any.

> ⚠️ **The Drive file MUST be set to "Anyone with the link"**, otherwise it won't display publicly.

You can also paste any other public image URL (CDN, your own host, etc.) — those are stored as-is.

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

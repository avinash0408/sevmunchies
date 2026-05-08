import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// ---- Google Drive URL helper ----
// Accepts any of:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID
//   https://drive.google.com/uc?export=view&id=FILE_ID
// Returns a direct, embeddable URL: https://lh3.googleusercontent.com/d/FILE_ID
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url
  const u = url.trim()
  const m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || u.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (m && m[1]) return `https://lh3.googleusercontent.com/d/${m[1]}`
  return u
}

// ---- Initial seed ----
const SEED = {
  products: [
    {
      id: uuidv4(),
      name: 'Masala Papdi',
      title: 'Tangy & Crispy Delight',
      description: 'Hand-rolled crispy papdi tossed in a tangy blend of roasted spices. Gluten-free, no preservatives — just pure crunch.',
      price: 180,
      weight: '250 gms',
      images: [
        'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/vg2h435r_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%282%29.jpeg',
        'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/zu4kk6d3_WhatsApp%20Image%202026-05-06%20at%2023.12.07%20%282%29.jpeg',
      ],
      badge: 'Bestseller',
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Garlic Sev',
      title: 'Zesty Garlic Treat',
      description: 'Crunchy gram-flour sev infused with bold roasted garlic. The perfect chai companion with a punch of flavour.',
      price: 200,
      weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mslefe51_WhatsApp%20Image%202026-05-06%20at%2023.12.07.jpeg'],
      badge: 'Spicy',
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Laung Sev',
      title: 'Aromatic Clove Punch',
      description: 'A traditional sev with a warming hint of clove and exotic spices. Slow-cooked and irresistibly aromatic.',
      price: 220,
      weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/ypejqw0k_WhatsApp%20Image%202026-05-07%20at%2000.14.41%20%282%29.jpeg'],
      badge: 'New',
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Masala Papdi Pack',
      title: 'Family Sharing Pack',
      description: 'Our signature Masala Papdi in a handy share-pack. Perfect for tea-time, parties, and movie nights with the family.',
      price: 160,
      weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/zu4kk6d3_WhatsApp%20Image%202026-05-06%20at%2023.12.07%20%282%29.jpeg'],
      badge: '',
      featured: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Pepper Sticks',
      title: 'Fiery Black Pepper Crunch',
      description: 'Long, crispy sticks tossed with cracked black pepper and red chilli flakes. Smoky, fiery, dangerously addictive.',
      price: 190,
      weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mpay0icf_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%286%29.jpeg'],
      badge: 'Hot',
      featured: true,
      createdAt: new Date().toISOString(),
    },
  ],
  coupons: [
    { id: uuidv4(), code: 'WELCOME10', type: 'percent', value: 10, minOrder: 300, active: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), code: 'FLAT50', type: 'flat', value: 50, minOrder: 500, active: true, createdAt: new Date().toISOString() },
  ],
  settings: {
    password: 'admin123',
    whatsapp: '916303520089',
    brand: 'SevMunchies',
    address: 'Hyderabad, India',
    email: 'orders@sevmunchies.in',
  },
}

// ---- Atomic load/save ----
let cache = null
let savePromise = Promise.resolve()

async function loadDb() {
  if (cache) return cache
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(DB_FILE, 'utf-8')
    cache = JSON.parse(raw)
    // Backfill missing keys
    cache.products ??= []
    cache.coupons ??= []
    cache.settings ??= { ...SEED.settings }
  } catch (e) {
    cache = JSON.parse(JSON.stringify(SEED))
    await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2))
  }
  return cache
}

async function saveDb() {
  // serialize writes
  savePromise = savePromise.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2))
  })
  return savePromise
}

async function handler(request, { params }) {
  try {
    const db = await loadDb()
    const path = (params?.path || []).join('/')
    const method = request.method

    // === Public endpoints ===
    if (method === 'GET' && path === 'products') {
      return NextResponse.json(db.products)
    }
    if (method === 'GET' && path === 'settings') {
      const s = db.settings
      return NextResponse.json({ whatsapp: s.whatsapp || '', brand: s.brand || 'SevMunchies', address: s.address || '', email: s.email || '' })
    }

    const body = method !== 'GET' ? await request.json().catch(() => ({})) : {}

    if (method === 'POST' && path === 'admin/login') {
      if (body.password === db.settings.password) return NextResponse.json({ ok: true, token: 'sev-' + Date.now() })
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
    }

    if (method === 'POST' && path === 'coupons/validate') {
      const code = (body.code || '').trim().toUpperCase()
      const total = Number(body.total) || 0
      const c = db.coupons.find(x => x.code === code)
      if (!c || !c.active) return NextResponse.json({ valid: false, message: 'Invalid coupon code' })
      if (total < (c.minOrder || 0)) return NextResponse.json({ valid: false, message: `Minimum order ₹${c.minOrder} required` })
      const discount = c.type === 'percent' ? Math.round(total * c.value / 100) : c.value
      return NextResponse.json({ valid: true, code: c.code, type: c.type, value: c.value, discount, message: `Coupon applied — saved ₹${discount}!` })
    }

    // === Admin auth ===
    const adminPwd = request.headers.get('x-admin-password')
    const isAdmin = adminPwd && adminPwd === db.settings.password

    if (method === 'GET' && path === 'coupons') {
      if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.json(db.coupons)
    }

    if (method !== 'GET' && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // === Products CRUD ===
    if (method === 'POST' && path === 'products') {
      const images = Array.isArray(body.images) ? body.images.map(normalizeImageUrl).filter(Boolean) : []
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled',
        title: body.title || '',
        description: body.description || '',
        price: Number(body.price) || 0,
        weight: body.weight || '',
        images,
        badge: body.badge || '',
        featured: !!body.featured,
        createdAt: new Date().toISOString(),
      }
      db.products.unshift(doc)
      await saveDb()
      return NextResponse.json(doc)
    }

    if (method === 'PUT' && path.startsWith('products/')) {
      const id = path.split('/')[1]
      const idx = db.products.findIndex(p => p.id === id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const cur = db.products[idx]
      const updated = {
        ...cur,
        name: body.name ?? cur.name,
        title: body.title ?? cur.title,
        description: body.description ?? cur.description,
        price: body.price !== undefined ? Number(body.price) || 0 : cur.price,
        weight: body.weight ?? cur.weight,
        badge: body.badge ?? cur.badge,
        featured: body.featured !== undefined ? !!body.featured : cur.featured,
        images: Array.isArray(body.images) ? body.images.map(normalizeImageUrl).filter(Boolean) : cur.images,
      }
      db.products[idx] = updated
      await saveDb()
      return NextResponse.json(updated)
    }

    if (method === 'DELETE' && path.startsWith('products/')) {
      const id = path.split('/')[1]
      db.products = db.products.filter(p => p.id !== id)
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    // === Coupons CRUD ===
    if (method === 'POST' && path === 'coupons') {
      const code = (body.code || '').trim().toUpperCase()
      if (!code || !body.value) return NextResponse.json({ error: 'Code and value required' }, { status: 400 })
      if (db.coupons.find(c => c.code === code)) return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
      const doc = {
        id: uuidv4(),
        code,
        type: body.type === 'flat' ? 'flat' : 'percent',
        value: Number(body.value) || 0,
        minOrder: Number(body.minOrder) || 0,
        active: body.active !== false,
        createdAt: new Date().toISOString(),
      }
      db.coupons.unshift(doc)
      await saveDb()
      return NextResponse.json(doc)
    }
    if (method === 'PUT' && path.startsWith('coupons/')) {
      const id = path.split('/')[1]
      const idx = db.coupons.findIndex(c => c.id === id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const cur = db.coupons[idx]
      const updated = {
        ...cur,
        code: body.code !== undefined ? body.code.trim().toUpperCase() : cur.code,
        type: body.type !== undefined ? (body.type === 'flat' ? 'flat' : 'percent') : cur.type,
        value: body.value !== undefined ? Number(body.value) || 0 : cur.value,
        minOrder: body.minOrder !== undefined ? Number(body.minOrder) || 0 : cur.minOrder,
        active: body.active !== undefined ? !!body.active : cur.active,
      }
      db.coupons[idx] = updated
      await saveDb()
      return NextResponse.json(updated)
    }
    if (method === 'DELETE' && path.startsWith('coupons/')) {
      const id = path.split('/')[1]
      db.coupons = db.coupons.filter(c => c.id !== id)
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    // === Settings ===
    if (method === 'POST' && path === 'admin/settings') {
      if (body.password) db.settings.password = body.password
      if (body.whatsapp !== undefined) db.settings.whatsapp = String(body.whatsapp).replace(/\D/g, '')
      if (body.brand !== undefined) db.settings.brand = body.brand
      if (body.address !== undefined) db.settings.address = body.address
      if (body.email !== undefined) db.settings.email = body.email
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Not found', path, method }, { status: 404 })
  } catch (e) {
    console.error('API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler

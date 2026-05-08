import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

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
      badge: 'Bestseller', featured: true, createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Garlic Sev', title: 'Zesty Garlic Treat',
      description: 'Crunchy gram-flour sev infused with bold roasted garlic. The perfect chai companion with a punch of flavour.',
      price: 200, weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mslefe51_WhatsApp%20Image%202026-05-06%20at%2023.12.07.jpeg'],
      badge: 'Spicy', featured: true, createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Laung Sev', title: 'Aromatic Clove Punch',
      description: 'A traditional sev with a warming hint of clove and exotic spices. Slow-cooked and irresistibly aromatic.',
      price: 220, weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/ypejqw0k_WhatsApp%20Image%202026-05-07%20at%2000.14.41%20%282%29.jpeg'],
      badge: 'New', featured: true, createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Masala Papdi Pack', title: 'Family Sharing Pack',
      description: 'Our signature Masala Papdi in a handy share-pack. Perfect for tea-time, parties, and movie nights.',
      price: 160, weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/zu4kk6d3_WhatsApp%20Image%202026-05-06%20at%2023.12.07%20%282%29.jpeg'],
      badge: '', featured: false, createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Pepper Sticks', title: 'Fiery Black Pepper Crunch',
      description: 'Long, crispy sticks tossed with cracked black pepper and red chilli flakes. Smoky, fiery, dangerously addictive.',
      price: 190, weight: '250 gms',
      images: ['https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mpay0icf_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%286%29.jpeg'],
      badge: 'Hot', featured: true, createdAt: new Date().toISOString(),
    },
  ],
  coupons: [
    { id: uuidv4(), code: 'WELCOME10', type: 'percent', value: 10, minOrder: 300, active: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), code: 'FLAT50', type: 'flat', value: 50, minOrder: 500, active: true, createdAt: new Date().toISOString() },
  ],
  settings: {
    password: 'admin123', whatsapp: '916303520089', brand: 'SevMunchies',
    address: 'Hyderabad, India', email: 'orders@sevmunchies.in',
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
    cache.products ??= []
    cache.coupons ??= []
    cache.settings ??= { ...SEED.settings }
  } catch {
    cache = JSON.parse(JSON.stringify(SEED))
    await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2))
  }
  return cache
}

async function saveDb() {
  savePromise = savePromise.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2))
  })
  return savePromise
}

// Cloudinary upload via stream
async function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sevmunchies', resource_type: 'image', use_filename: true, unique_filename: true },
      (err, result) => err ? reject(err) : resolve(result)
    )
    stream.end(buffer)
  })
}

async function handler(request, { params }) {
  try {
    const db = await loadDb()
    const reqPath = (params?.path || []).join('/')
    const method = request.method

    // === Cloudinary upload (multipart) — handle BEFORE json parsing ===
    if (method === 'POST' && reqPath === 'admin/upload') {
      const adminPwd = request.headers.get('x-admin-password')
      if (!adminPwd || adminPwd !== db.settings.password) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 })
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadToCloudinary(buffer, file.name)
        return NextResponse.json({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        })
      } catch (e) {
        console.error('Cloudinary upload error:', e)
        return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
      }
    }

    // === Public reads ===
    if (method === 'GET' && reqPath === 'products') return NextResponse.json(db.products)
    if (method === 'GET' && reqPath === 'settings') {
      const s = db.settings
      return NextResponse.json({ whatsapp: s.whatsapp || '', brand: s.brand || 'SevMunchies', address: s.address || '', email: s.email || '' })
    }

    const body = method !== 'GET' ? await request.json().catch(() => ({})) : {}

    if (method === 'POST' && reqPath === 'admin/login') {
      if (body.password === db.settings.password) return NextResponse.json({ ok: true, token: 'sev-' + Date.now() })
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
    }

    if (method === 'POST' && reqPath === 'coupons/validate') {
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

    if (method === 'GET' && reqPath === 'coupons') {
      if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.json(db.coupons)
    }

    if (method !== 'GET' && !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // === Products CRUD ===
    if (method === 'POST' && reqPath === 'products') {
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled',
        title: body.title || '',
        description: body.description || '',
        price: Number(body.price) || 0,
        weight: body.weight || '',
        images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
        badge: body.badge || '',
        featured: !!body.featured,
        createdAt: new Date().toISOString(),
      }
      db.products.unshift(doc)
      await saveDb()
      return NextResponse.json(doc)
    }

    if (method === 'PUT' && reqPath.startsWith('products/')) {
      const id = reqPath.split('/')[1]
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
        images: Array.isArray(body.images) ? body.images.filter(Boolean) : cur.images,
      }
      db.products[idx] = updated
      await saveDb()
      return NextResponse.json(updated)
    }

    if (method === 'DELETE' && reqPath.startsWith('products/')) {
      const id = reqPath.split('/')[1]
      db.products = db.products.filter(p => p.id !== id)
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    // === Coupons CRUD ===
    if (method === 'POST' && reqPath === 'coupons') {
      const code = (body.code || '').trim().toUpperCase()
      if (!code || !body.value) return NextResponse.json({ error: 'Code and value required' }, { status: 400 })
      if (db.coupons.find(c => c.code === code)) return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
      const doc = {
        id: uuidv4(), code,
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
    if (method === 'PUT' && reqPath.startsWith('coupons/')) {
      const id = reqPath.split('/')[1]
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
    if (method === 'DELETE' && reqPath.startsWith('coupons/')) {
      const id = reqPath.split('/')[1]
      db.coupons = db.coupons.filter(c => c.id !== id)
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    // === Settings ===
    if (method === 'POST' && reqPath === 'admin/settings') {
      if (body.password) db.settings.password = body.password
      if (body.whatsapp !== undefined) db.settings.whatsapp = String(body.whatsapp).replace(/\D/g, '')
      if (body.brand !== undefined) db.settings.brand = body.brand
      if (body.address !== undefined) db.settings.address = body.address
      if (body.email !== undefined) db.settings.email = body.email
      await saveDb()
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Not found', path: reqPath, method }, { status: 404 })
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

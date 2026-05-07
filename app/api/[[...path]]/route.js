import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'sevmunchies'

let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL)
    await cachedClient.connect()
  }
  return cachedClient.db(DB_NAME)
}

const SEED_PRODUCTS = [
  {
    id: uuidv4(),
    name: 'Masala Papdi',
    title: 'Tangy & Crispy Delight',
    description: 'Hand-rolled crispy papdi tossed in a tangy blend of roasted spices. Gluten-free, no preservatives — just pure crunch.',
    price: 180,
    weight: '250 gms',
    image: 'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/vg2h435r_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%282%29.jpeg',
    badge: 'Bestseller',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Garlic Sev',
    title: 'Zesty Garlic Treat',
    description: 'Crunchy gram-flour sev infused with bold roasted garlic. The perfect chai companion with a punch of flavour.',
    price: 200,
    weight: '250 gms',
    image: 'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mslefe51_WhatsApp%20Image%202026-05-06%20at%2023.12.07.jpeg',
    badge: 'Spicy',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Laung Sev',
    title: 'Aromatic Clove Punch',
    description: 'A traditional sev with a warming hint of clove and exotic spices. Slow-cooked and irresistibly aromatic.',
    price: 220,
    weight: '250 gms',
    image: 'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/ypejqw0k_WhatsApp%20Image%202026-05-07%20at%2000.14.41%20%282%29.jpeg',
    badge: 'New',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Masala Papdi Pack',
    title: 'Family Sharing Pack',
    description: 'Our signature Masala Papdi in a handy share-pack. Perfect for tea-time, parties, and movie nights with the family.',
    price: 160,
    weight: '250 gms',
    image: 'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/zu4kk6d3_WhatsApp%20Image%202026-05-06%20at%2023.12.07%20%282%29.jpeg',
    badge: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Pepper Sticks',
    title: 'Fiery Black Pepper Crunch',
    description: 'Long, crispy sticks tossed with cracked black pepper and red chilli flakes. Smoky, fiery, dangerously addictive.',
    price: 190,
    weight: '250 gms',
    image: 'https://customer-assets.emergentagent.com/job_a68be4b4-6dd8-4c95-bffb-2ba39cff9c7a/artifacts/mpay0icf_WhatsApp%20Image%202026-05-06%20at%2023.04.57%20%286%29.jpeg',
    badge: 'Hot',
    createdAt: new Date().toISOString(),
  },
]

async function ensureSeed(db) {
  const count = await db.collection('products').countDocuments()
  if (count === 0) {
    await db.collection('products').insertMany(SEED_PRODUCTS)
  }
  const settings = await db.collection('settings').findOne({ key: 'admin' })
  if (!settings) {
    await db.collection('settings').insertOne({ key: 'admin', password: 'admin123', whatsapp: '916303520089', brand: 'SevMunchies' })
  }
}

function strip(o) { if (!o) return o; const { _id, ...rest } = o; return rest }

async function handler(request, { params }) {
  try {
    const db = await getDb()
    await ensureSeed(db)

    const path = (params?.path || []).join('/')
    const method = request.method

    // GET /api/products
    if (method === 'GET' && path === 'products') {
      const items = await db.collection('products').find({}).sort({ createdAt: -1 }).toArray()
      return NextResponse.json(items.map(strip))
    }

    // GET /api/settings (public part)
    if (method === 'GET' && path === 'settings') {
      const s = await db.collection('settings').findOne({ key: 'admin' })
      return NextResponse.json({ whatsapp: s?.whatsapp || '', brand: s?.brand || 'SevMunchies' })
    }

    const body = method !== 'GET' ? await request.json().catch(() => ({})) : {}

    // POST /api/admin/login
    if (method === 'POST' && path === 'admin/login') {
      const s = await db.collection('settings').findOne({ key: 'admin' })
      if (body.password === s?.password) {
        return NextResponse.json({ ok: true, token: 'sev-' + Date.now() })
      }
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
    }

    // Admin-protected mutations: simple password header check
    const adminPwd = request.headers.get('x-admin-password')
    const settings = await db.collection('settings').findOne({ key: 'admin' })
    const isAdmin = adminPwd && adminPwd === settings?.password

    if ((path.startsWith('admin/') || path === 'products' || path.startsWith('products/')) && method !== 'GET' && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // POST /api/products  — create
    if (method === 'POST' && path === 'products') {
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled',
        title: body.title || '',
        description: body.description || '',
        price: Number(body.price) || 0,
        weight: body.weight || '',
        image: body.image || '',
        badge: body.badge || '',
        createdAt: new Date().toISOString(),
      }
      await db.collection('products').insertOne(doc)
      return NextResponse.json(strip(doc))
    }

    // PUT /api/products/:id  — update
    if (method === 'PUT' && path.startsWith('products/')) {
      const id = path.split('/')[1]
      const update = {
        name: body.name,
        title: body.title,
        description: body.description,
        price: Number(body.price) || 0,
        weight: body.weight,
        image: body.image,
        badge: body.badge,
      }
      Object.keys(update).forEach(k => update[k] === undefined && delete update[k])
      await db.collection('products').updateOne({ id }, { $set: update })
      const updated = await db.collection('products').findOne({ id })
      return NextResponse.json(strip(updated))
    }

    // DELETE /api/products/:id
    if (method === 'DELETE' && path.startsWith('products/')) {
      const id = path.split('/')[1]
      await db.collection('products').deleteOne({ id })
      return NextResponse.json({ ok: true })
    }

    // POST /api/admin/settings  — change password / whatsapp / brand
    if (method === 'POST' && path === 'admin/settings') {
      const update = {}
      if (body.password) update.password = body.password
      if (body.whatsapp) update.whatsapp = body.whatsapp.replace(/\D/g, '')
      if (body.brand) update.brand = body.brand
      await db.collection('settings').updateOne({ key: 'admin' }, { $set: update })
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

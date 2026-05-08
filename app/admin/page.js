'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Lock, Plus, Pencil, Trash2, LogOut, Save, ArrowLeft, X, Star, ChevronUp, ChevronDown, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const emptyProduct = { name: '', title: '', description: '', price: '', weight: '250 gms', images: [], badge: '', featured: false }
const emptyCoupon = { code: '', type: 'percent', value: '', minOrder: '', active: true }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [adminPwd, setAdminPwd] = useState('')

  // products
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [open, setOpen] = useState(false)

  // coupons
  const [coupons, setCoupons] = useState([])
  const [couponForm, setCouponForm] = useState(emptyCoupon)
  const [couponEditing, setCouponEditing] = useState(null)
  const [couponOpen, setCouponOpen] = useState(false)

  // settings
  const [settings, setSettings] = useState({ password: '', whatsapp: '', brand: '', address: '', email: '' })

  useEffect(() => {
    const saved = localStorage.getItem('sev_admin_pwd')
    if (saved) { setAdminPwd(saved); setAuthed(true); loadAll(saved) }
  }, [])

  const loadAll = async (p) => {
    const [pr, st, co] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/coupons', { headers: { 'x-admin-password': p } }).then(r => r.json()),
    ])
    setProducts(pr || [])
    setSettings({ password: '', whatsapp: st.whatsapp || '', brand: st.brand || '', address: st.address || '', email: st.email || '' })
    setCoupons(Array.isArray(co) ? co : [])
  }

  const login = async () => {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) })
    if (!r.ok) { toast.error('Wrong password'); return }
    setAdminPwd(pwd); setAuthed(true); localStorage.setItem('sev_admin_pwd', pwd)
    loadAll(pwd)
    toast.success('Welcome, admin')
  }

  const logout = () => { setAuthed(false); setAdminPwd(''); localStorage.removeItem('sev_admin_pwd') }

  // === PRODUCTS ===
  const openNew = () => { setEditing(null); setForm(emptyProduct); setOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ ...emptyProduct, ...p, price: String(p.price), images: p.images || [] }); setOpen(true) }

  const saveProduct = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    const url = editing ? `/api/products/${editing.id}` : '/api/products'
    const method = editing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPwd }, body: JSON.stringify(form) })
    if (!r.ok) { toast.error('Save failed'); return }
    toast.success(editing ? 'Updated' : 'Added')
    setOpen(false); setForm(emptyProduct)
    loadAll(adminPwd)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPwd } })
    if (!r.ok) { toast.error('Delete failed'); return }
    toast.success('Deleted'); loadAll(adminPwd)
  }

  // multi-image handlers — Google Drive URL based
  const [newImageUrl, setNewImageUrl] = useState('')
  const addImageFromUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setForm(f => ({ ...f, images: [...f.images, url] }))
    setNewImageUrl('')
  }
  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const moveImage = (i, dir) => {
    setForm(f => {
      const arr = [...f.images]
      const ni = i + dir
      if (ni < 0 || ni >= arr.length) return f
      ;[arr[i], arr[ni]] = [arr[ni], arr[i]]
      return { ...f, images: arr }
    })
  }
  const setAsPrimary = (i) => {
    setForm(f => {
      const arr = [...f.images]
      const [it] = arr.splice(i, 1)
      arr.unshift(it)
      return { ...f, images: arr }
    })
  }

  // === COUPONS ===
  const openNewCoupon = () => { setCouponEditing(null); setCouponForm(emptyCoupon); setCouponOpen(true) }
  const openEditCoupon = (c) => { setCouponEditing(c); setCouponForm({ ...c, value: String(c.value), minOrder: String(c.minOrder || 0) }); setCouponOpen(true) }
  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.value) { toast.error('Code and value required'); return }
    const url = couponEditing ? `/api/coupons/${couponEditing.id}` : '/api/coupons'
    const method = couponEditing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPwd }, body: JSON.stringify(couponForm) })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { toast.error(d.error || 'Failed'); return }
    toast.success(couponEditing ? 'Updated' : 'Added')
    setCouponOpen(false); loadAll(adminPwd)
  }
  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPwd } })
    toast.success('Deleted'); loadAll(adminPwd)
  }
  const toggleCoupon = async (c) => {
    await fetch(`/api/coupons/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPwd }, body: JSON.stringify({ active: !c.active }) })
    loadAll(adminPwd)
  }

  // === SETTINGS ===
  const saveSettings = async () => {
    const body = {}
    if (settings.password) body.password = settings.password
    body.whatsapp = settings.whatsapp; body.brand = settings.brand; body.address = settings.address; body.email = settings.email
    const r = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPwd }, body: JSON.stringify(body) })
    if (!r.ok) { toast.error('Failed'); return }
    toast.success('Settings updated')
    if (settings.password) { setAdminPwd(settings.password); localStorage.setItem('sev_admin_pwd', settings.password) }
    setSettings(s => ({ ...s, password: '' }))
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <div className="w-14 h-14 rounded-full spice-gradient mx-auto flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-center font-display text-2xl">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Password</Label>
              <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Enter admin password" />
            </div>
            <Button onClick={login} className="w-full spice-gradient text-white border-0 h-11">Login</Button>
            <Link href="/" className="text-xs text-center text-muted-foreground hover:text-primary block">← Back to shop</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-card sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-primary"><ArrowLeft className="w-4 h-4" /></Link>
            <div className="font-display font-bold text-xl">Admin Panel</div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
        </div>
      </nav>

      <div className="container py-8">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="coupons">Coupons ({coupons.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-2xl font-bold">Manage Products</h2>
              <Button onClick={openNew} className="spice-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-video bg-secondary relative">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    {(p.images?.length || 0) > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {p.images.length} pics
                      </div>
                    )}
                    {p.featured && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">Featured</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <div className="font-display font-bold text-lg">{p.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{p.title}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">₹{p.price}</span>
                      <span className="text-xs text-muted-foreground">{p.weight}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1"><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => deleteProduct(p.id)} className="flex-1 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* COUPONS TAB */}
          <TabsContent value="coupons">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-2xl font-bold">Discount Coupons</h2>
              <Button onClick={openNewCoupon} className="spice-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" /> Add Coupon</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No coupons yet. Create one!</div>}
              {coupons.map(c => (
                <Card key={c.id} className={c.active ? '' : 'opacity-60'}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="font-mono font-bold text-lg">{c.code}</span>
                      </div>
                      <Badge variant={c.active ? 'default' : 'secondary'} className={c.active ? 'spice-gradient text-white border-0' : ''}>
                        {c.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold gold-text mb-1">
                      {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">Min order ₹{c.minOrder || 0}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleCoupon(c)} className="flex-1">
                        {c.active ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                        {c.active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditCoupon(c)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCoupon(c.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <Card className="max-w-xl">
              <CardHeader><CardTitle>Store Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Brand Name</Label><Input value={settings.brand} onChange={e => setSettings(s => ({ ...s, brand: e.target.value }))} /></div>
                <div><Label>WhatsApp Number (with country code, no +)</Label><Input value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} placeholder="916303520089" /></div>
                <div><Label>Contact Address</Label><Textarea value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} rows={2} /></div>
                <div><Label>Contact Email</Label><Input value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} /></div>
                <div><Label>New Admin Password (leave blank to keep)</Label><Input type="password" value={settings.password} onChange={e => setSettings(s => ({ ...s, password: e.target.value }))} placeholder="••••••••" /></div>
                <Button onClick={saveSettings} className="spice-gradient text-white border-0"><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* PRODUCT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masala Papdi" /></div>
              <div><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="180" /></div>
            </div>
            <div><Label>Tagline</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tangy & Crispy Delight" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Weight</Label><Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} /></div>
              <div><Label>Badge (optional)</Label><Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Bestseller / New / Hot" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>

            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} id="featured" />
              <Label htmlFor="featured" className="cursor-pointer">Featured (show in hero carousel)</Label>
            </div>

            {/* IMAGE GALLERY MANAGER (Google Drive URLs) */}
            <div>
              <Label>Images ({form.images.length})</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageFromUrl() } }}
                  placeholder="Paste Google Drive share link or any image URL"
                />
                <Button type="button" variant="outline" onClick={addImageFromUrl}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                <strong>Tip:</strong> Upload your image to Google Drive → right-click → <em>Share</em> → set access to <em>"Anyone with the link"</em> → copy the share link and paste it above. We'll auto-convert it to a direct image URL.
              </div>
              {form.images.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground mt-2">No images yet.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {form.images.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-md overflow-hidden border bg-secondary">
                      <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.3' }} />
                      {i === 0 && <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Primary</div>}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1">
                        <div className="flex justify-end">
                          <Button type="button" size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeImage(i)}><X className="w-3 h-3" /></Button>
                        </div>
                        <div className="flex justify-between gap-1">
                          {i > 0 && (
                            <>
                              <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => setAsPrimary(i)} title="Set as primary"><Star className="w-3 h-3" /></Button>
                              <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => moveImage(i, -1)}><ChevronUp className="w-3 h-3" /></Button>
                            </>
                          )}
                          {i < form.images.length - 1 && <Button type="button" size="icon" variant="secondary" className="h-6 w-6 ml-auto" onClick={() => moveImage(i, 1)}><ChevronDown className="w-3 h-3" /></Button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-2">First image is the primary thumbnail. Hover any image to reorder, set primary, or remove.</p>
            </div>

            <Button onClick={saveProduct} className="w-full spice-gradient text-white border-0 h-11">
              <Save className="w-4 h-4 mr-2" /> {editing ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* COUPON DIALOG */}
      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{couponEditing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Code *</Label><Input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="WELCOME10" className="font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={couponForm.type} onValueChange={v => setCouponForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value *</Label><Input type="number" value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))} placeholder={couponForm.type === 'percent' ? '10' : '50'} /></div>
            </div>
            <div><Label>Minimum Order (₹)</Label><Input type="number" value={couponForm.minOrder} onChange={e => setCouponForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="300" /></div>
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <Switch checked={couponForm.active} onCheckedChange={v => setCouponForm(f => ({ ...f, active: v }))} id="active" />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
            <Button onClick={saveCoupon} className="w-full spice-gradient text-white border-0 h-11"><Save className="w-4 h-4 mr-2" /> {couponEditing ? 'Update' : 'Add'} Coupon</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

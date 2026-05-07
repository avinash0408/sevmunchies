'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Lock, Plus, Pencil, Trash2, LogOut, Save, Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const empty = { name: '', title: '', description: '', price: '', weight: '250 gms', image: '', badge: '' }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [adminPwd, setAdminPwd] = useState('')
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState({ password: '', whatsapp: '', brand: '' })

  useEffect(() => {
    const saved = localStorage.getItem('sev_admin_pwd')
    if (saved) { setAdminPwd(saved); setAuthed(true); loadProducts(); loadSettings(saved) }
  }, [])

  const loadProducts = async () => {
    const r = await fetch('/api/products')
    setProducts(await r.json())
  }
  const loadSettings = async (p) => {
    const r = await fetch('/api/settings')
    const d = await r.json()
    setSettings({ password: '', whatsapp: d.whatsapp || '', brand: d.brand || '' })
  }

  const login = async () => {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) })
    if (!r.ok) { toast.error('Wrong password'); return }
    setAdminPwd(pwd); setAuthed(true); localStorage.setItem('sev_admin_pwd', pwd)
    loadProducts(); loadSettings(pwd)
    toast.success('Welcome, admin')
  }

  const logout = () => {
    setAuthed(false); setAdminPwd(''); localStorage.removeItem('sev_admin_pwd')
  }

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ ...p, price: String(p.price) }); setOpen(true) }

  const saveProduct = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    const url = editing ? `/api/products/${editing.id}` : '/api/products'
    const method = editing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPwd }, body: JSON.stringify(form) })
    if (!r.ok) { toast.error('Save failed'); return }
    toast.success(editing ? 'Updated' : 'Added')
    setOpen(false); setForm(empty); loadProducts()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPwd } })
    if (!r.ok) { toast.error('Delete failed'); return }
    toast.success('Deleted'); loadProducts()
  }

  const onImagePick = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const saveSettings = async () => {
    const body = {}
    if (settings.password) body.password = settings.password
    if (settings.whatsapp) body.whatsapp = settings.whatsapp
    if (settings.brand) body.brand = settings.brand
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-2xl font-bold">Manage Products</h2>
              <Button onClick={openNew} className="spice-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-video bg-secondary">
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
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

          <TabsContent value="settings">
            <Card className="max-w-xl">
              <CardHeader><CardTitle>Store Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Name</Label>
                  <Input value={settings.brand} onChange={e => setSettings(s => ({ ...s, brand: e.target.value }))} />
                </div>
                <div>
                  <Label>WhatsApp Number (with country code, no +)</Label>
                  <Input value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} placeholder="916303520089" />
                </div>
                <div>
                  <Label>New Admin Password (leave blank to keep current)</Label>
                  <Input type="password" value={settings.password} onChange={e => setSettings(s => ({ ...s, password: e.target.value }))} placeholder="••••••••" />
                </div>
                <Button onClick={saveSettings} className="spice-gradient text-white border-0"><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masala Papdi" />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="180" />
              </div>
            </div>
            <div>
              <Label>Tagline / Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tangy & Crispy Delight" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Weight</Label>
                <Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="250 gms" />
              </div>
              <div>
                <Label>Badge (optional)</Label>
                <Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Bestseller / New / Hot" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Image</Label>
              <div className="flex gap-2">
                <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Paste URL or upload" />
                <Button asChild variant="outline" size="icon">
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={onImagePick} className="hidden" />
                  </label>
                </Button>
              </div>
              {form.image && <img src={form.image} alt="preview" className="w-32 h-32 object-cover rounded-md mt-2 border" />}
            </div>
            <Button onClick={saveProduct} className="w-full spice-gradient text-white border-0 h-11">
              <Save className="w-4 h-4 mr-2" /> {editing ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

export default function CheckoutDialog({
  open,
  onOpenChange,
  name,
  setName,
  phone,
  setPhone,
  street1,
  setStreet1,
  street2,
  setStreet2,
  city,
  setCity,
  pincode,
  setPincode,
  state,
  setState,
  notes,
  setNotes,
  cartCount,
  cartSubtotal,
  discount,
  appliedCoupon,
  cartTotal,
  placeOrder,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl" style={{ color: '#1E2D5A' }}>Place Your Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label htmlFor="n">Full Name *</Label><Input id="n" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></div>
          <div><Label htmlFor="p">Phone *</Label><Input id="p" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" /></div>
          <div>
            <Label>Delivery Address *</Label>
            <div className="space-y-3 mt-1.5">
              <Input placeholder="House No / Street *" value={street1} onChange={e => setStreet1(e.target.value)} />
              <Input placeholder="Area / Landmark" value={street2} onChange={e => setStreet2(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City *" value={city} onChange={e => setCity(e.target.value)} />
                <Input
                  placeholder="Pincode *"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select State *</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><Label htmlFor="nt">Notes (optional)</Label><Input id="nt" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions" /></div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Items</span><span>{cartCount}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
            {discount > 0 && appliedCoupon && (
              <div className="flex justify-between text-green-700"><span>Coupon ({appliedCoupon.code})</span><span>−₹{discount}</span></div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span>₹{cartTotal}</span></div>
          </div>
          <Button onClick={placeOrder} className="w-full wa-gradient text-white border-0 h-12 rounded-full">
            <MessageCircle className="w-5 h-5 mr-2" /> Send Order on WhatsApp
          </Button>
          <p className="text-xs text-muted-foreground text-center">You'll be redirected to WhatsApp to confirm.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

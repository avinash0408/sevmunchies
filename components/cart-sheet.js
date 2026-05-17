'use client'

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cldUrl } from '@/lib/cloudinary'

export default function CartSheet({
  open,
  onOpenChange,
  trigger,
  cartItems,
  onAdd,
  onDec,
  onRemove,
  footer = null,
  title = 'Your Cart',
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl" style={{ color: '#1E2D5A' }}>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
              <p className="text-xs mt-1">Add some crunchy goodness!</p>
            </div>
          ) : cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-muted/40 rounded-lg">
              <img src={cldUrl((item.images && item.images[0]) || item.image, 220)} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">₹{item.price} • {item.weight}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onDec(item.id)}><Minus className="w-3 h-3" /></Button>
                  <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onAdd(item)}><Plus className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={() => onRemove(item.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="font-bold text-sm">₹{item.price * item.qty}</div>
            </div>
          ))}
        </div>
        {footer}
      </SheetContent>
    </Sheet>
  )
}

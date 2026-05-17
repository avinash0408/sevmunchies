'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

export default function CartButton({ count = 0, onClick }) {
  return (
    <Button onClick={onClick} className="relative bg-[#C9A84C] hover:bg-[#E8C97A] text-[#0F172A] font-semibold border-0 shadow-md flex items-center gap-2 px-5 h-10 rounded-full transition-all">
      <ShoppingCart className="w-4 h-4" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-white text-[#C9A84C] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
          {count}
        </span>
      )}
    </Button>
  )
}

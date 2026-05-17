'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { cldUrl } from '@/lib/cloudinary'

export default function ShopSection({
  loading,
  filtered,
  search,
  setSearch,
  onOpenProduct,
  onAddToCart,
}) {
  return (
    <section id="shop" className="cream-bg">
      <div className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10">Bestsellers</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: '#1E2D5A' }}>Our Signature <span className="orange-text">Snacks</span></h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Hand-crafted in small batches for unmatched freshness and crunch.</p>
          <div className="relative max-w-sm mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snacks…" className="pl-9 bg-card border-secondary/20 rounded-full" />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No snacks match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map(p => {
              const img = cldUrl((p.images && p.images[0]) || p.image, 600)
              const hasMultiple = (p.images?.length || 0) > 1
              return (
                <Card
                  key={p.id}
                  className="snack-card overflow-hidden border-border/60 bg-card cursor-pointer group rounded-2xl"
                  onClick={() => onOpenProduct(p)}
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/5">
                    <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.badge && <Badge className="absolute top-3 left-3 orange-gradient text-white border-0 shadow">{p.badge}</Badge>}
                    {hasMultiple && (
                      <div className="absolute top-3 right-3 bg-secondary/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        +{p.images.length - 1}
                      </div>
                    )}
                    <Button
                      size="icon"
                      className="absolute bottom-3 right-3 orange-gradient text-white border-0 shadow-lg opacity-0 group-hover:opacity-100 transition rounded-full"
                      onClick={e => {
                        e.stopPropagation()
                        onAddToCart(p)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="font-display font-bold text-lg leading-tight" style={{ color: '#1E2D5A' }}>{p.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{p.title}</div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="font-bold text-xl" style={{ color: '#1E2D5A' }}>₹{p.price}</span>
                        {p.weight && <span className="text-xs text-muted-foreground ml-2">{p.weight}</span>}
                      </div>
                      <Button
                        size="sm"
                        className="orange-gradient text-white border-0 rounded-full"
                        onClick={e => {
                          e.stopPropagation()
                          onAddToCart(p)
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

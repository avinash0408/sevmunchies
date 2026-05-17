'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles, Star } from 'lucide-react'
import { cldUrl } from '@/lib/cloudinary'

export default function HeroSection({
  featured,
  heroIdx,
  setHeroIdx,
  onExploreProducts,
  onWhatsAppOrder,
  onOpenProduct,
}) {
  return (
    <section className="relative navy-gradient navy-pattern overflow-hidden">
      <div className="container py-12 md:py-20 lg:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center relative">
        <div className="text-white">
          <Badge className="mb-5 bg-white/10 border border-accent/40 text-accent hover:bg-white/10 px-4 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 mr-1.5" /> Premium Indian Namkeen
          </Badge>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5 text-white">
            Authentic<br />
            <span className="gold-text">Crunchy Taste</span><br />
            Delivered Fresh
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-xl mb-8">
            Traditional flavors crafted with premium quality ingredients and an unforgettable crunch in every bite.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="orange-gradient text-white border-0 h-12 px-7 text-base shadow-xl hover:opacity-90 rounded-full"
              onClick={onExploreProducts}
            >
              Explore Products →
            </Button>

            <Button
              size="lg"
              className="wa-gradient text-white border-0 h-12 px-7 text-base shadow-xl hover:opacity-90 rounded-full"
              onClick={onWhatsAppOrder}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Order on WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 max-w-md">
            {[
              { n: '10K+', t: 'Happy Customers' },
              { n: '50+', t: 'Years of Recipe' },
              { n: '100%', t: 'Natural' },
            ].map(({ n, t }, i) => (
              <div key={i}>
                <div className="font-display text-3xl md:text-4xl font-bold gold-text">{n}</div>
                <div className="text-xs text-white/70 mt-1">{t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full h-full min-h-[420px] md:min-h-[600px] lg:min-h-[700px]">
          {featured.length > 0 && (
            <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl ring-4 ring-accent/20">
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{
                    opacity: i === heroIdx ? 1 : 0,
                    pointerEvents: i === heroIdx ? 'auto' : 'none',
                  }}
                >
                  <img
                    src={cldUrl((p.images && p.images[0]) || p.image, 1000)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                    {p.badge && (
                      <Badge className="mb-2 orange-gradient text-white border-0">
                        {p.badge}
                      </Badge>
                    )}

                    <div className="font-display text-2xl sm:text-3xl font-bold">
                      {p.name}
                    </div>

                    <div className="text-sm opacity-90 mb-2">
                      {p.title}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold gold-text">
                        ₹{p.price}
                      </div>

                      <Button
                        size="sm"
                        className="orange-gradient text-white border-0 rounded-full px-4"
                        onClick={() => onOpenProduct(p)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {featured.length > 1 && (
                <>
                  <Button
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 bg-white text-secondary hover:bg-white/90"
                    onClick={() =>
                      setHeroIdx(i => (i - 1 + featured.length) % featured.length)
                    }
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-10 w-10 bg-white text-secondary hover:bg-white/90"
                    onClick={() =>
                      setHeroIdx(i => (i + 1) % featured.length)
                    }
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-2">
                    {featured.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === heroIdx ? 'w-8 bg-accent' : 'w-2 bg-white/30'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 items-center gap-3 border-2 border-accent/30 hidden sm:flex">
            <div className="w-10 h-10 rounded-full orange-gradient flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold" style={{ color: '#1E2D5A' }}>
                4.9 / 5
              </div>
              <div className="text-[11px] text-muted-foreground">
                From 2,400+ reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

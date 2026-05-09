'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, MessageCircle, Mail, MapPin, ArrowLeft, Leaf, Award, Truck, Heart } from 'lucide-react'
import Link from 'next/link'

const BRAND_LOGO = 'https://res.cloudinary.com/dprlv7yng/image/upload/c_crop,g_north,w_220,h_220,y_30/c_fill,w_200,h_200,f_auto,q_auto/v1778306538/sevmunchies/file_in5vdw.png'

export default function AboutPage() {
  const [s, setS] = useState({ brand: 'Famous Namkeen', whatsapp: '916303520089', email: '', address: '' })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setS(prev => ({ ...prev, ...d })))
  }, [])

  return (
    <div className="min-h-screen cream-bg">
      <div className="gold-strip"></div>

      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FFF8EE]/95 border-b border-border/60">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-accent/30 shadow-md">
              <img src={BRAND_LOGO} alt={s.brand} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-lg sm:text-xl leading-tight" style={{ color: '#1c3380' }}>
                <span className="orange-text">{s.brand.split(' ')[0]}</span>{s.brand.split(' ').slice(1).join(' ') ? ' ' + s.brand.split(' ').slice(1).join(' ') : ''}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase">Premium Indian Snacks</div>
            </div>
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary flex items-center gap-1" style={{ color: '#1c3380' }}>
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </Link>
        </div>
      </nav>

      {/* HERO — navy */}
      <section className="navy-gradient navy-pattern relative">
        <div className="container py-14 md:py-24 text-center relative">
          <Badge className="mb-4 bg-white/10 text-accent border-accent/40 hover:bg-white/10 px-4 py-1.5 rounded-full">
            <Heart className="w-3 h-3 mr-1.5" /> Our Story
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-5 leading-tight text-white">
            Made with <span className="gold-text">love</span>,<br />served with pride.
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {s.brand} is a small-batch namkeen kitchen rooted in tradition. We craft every snack the way our grandmothers did — slowly, carefully, and with a generous handful of love.
          </p>
        </div>
      </section>

      <div className="gold-strip"></div>

      {/* STORY */}
      <section className="warm-bg py-16 md:py-24">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: '#1c3380' }}>From our kitchen<br />to your <span className="orange-text">tea-table.</span></h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
              It all started in a tiny home kitchen, with a single recipe handed down across four generations. Today, {s.brand} brings those same heritage flavours to thousands of snack lovers — without ever cutting corners.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              No machines. No preservatives. No artificial colours. Just pure ingredients, slow-roasted spices, and the unhurried care of a kitchen that still believes in doing things the old way.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, title: 'Hand-crafted', text: 'Every batch rolled and fried by hand.' },
              { icon: Leaf, title: 'No chemicals', text: 'Pure ingredients, nothing artificial.' },
              { icon: Truck, title: 'Fresh delivery', text: 'Made-to-order, packed fresh.' },
              { icon: Heart, title: 'Family recipes', text: 'Heirloom recipes, four generations old.' },
            ].map(({ icon: I, title, text }, i) => (
              <Card key={i} className="border-secondary/10 bg-white">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full orange-gradient flex items-center justify-center text-white mb-3"><I className="w-5 h-5" /></div>
                  <div className="font-display font-bold text-lg" style={{ color: '#1c3380' }}>{title}</div>
                  <div className="text-sm text-muted-foreground">{text}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — navy */}
      <section className="navy-gradient navy-pattern relative">
        <div className="container py-16 md:py-20 relative">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-white/10 text-accent border-accent/40 hover:bg-white/10">Get in Touch</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">We'd love to <span className="gold-text">hear from you</span></h2>
            <p className="text-white/80 mt-3 max-w-xl mx-auto">Question, bulk order, or just want to chat about snacks? Drop us a line.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer">
              <Card className="snack-card cursor-pointer bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full wa-gradient mx-auto flex items-center justify-center mb-3"><MessageCircle className="w-7 h-7 text-white" /></div>
                  <div className="font-display font-bold text-lg text-white">WhatsApp</div>
                  <div className="text-sm text-white/80 break-all">+{s.whatsapp}</div>
                </CardContent>
              </Card>
            </a>

            {s.email && (
              <a href={`mailto:${s.email}`}>
                <Card className="snack-card cursor-pointer bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full orange-gradient mx-auto flex items-center justify-center mb-3"><Mail className="w-7 h-7 text-white" /></div>
                    <div className="font-display font-bold text-lg text-white">Email</div>
                    <div className="text-sm text-white/80 break-all">{s.email}</div>
                  </CardContent>
                </Card>
              </a>
            )}

            {s.address && (
              <Card className="snack-card bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full gold-gradient mx-auto flex items-center justify-center mb-3"><MapPin className="w-7 h-7" style={{ color: '#1c3380' }} /></div>
                  <div className="font-display font-bold text-lg text-white">Visit Us</div>
                  <div className="text-sm text-white/80 whitespace-pre-line">{s.address}</div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" className="wa-gradient text-white border-0 h-12 px-8 rounded-full shadow-2xl" onClick={() => window.open(`https://wa.me/${s.whatsapp}`, '_blank')}>
              <MessageCircle className="w-5 h-5 mr-2" /> Chat with us on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <div className="gold-strip"></div>

      <footer className="cream-bg border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">© {new Date().getFullYear()} <span className="font-semibold" style={{ color: '#1c3380' }}>{s.brand}</span>. Crafted with love.</div>
      </footer>
    </div>
  )
}

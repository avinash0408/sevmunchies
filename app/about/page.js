'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, MessageCircle, Mail, MapPin, ArrowLeft, Leaf, Award, Truck, Heart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const [s, setS] = useState({ brand: 'SevMunchies', whatsapp: '916303520089', email: '', address: '' })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setS(prev => ({ ...prev, ...d })))
  }, [])

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full spice-gradient flex items-center justify-center text-white shadow-lg"><Sparkles className="w-5 h-5" /></div>
            <div>
              <div className="font-display font-bold text-lg sm:text-xl leading-none">{s.brand}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase">Crispy • Tangy • Authentic</div>
            </div>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="container py-12 md:py-20 text-center">
        <Badge variant="secondary" className="mb-3"><Heart className="w-3 h-3 mr-1" /> Our Story</Badge>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-5 leading-tight">
          Made with <span className="gold-text">love</span>,<br />served with pride.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {s.brand} is a small-batch namkeen kitchen rooted in tradition. We craft every snack the way our grandmothers did — slowly, carefully, and with a generous handful of love.
        </p>
      </section>

      {/* STORY */}
      <section className="warm-gradient py-16 md:py-24">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">From our kitchen<br />to your tea-table.</h2>
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
              <Card key={i} className="border-border/60">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full spice-gradient flex items-center justify-center text-white mb-3"><I className="w-5 h-5" /></div>
                  <div className="font-display font-bold text-lg">{title}</div>
                  <div className="text-sm text-muted-foreground">{text}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="container py-16 md:py-20">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Get in Touch</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold">We'd love to <span className="gold-text">hear from you</span></h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Question, bulk order, or just want to chat about snacks? Drop us a line.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer">
            <Card className="snack-card cursor-pointer hover:border-primary transition">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-3"><MessageCircle className="w-7 h-7 text-green-600" /></div>
                <div className="font-display font-bold text-lg">WhatsApp</div>
                <div className="text-sm text-muted-foreground break-all">+{s.whatsapp}</div>
              </CardContent>
            </Card>
          </a>

          {s.email && (
            <a href={`mailto:${s.email}`}>
              <Card className="snack-card cursor-pointer hover:border-primary transition">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/20 mx-auto flex items-center justify-center mb-3"><Mail className="w-7 h-7 text-primary" /></div>
                  <div className="font-display font-bold text-lg">Email</div>
                  <div className="text-sm text-muted-foreground break-all">{s.email}</div>
                </CardContent>
              </Card>
            </a>
          )}

          {s.address && (
            <Card className="snack-card">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3"><MapPin className="w-7 h-7 text-primary" /></div>
                <div className="font-display font-bold text-lg">Visit Us</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{s.address}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" className="spice-gradient text-white border-0 h-12 px-8" onClick={() => window.open(`https://wa.me/${s.whatsapp}`, '_blank')}>
            <MessageCircle className="w-5 h-5 mr-2" /> Chat with us on WhatsApp
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">© {new Date().getFullYear()} {s.brand}. Crafted with love.</div>
      </footer>
    </div>
  )
}

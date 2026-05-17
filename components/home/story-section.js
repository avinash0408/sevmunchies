'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cldUrlClean } from '@/lib/cloudinary'

export default function StorySection({ brand, products }) {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/about_section.png')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#f6efe6]/95 via-[#f6efe6]/85 to-[#f6efe6]/40" />

      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/40 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] left-[200px] w-[500px] h-[500px] bg-amber-300/20 blur-[140px] rounded-full" />

      <div className="container relative grid md:grid-cols-2 gap-10 items-center">
        <div className="backdrop-blur-[2px]">
          <Badge className="mb-3 bg-white/60 text-[#1E2D5A] border-white/40">
            Our Story
          </Badge>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-[#1E2D5A]">
            From the heart of <span className="text-amber-600">Ratlam</span>
          </h2>

          <p className="text-[#3c4b68] text-base md:text-lg leading-relaxed max-w-xl">
            What began as a small family kitchen in the spice-laden lanes of Ratlam is now a beloved name in households across India. Every packet of {brand} carries the warmth of a tradition kept alive — one crunchy bite at a time.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10">
            <div>
              <div className="font-display text-4xl font-bold text-[#1E2D5A]">15+</div>
              <div className="text-sm text-[#6b7a99]">Heritage recipes</div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-[#1E2D5A]">100%</div>
              <div className="text-sm text-[#6b7a99]">Natural</div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-[#1E2D5A]">10k+</div>
              <div className="text-sm text-[#6b7a99]">Customers</div>
            </div>
          </div>

          <Link href="/about">
            <button className="mt-8 px-7 py-3 rounded-full text-white font-medium shadow-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-105 hover:shadow-2xl transition-all">
              Read our story →
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {products.slice(0, 4).map(p => (
            <div
              key={p.id}
              className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-500"
            >
              <Image
                src={cldUrlClean((p.images && p.images[0]) || p.image, 400)}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/0 to-white/30" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

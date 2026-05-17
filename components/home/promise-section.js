'use client'

import { Award, Leaf, Sparkles, Truck } from 'lucide-react'

export default function PromiseSection() {
  return (
    <section className="relative overflow-hidden bg-[#db7906]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0)_33%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.14),transparent_46%)]" />
      <div className="container py-14 md:py-20">
        <div className="text-center mb-12 relative">
          <span className="inline-block mb-3 px-4 py-1 rounded-full text-sm font-semibold bg-white/70 text-[#111F67] border border-white/60 shadow-sm backdrop-blur-sm">
            The Famous Promise
          </span>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#111F67]">
            Why Choose <span className="text-[#F8F4EA]">Us</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {[
            { icon: Award, title: 'Authentic Taste', text: 'Heritage recipes from generations of mastery.' },
            { icon: Sparkles, title: 'Freshly Prepared', text: 'Every batch made fresh and packed at peak crunch.' },
            { icon: Leaf, title: 'Premium Ingredients', text: 'Hand-picked spices and finest gram flour.' },
            { icon: Truck, title: 'No Preservatives', text: 'Pure flavor — nothing artificial, ever.' },
          ].map(({ icon: I, title, text }, i) => (
            <div
              key={i}
              className="glass-surface rounded-2xl p-6 hover:scale-[1.03] hover:shadow-2xl transition duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[linear-gradient(145deg,#0e2a7b_0%,#1d3f9f_100%)] shadow-md flex items-center justify-center mb-4">
                <I className="w-6 h-6 text-[#E8C97A]" />
              </div>

              <h3 className="font-display text-lg font-bold text-[#111F67] mb-1">
                {title}
              </h3>

              <p className="text-sm text-[#363639]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

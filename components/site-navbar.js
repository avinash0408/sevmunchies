'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function SiteNavbar({ brand, cartButton, showShopLink = true }) {
  return (
    <nav className="sticky top-0 z-50 navy-gradient navy-pattern">
      <div className="container flex items-center justify-between h-16 sm:h-20">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/logo.png"
            alt={brand}
            width={180}
            height={80}
            priority
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
          <div className="font-display font-bold text-lg sm:text-xl md:text-2xl leading-none tracking-wide gold-text uppercase whitespace-nowrap">
            {brand}
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {showShopLink && (
            <Link href="/#shop" className="hidden md:inline text-sm font-medium text-[#E8C97A]/80 hover:text-white transition">
              Shop
            </Link>
          )}
          <Link href="/about" className="hidden md:inline text-sm font-medium text-[#E8C97A]/80 hover:text-white transition">
            About
          </Link>
          {cartButton}
        </div>
      </div>
    </nav>
  )
}

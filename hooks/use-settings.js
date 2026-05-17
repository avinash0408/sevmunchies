'use client'

import { useEffect, useState } from 'react'

const DEFAULT_SETTINGS = {
  brand: 'Famous Namkeen',
  whatsapp: '916303520089',
  address: '',
  email: '',
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings((prev) => ({ ...prev, ...(data || {}) }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { settings, setSettings, loading, refresh }
}

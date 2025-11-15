'use client'

import { useEffect } from 'react'

/**
 * Dev-only helper that removes client-only attributes added by browser extensions
 * (e.g., cz-shortcut-listen) from the body so SSR/CSR hydration doesn't warn.
 * This runs only in development to avoid removing any production attributes.
 */
export default function DevBodyCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    try {
      const body = document.body
      if (!body) return
      const toRemove: string[] = []
      for (let i = 0; i < body.attributes.length; i++) {
        const name = body.attributes[i].name
        // remove extension-specific attributes that typically start with cz- or similar patterns
        if (name.startsWith('cz-') || name.startsWith('extension-') || name.includes('shortcut') || name.includes('listen')) {
          toRemove.push(name)
        }
      }
      for (const attr of toRemove) body.removeAttribute(attr)
    } catch (err) {
      // don't crash the app in dev; log for debugging
      console.warn('[DevBodyCleanup] failed to clean body attributes', err)
    }
  }, [])
  return null
}

"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Locale = 'pt-BR' | 'en'
type LanguageContextProps = {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export default function LanguageProvider({ children, defaultLocale = 'pt-BR' }: { children: React.ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleInternal] = useState<Locale>(defaultLocale)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('locale') as Locale | null
      if (stored) setLocaleInternal(stored)
    } catch (e) {
      // ignore storage access on server or restricted contexts
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale)
      document.documentElement.lang = locale
    } catch (e) {
      // ignore storage access on server or restricted contexts
    }
  }, [locale])

  const setLocale = (loc: Locale) => setLocaleInternal(loc)
  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextProps {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}

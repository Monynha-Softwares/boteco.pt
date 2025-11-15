"use client"

import React, { createContext, useContext, useState } from 'react'

type Locale = 'pt-BR' | 'en'
type LanguageContextProps = {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export default function LanguageProvider({ children, defaultLocale = 'pt-BR' }: { children: React.ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleInternal] = useState<Locale>(defaultLocale)
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

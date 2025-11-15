"use client"

import React from 'react'
import { useLanguage } from './LanguageProvider'

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`inline-flex rounded-md border bg-transparent ${className}`} role="group" aria-label="Language switcher">
      <button
        data-active={locale === 'pt-BR' ? 'true' : 'false'}
        className={`px-2 py-1 text-sm ${locale === 'pt-BR' ? 'font-medium' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        PT
      </button>
      <button
        data-active={locale === 'en' ? 'true' : 'false'}
        className={`px-2 py-1 text-sm ${locale === 'en' ? 'font-medium' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  )
}

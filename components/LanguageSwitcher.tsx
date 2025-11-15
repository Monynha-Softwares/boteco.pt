"use client"

import React from 'react'
import { useLanguage } from './LanguageProvider'

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`inline-flex items-center rounded-md border bg-transparent ${className}`} role="group" aria-label="Language switcher">
      <button
        aria-pressed={locale === 'pt-BR'}
        aria-label="Português"
        data-active={locale === 'pt-BR' ? 'true' : 'false'}
        className={`px-3 py-1 text-sm leading-5 focus:outline-none ${locale === 'pt-BR' ? 'font-semibold bg-accent/10' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
        title="Português"
      >
        PT
      </button>
      <button
        aria-pressed={locale === 'en'}
        aria-label="English"
        data-active={locale === 'en' ? 'true' : 'false'}
        className={`px-3 py-1 text-sm leading-5 focus:outline-none ${locale === 'en' ? 'font-semibold bg-accent/10' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
        title="English"
      >
        EN
      </button>
    </div>
  )
}

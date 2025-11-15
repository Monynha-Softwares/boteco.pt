"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useLanguage } from '@/components/LanguageProvider'
import enMessages from '../../../locales/en.json'
import ptMessages from '../../../locales/pt-BR.json'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(1, 'Message is required'),
});

export default function ContactPage() {
  const { locale } = useLanguage()
  const messages = locale === 'pt-BR' ? ptMessages : enMessages
  const createLead = useMutation(api.leads.create)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const result = schema.safeParse(form)
    if (!result.success) {
      const err: Record<string,string> = {}
      for (const issue of result.error.issues) {
        err[issue.path[0] as string] = issue.message
      }
      setErrors(err)
      return
    }
    setStatus('sending')
    try {
      await createLead(form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{messages.nav.contact}</h1>
      <form onSubmit={onSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium">{messages.contact.name}</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{messages.contact.email}</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{messages.contact.message}</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 h-28" />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>
        <div>
          <button data-testid="contact-submit" type="submit" className="rounded-md bg-accent px-4 py-2 text-white" disabled={status === 'sending'}>{status === 'sending' ? (messages.labels?.send ?? 'Sending...') : (messages.contact?.send ?? 'Send')}</button>
          {status === 'success' && <span data-testid="contact-success" className="ml-2 text-green-600">{messages.contact?.thanks ?? messages.labels?.thanks ?? 'Thanks — We\'ll get back to you!'}</span>}
          {status === 'error' && <span className="ml-2 text-red-600">Error submitting. Try again.</span>}
        </div>
      </form>
    </div>
  )
}

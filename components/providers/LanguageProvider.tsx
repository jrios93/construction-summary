"use client"

import { createContext, useContext, useState, useMemo, ReactNode } from "react"
import { translations, Language } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.es
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function LanguageProvider({ children, defaultLanguage = "es" }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language],
  }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
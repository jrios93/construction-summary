"use client"

import { Languages } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/30 text-foreground hover:bg-accent/50 transition-colors"
    >
      <Languages className="size-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </button>
  )
}
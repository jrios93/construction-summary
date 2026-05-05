"use client"

import { useBudget } from "@/lib/hooks/useBudget"
import { useLanguage } from "@/components/providers/LanguageProvider"

export function ExchangeRateDisplay() {
  const { budget } = useBudget()
  const { language } = useLanguage()

  return (
    <p className="text-lg text-left font-semibold text-foreground">
      {language === "es" ? "Tasa referencial: " : "Exchange rate: "}
      <span className="text-primary">{budget.exchange_rate ? budget.exchange_rate : "..."}</span>
    </p>
  )
}

"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useBudget } from "@/lib/hooks/useBudget"

export const BudgetSection = () => {
  const { t, language } = useLanguage()
  const { budget, loading } = useBudget()

  const renderCurrency = (valueInPEN: number, usdClassName = "text-2xl") => {
    const exchangeRate = budget.exchange_rate || 3.70
    const valueInUSD = valueInPEN / exchangeRate
    const formattedPEN = "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedUSD = "$ " + valueInUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return (
      <span className="flex flex-col sm:inline">
        <span>{formattedPEN}</span>
        <span className={`${usdClassName} opacity-70 sm:inline px-2`}>({formattedUSD})</span>
      </span>
    )
  }

  const formatCurrencySimple = (valueInPEN: number) => {
    return "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="w-full  p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full px-2 py-6 md:p-6 ">
        <CardTitle className="text-xl md:text-2xl uppercase tracking-normal font-semibold text-left font-mono">{t.home.budgetTitle}</CardTitle>
        <CardContent className="flex flex-col md:flex-row justify-between items-center gap-6 space-y-4">
          <div className="flex-1 space-y-4 w-full">
            <p className="text-4xl md:text-6xl lg:text-7xl text-foreground font-bold text-center font-sans leading-tight">
              {renderCurrency(budget.total_amount)}
            </p>
            <Field className="w-full space-y-2">
              <Progress value={budget.percentage} id="progress-upload" className="h-8" />
              <FieldLabel htmlFor="progress-upload" className="flex justify-between gap-2">
                <p className="text-xl text-card-foreground">
                  <span className="font-semibold">{renderCurrency(budget.total_spent, "hidden")}</span> {t.home.spent}
                </p>
                <p className="hidden md:inline text-xl font-bold text-primary">{budget.percentage}%</p>
                <p className="text-lg text-card-foreground">
                  <span className="font-semibold">{renderCurrency(budget.remaining, "hidden")}</span> {t.home.available}
                </p>
              </FieldLabel>
            </Field>
          </div>
          <div className="flex flex-row md:flex-col w-full md:w-auto gap-4">
            <Card className="w-1/2 md:w-full border-2 border-accent ">
              <CardContent className="space-y-1 py-4">
                <p className="text-xl md:text-3xl font-bold text-center font-sans text-destructive">
                  {renderCurrency(budget.total_spent, "text-base")}
                </p>
                <p className="text-base md:text-lg text-muted-foreground text-center font-medium">{t.home.totalSpent}</p>
              </CardContent>
            </Card>

            <Card className="w-1/2 md:w-full border-2 border-ring ">
              <CardContent className="space-y-1 py-4">
                <p className="text-xl md:text-3xl font-bold text-center font-sans text-ring">
                  {renderCurrency(budget.remaining, "text-base")}
                </p>
                <p className="text-base md:text-lg text-muted-foreground text-center font-medium">{t.home.availableBalance}</p>
              </CardContent>
            </Card>
          </div>


        </CardContent>
      </Card>
      <div className="flex gap-4">
      </div>
    </div>
  )
}

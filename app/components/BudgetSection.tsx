"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useBudget } from "@/lib/hooks/useBudget"

export const BudgetSection = () => {
  const { t } = useLanguage()
  const { budget, loading } = useBudget()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
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
      <Card className="w-full  p-6">
        <CardTitle className="text-lg md:text-2xl uppercase tracking-normal font-semibold  text-left font-mono">{t.home.budgetTitle}</CardTitle>
        <CardContent className="flex flex-col md:flex-row  justify-between items-center gap-4 space-y-4">
          <div className=" flex-1 space-y-4">
            <p className="text-5xl md:text-7xl text-foreground font-bold text-center font-sans"> {formatCurrency(budget.total_amount)}</p>
            <Field className="w-full space-y-1 ">
              <Progress value={budget.percentage} id="progress-upload" className="h-6" />
              <FieldLabel htmlFor="progress-upload">
                <p className="text-lg text-card-foreground"><span className="font-semibold">{formatCurrency(budget.total_spent)}</span> {t.home.spent} </p>
                <span className="text-xl ml-auto font-semibold hidden md:flex">{budget.percentage}%</span>
                <p className="text-base ml-auto"><span className="font-semibold">{formatCurrency(budget.remaining)}</span> {t.home.available}</p>
              </FieldLabel>
            </Field>
          </div>
          <div className="flex flex-1 flex-row md:flex-col w-full gap-4">
            <Card className="w-full border border-accent">
              <CardContent className="space-y-2">
                <p className="text-3xl lg:text-4xl font-bold text-center font-sans"> {formatCurrency(budget.total_spent)}</p>
                <p className="text-muted-foreground text-center text-lg">{t.home.totalSpent}</p>

              </CardContent>
            </Card>


            <Card className="w-full border border-ring bg-accent/30 ">
              <CardContent className="space-y-2">
                <p className="text-secondary-foreground text-3xl lg:text-4xl font-bold text-center font-sans"> {formatCurrency(budget.remaining)}</p>
                <p className="text-muted-foreground text-center text-lg">{t.home.availableBalance}</p>

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
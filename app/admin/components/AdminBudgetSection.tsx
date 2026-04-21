"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useBudget } from "@/lib/hooks/useBudget"
import { useActivity } from "@/lib/hooks/useActivity"
import { toast } from "sonner"

export const AdminBudgetSection = () => {
  const { t, language } = useLanguage()
  const { budget, loading, updateBudget, updateExchangeRate } = useBudget()
  const { activities, loading: activitiesLoading } = useActivity()
  const [isEditing, setIsEditing] = useState(false)
  const [budgetInput, setBudgetInput] = useState("")
  const [exchangeRateInput, setExchangeRateInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingExchange, setIsEditingExchange] = useState(false)

  const handleEdit = () => {
    // Usar un timeout para evitar que se sobrescriba inmediatamente
    setTimeout(() => {
      setBudgetInput(budget.total_amount.toString())
      setIsEditing(true)
    }, 0)
  }

  const handleSave = async () => {
    if (!budgetInput.trim()) return

    const cleanAmount = budgetInput.replace(/,/g, "").replace(/\s/g, "")
    const numAmount = parseFloat(cleanAmount)

    if (isNaN(numAmount) || numAmount < 0) {
      return
    }

    setIsSaving(true)
    const success = await updateBudget(numAmount)
    setIsSaving(false)

    if (success) {
      toast.success(language === "es" ? "Presupuesto actualizado" : "Budget updated")
      setIsEditing(false)
      setBudgetInput("")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setBudgetInput("")
  }

  const handleEditExchangeRate = () => {
    setExchangeRateInput(budget.exchange_rate.toString())
    setIsEditingExchange(true)
  }

  const handleSaveExchangeRate = async () => {
    const rate = parseFloat(exchangeRateInput)
    if (isNaN(rate) || rate <= 0) return

    setIsSaving(true)
    const success = await updateExchangeRate(rate)
    setIsSaving(false)

    if (success) {
      toast.success(language === "es" ? "Tipo de cambio actualizado" : "Exchange rate updated")
      setIsEditingExchange(false)
      setExchangeRateInput("")
    }
  }

  const handleCancelExchangeRate = () => {
    setIsEditingExchange(false)
    setExchangeRateInput("")
  }

  const formatCurrency = (valueInPEN: number) => {
    return "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatCurrencyWithExchange = (valueInPEN: number, exchangeRate: number) => {
    const valueInUSD = valueInPEN / exchangeRate
    const formattedPEN = "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedUSD = "$ " + valueInUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${formattedPEN} (${formattedUSD})`
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="w-full p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-20 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full p-4 md:p-6 border-border">
        <CardTitle className="text-xl md:text-2xl uppercase tracking-normal font-semibold text-left font-mono text-foreground mb-4">
          {t.budget.title}
        </CardTitle>
        <CardContent className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full space-y-4">
            {isEditing ? (
              <div className="space-y-4 max-w-md">
                <Field className="w-full">
                  <FieldLabel className="text-foreground">{t.budget.title} (PEN)</FieldLabel>
                  <Input
                    type="number"
                    value={budgetInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetInput(e.target.value)}
                    className="text-4xl md:text-6xl font-bold font-sans text-foreground py-6 h-auto"
                  />
                </Field>
                <div className="p-4 rounded-lg bg-sidebar/50 border border-border">
                  <p className="text-muted-foreground text-sm">{t.budget.totalSpent}</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(budget.total_spent)}</p>
                  <p className="text-xs text-muted-foreground mt-1">*Se calcula automáticamente desde los gastos</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="text-xl py-6 px-8 font-semibold">
                  {isSaving ? "..." : t.common.save}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="ml-2 text-xl py-6 px-8 font-semibold">
                  {t.common.cancel}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-5xl md:text-7xl text-foreground font-bold text-center font-sans">
                  {formatCurrency(budget.total_amount)}
                </p>
                <Field className="w-full space-y-1">
                  <Progress value={budget.percentage} id="progress-upload" className="h-6" />
                  <FieldLabel htmlFor="progress-upload">
                    <p className="text-lg text-foreground">
                      <span className="font-semibold">{formatCurrency(budget.total_spent)}</span> {t.budget.spent}
                    </p>
                    <span className="text-xl ml-auto font-semibold hidden md:flex">{budget.percentage}%</span>
                    <p className="text-base ml-auto">
                      <span className="font-semibold">{formatCurrency(budget.remaining)}</span> {t.budget.available}
                    </p>
                  </FieldLabel>
                </Field>
              </>
            )}
          </div>
          <div className="flex flex-row md:flex-col md:w-1/2 w-full gap-4">
            <Card className="flex-1 border-2 border-destructive/50">
              <CardContent className="py-4 px-2">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-center font-sans text-destructive">
                  {formatCurrency(budget.total_spent)}
                </p>
                <p className="text-sm md:text-base text-muted-foreground text-center">{t.budget.totalSpent}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 border-2 border-ring">
              <CardContent className="py-4 px-2">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-center font-sans text-ring">
                  {formatCurrency(budget.remaining)}
                </p>
                <p className="text-sm md:text-base text-muted-foreground text-center">{t.budget.availableBalance}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleEdit} variant="secondary" className="w-full md:w-auto text-xl py-6 px-8 font-semibold" disabled={isEditing}>
        {t.budget.editBudget}
      </Button>

      <Card className="w-full p-6 border-border">
        <CardTitle className="text-xl md:text-2xl uppercase tracking-normal font-semibold text-left font-mono text-foreground mb-4">
          {language === "es" ? "Tipo de Cambio (USD a PEN)" : "Exchange Rate (USD to PEN)"}
        </CardTitle>
        <CardContent>
          {isEditingExchange ? (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Input
                type="number"
                step="0.01"
                value={exchangeRateInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExchangeRateInput(e.target.value)}
                className="w-full sm:w-40 text-4xl font-bold py-6 h-auto"
                placeholder="3.70"
              />
              <div className="flex gap-3 w-full sm:w-auto">
                <Button onClick={handleSaveExchangeRate} disabled={isSaving} className="flex-1 sm:flex-none text-xl py-6 px-8 font-semibold">
                  {isSaving ? "..." : t.common.save}
                </Button>
                <Button onClick={handleCancelExchangeRate} variant="outline" className="flex-1 sm:flex-none text-xl py-6 px-8 font-semibold">
                  {t.common.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-3xl font-bold text-foreground">
                  {budget.exchange_rate.toFixed(2)} PEN/USD
                </p>
                <span className="text-base px-3 py-1 rounded bg-sidebar-accent/50 text-foreground">
                  {budget.exchange_rate_source === "manual"
                    ? (language === "es" ? "Manual" : "Manual")
                    : (language === "es" ? "Automático (API)" : "Automatic (API)")}
                </span>
              </div>
              <Button onClick={handleEditExchangeRate} variant="outline" className="text-lg py-4 px-6 font-semibold" disabled={isEditingExchange}>
                {t.common.edit}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            * {language === "es"
              ? "Valor automático desde Frankfurter API. Puedes editarlo manualmente si necesitas un valor diferente."
              : "Automatic value from Frankfurter API. You can edit manually if you need a different value."}
          </p>
        </CardContent>
      </Card>

      <Card className="w-full p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {t.budget.recentActivity}
        </CardTitle>
        <CardContent>
          {activitiesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-sidebar/50 rounded-lg"></div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{language === "es" ? "No hay actividades recientes" : "No recent activities"}</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-sidebar/50 border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.type === "expense" ? "bg-destructive" : "bg-primary"
                        }`}
                    />
                    <span className="text-foreground truncate">{activity.description}</span>
                    {activity.amount && (
                      <span className="text-destructive font-semibold flex-shrink-0">{activity.amount}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm flex-shrink-0">{formatDate(activity.date)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

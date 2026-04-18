"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useBudget } from "@/lib/hooks/useBudget"

interface Activity {
  id: string
  type: "expense" | "news"
  description: string
  amount?: string
  date: string
}

const mockActivitiesEs: Activity[] = [
  { id: "1", type: "expense", description: "Compra de materiales", amount: "$ 2,500", date: "18/04/2026" },
  { id: "2", type: "news", description: "Se publicó: Inicio de cimentación", date: "17/04/2026" },
  { id: "3", type: "expense", description: "Pago a proveedor", amount: "$ 5,000", date: "16/04/2026" },
  { id: "4", type: "news", description: "Se publicó: Avance de estructura", date: "15/04/2026" },
  { id: "5", type: "expense", description: "Alquiler de maquinaria", amount: "$ 1,200", date: "14/04/2026" },
]

const mockActivitiesEn: Activity[] = [
  { id: "1", type: "expense", description: "Purchase of materials", amount: "$ 2,500", date: "18/04/2026" },
  { id: "2", type: "news", description: "Published: Foundation start", date: "17/04/2026" },
  { id: "3", type: "expense", description: "Payment to supplier", amount: "$ 5,000", date: "16/04/2026" },
  { id: "4", type: "news", description: "Published: Structure progress", date: "15/04/2026" },
  { id: "5", type: "expense", description: "Equipment rental", amount: "$ 1,200", date: "14/04/2026" },
]

export const AdminBudgetSection = () => {
  const { t } = useLanguage()
  const { budget, loading, updateBudget } = useBudget()
  const [isEditing, setIsEditing] = useState(false)
  const [budgetInput, setBudgetInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

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
      setIsEditing(false)
      setBudgetInput("")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setBudgetInput("")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const mockActivities = t.common.save === "Guardar" ? mockActivitiesEs : mockActivitiesEn

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
      <Card className="w-full p-6 border-border">
        <CardTitle className="text-lg md:text-2xl uppercase tracking-normal font-semibold text-left font-mono text-foreground">
          {t.budget.title}
        </CardTitle>
        <CardContent className="flex flex-col lg:flex-row justify-between items-center gap-6 mt-4">
          <div className="flex-1 w-full space-y-4">
            {isEditing ? (
              <div className="space-y-4 max-w-md">
                <Field className="w-full">
                  <FieldLabel className="text-foreground">{t.budget.title} ($)</FieldLabel>
                  <Input
                    type="number"
                    value={budgetInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetInput(e.target.value)}
                    className="text-4xl md:text-6xl font-bold font-sans text-foreground"
                  />
                </Field>
                <div className="p-4 rounded-lg bg-sidebar/50 border border-border">
                  <p className="text-muted-foreground text-sm">{t.budget.totalSpent}</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(budget.total_spent)}</p>
                  <p className="text-xs text-muted-foreground mt-1">*Se calcula automáticamente desde los gastos</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Guardando..." : t.common.save}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="ml-2">
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
          <div className="flex flex-1 flex-row lg:flex-col w-full lg:w-auto gap-4">
            <Card className="w-full border border-sidebar-accent">
              <CardContent className="space-y-2">
                <p className="text-3xl lg:text-4xl font-bold text-center font-sans text-foreground">
                  {formatCurrency(budget.total_spent)}
                </p>
                <p className="text-muted-foreground text-center text-lg">{t.budget.totalSpent}</p>
              </CardContent>
            </Card>
            <Card className="w-full border border-ring bg-sidebar-accent/30">
              <CardContent className="space-y-2">
                <p className="text-3xl lg:text-4xl font-bold text-center font-sans text-sidebar-accent-foreground">
                  {formatCurrency(budget.remaining)}
                </p>
                <p className="text-muted-foreground text-center text-lg">{t.budget.availableBalance}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleEdit} variant="outline" className="w-full md:w-auto" disabled={isEditing}>
        {t.budget.editBudget}
      </Button>

      <Card className="w-full p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {t.budget.recentActivity}
        </CardTitle>
        <CardContent>
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-sidebar/50 border border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === "expense" ? "bg-destructive" : "bg-primary"
                    }`}
                  />
                  <span className="text-foreground truncate">{activity.description}</span>
                  {activity.amount && (
                    <span className="text-destructive font-semibold flex-shrink-0">{activity.amount}</span>
                  )}
                </div>
                <span className="text-muted-foreground text-sm flex-shrink-0">{activity.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
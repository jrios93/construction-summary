"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useExpenses } from "@/lib/hooks/useExpenses"
import { FileText } from "lucide-react"

export const RegisterSpentSection = () => {
  const { t } = useLanguage()
  const { expenses, loading } = useExpenses()
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 3

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-16">
          <div className="w-fit ">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="border border-neutral-300 w-full"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-card rounded-lg animate-pulse h-24"></div>
          <div className="p-6 bg-card rounded-lg animate-pulse h-24"></div>
        </div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return null
  }

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const displayExpenses = expenses.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-16">
        <div className="w-fit ">
          <h2 className="text-3xl font-semibold text-nowrap">{t.home.expenseTitle}</h2>
        </div>
        <div className="border border-neutral-300 w-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">

        {displayExpenses.map((expense) => (
          <Card key={expense.id} className="p-6">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex gap-6 items-center">
                <Card className="w-20 h-20 flex items-center justify-center">
                  <CardContent className="flex flex-col items-center gap-1">
                    <FileText className="size-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xl font-semibold">{expense.description}</p>
                    <span className="text-lg text-muted-foreground">{formatDate(expense.date)}</span>
                  </div>
                </div>

              </div>
              <div className="flex gap-4 items-center">
                <div>
                  <p className="text-2xl font-bold text-destructive">-{formatCurrency(expense.amount)}</p>
                </div>

                {expense.file_url && (
                  <Button 
                    className="text-primary text-xl bg-accent/50  font-medium py-6 px-5 rounded-lg hover:bg-accent transition-colors w-full sm:w-auto text-center" 
                    aria-label="View receipt"
                    onClick={() => window.open(expense.file_url, "_blank")}
                  >
                    View receipt
                  </Button>
                )}
              </div>
            </CardContent>

          </Card>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="text-lg py-6"
            >
              Anterior
            </Button>
            <span className="flex items-center text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <Button 
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="text-lg py-6"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
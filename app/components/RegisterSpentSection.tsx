"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useExpenses } from "@/lib/hooks/useExpenses"
import { useBudget } from "@/lib/hooks/useBudget"
import { FileText, Download } from "lucide-react"

export const RegisterSpentSection = () => {
  const { t, language } = useLanguage()
  const { expenses, loading } = useExpenses()
  const { budget } = useBudget()
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 3

  const renderCurrency = (valueInPEN: number, usdClassName = "text-xl") => {
    const exchangeRate = budget.exchange_rate || 3.70
    const valueInUSD = valueInPEN / exchangeRate
    const formattedPEN = "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedUSD = "$ " + valueInUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return (
      <>
        {formattedPEN} <span className={`${usdClassName} opacity-70`}>({formattedUSD})</span>
      </>
    )
  }

  const formatCurrencySimple = (valueInPEN: number) => {
    return "S/ " + valueInPEN.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
              <div className="flex gap-4 items-center">
                <Card className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
                  <CardContent className="flex flex-col items-center gap-1">
                    <FileText className="size-8 md:size-10 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-2 min-w-0">
                  <div>
                    <p className="text-xl md:text-2xl font-semibold text-foreground truncate">{expense.description}</p>
                    <span className="text-lg md:text-xl text-muted-foreground">{formatDate(expense.date)}</span>
                  </div>
                </div>

              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-destructive">-{renderCurrency(expense.amount, "text-base")}</p>
                </div>

                {expense.file_url && (
                  <Button 
                    className="text-primary text-xl bg-accent/50 font-semibold py-6 px-6 rounded-lg hover:bg-accent transition-colors w-full sm:w-auto text-center flex items-center gap-2" 
                    aria-label={language === "es" ? "Ver comprobante" : "View receipt"}
                    onClick={() => window.open(expense.file_url, "_blank")}
                  >
                    <FileText className="size-6" />
                    {language === "es" ? "Ver comprobante" : "View receipt"}
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
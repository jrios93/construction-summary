"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Pencil, Upload } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useExpenses } from "@/lib/hooks/useExpenses"

export const AdminExpensesSection = () => {
  const { t } = useLanguage()
  const { expenses, loading, total, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatCurrency = (value: number) => {
    return "S/ " + value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleAddExpense = async () => {
    if (!description || !amount || !date) return

    setIsSaving(true)
    const result = await addExpense({ description, amount, date }, file || undefined)
    setIsSaving(false)

    if (result) {
      setDescription("")
      setAmount("")
      setDate("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleEdit = (expense: { id: string; description: string; amount: number; date: string }) => {
    setEditingId(expense.id)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setDate(expense.date)
  }

  const handleUpdate = async () => {
    if (!description || !amount || !date || !editingId) return

    setIsSaving(true)
    const result = await updateExpense({ id: editingId, description, amount, date })
    setIsSaving(false)

    if (result) {
      setEditingId(null)
      setDescription("")
      setAmount("")
      setDate("")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setDescription("")
    setAmount("")
    setDate("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    await deleteExpense(id)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-10 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-20 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {editingId ? t.expenses.editTitle : t.expenses.title}
        </CardTitle>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="description" className="text-xl font-semibold text-foreground">{t.common.description}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.expenses.title + "..."}
              className="text-xl py-6 h-auto text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-xl font-semibold text-foreground">{t.expenses.amount}</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-2xl py-6 h-auto text-foreground"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="date" className="text-xl font-semibold text-foreground">{t.common.date}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xl py-6 h-auto text-foreground"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="file" className="text-xl font-semibold text-foreground">{t.expenses.uploadFile}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="text-lg text-foreground file:text-xl file:font-medium"
              />
            </div>
            {file && (
              <span className="text-lg text-muted-foreground truncate block">
                {file.name}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} disabled={isSaving} className="flex-1 text-xl py-6 font-semibold">
                  {isSaving ? "..." : t.common.update}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1 text-xl py-6 font-semibold">{t.common.cancel}</Button>
              </>
            ) : (
              <Button onClick={handleAddExpense} disabled={isSaving} className="w-full text-xl py-6 font-semibold">
                {isSaving ? "..." : t.common.save}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {t.expenses.history}
        </CardTitle>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-border">
            <span className="text-muted-foreground">{t.expenses.totalRegistered}</span>
            <span className="text-xl font-bold text-destructive">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.expenses.noExpenses}</p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-sidebar/50 border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{expense.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-destructive font-semibold">
                        {formatCurrency(expense.amount)}
                      </span>
                      <span className="text-muted-foreground text-sm">• {expense.date}</span>
                      {expense.file_name && (
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Upload className="size-3" /> {expense.file_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(expense)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
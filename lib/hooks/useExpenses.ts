import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  file_url?: string
  file_name?: string
  created_at?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setExpenses(data.expenses || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setError("Failed to fetch expenses")
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: { description: string; amount: string; date: string }, file?: File) => {
    try {
      const formData = new FormData()
      formData.append("description", expense.description)
      formData.append("amount", expense.amount)
      formData.append("date", expense.date)
      if (file) formData.append("file", file)

      const res = await fetch("/api/expenses", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return null
      }
      await fetchExpenses()
      return data.expense
    } catch (err) {
      setError("Failed to add expense")
      return null
    }
  }

  const updateExpense = async (expense: { id: string; description: string; amount: string; date: string }) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return null
      }
      await fetchExpenses()
      return data.expense
    } catch (err) {
      setError("Failed to update expense")
      return null
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return false
      }
      await fetchExpenses()
      return true
    } catch (err) {
      setError("Failed to delete expense")
      return false
    }
  }

  useEffect(() => {
    fetchExpenses()

    const channel = supabase.channel('expenses-changes')
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
      fetchExpenses()
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { expenses, loading, error, total, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses }
}
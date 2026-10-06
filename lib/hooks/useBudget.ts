import { createContext, createElement, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Budget {
  id?: string
  total_amount: number
  total_spent: number
  remaining: number
  percentage: number
  exchange_rate: number
  exchange_rate_source?: "default" | "manual"
}

interface BudgetState {
  budget: Budget
  loading: boolean
  error: string | null
  updateBudget: (total_amount: number) => Promise<boolean>
  updateExchangeRate: (exchange_rate: number) => Promise<boolean>
  refetch: () => Promise<void>
}

const BudgetContext = createContext<BudgetState | null>(null)

function useBudgetState(): BudgetState {
  const [budget, setBudget] = useState<Budget>({
    total_amount: 0,
    total_spent: 0,
    remaining: 0,
    percentage: 0,
    exchange_rate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBudget(data.budget)
      }
    } catch (err) {
      setError("Failed to fetch budget")
    } finally {
      setLoading(false)
    }
  }

  const updateBudget = async (total_amount: number) => {
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_amount })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return false
      }
      await fetchBudget()
      return true
    } catch (err) {
      setError("Failed to update budget")
      return false
    }
  }

  const updateExchangeRate = async (exchange_rate: number) => {
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange_rate })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return false
      }
      await fetchBudget()
      return true
    } catch (err) {
      setError("Failed to update exchange rate")
      return false
    }
  }

  useEffect(() => {
    let isMounted = true
    void fetchBudget()

    const channel = supabase.channel('budget-changes')
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'budgets'
    }, () => {
      if (isMounted) void fetchBudget()
    })

    const expenseChannel = supabase.channel('budget-expenses-changes')
    expenseChannel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'expenses'
    }, () => {
      if (isMounted) void fetchBudget()
    })

    channel.subscribe()
    expenseChannel.subscribe()

    return () => {
      isMounted = false
      void supabase.removeChannel(channel)
      void supabase.removeChannel(expenseChannel)
    }
  }, [])

  return { budget, loading, error, updateBudget, updateExchangeRate, refetch: fetchBudget }
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const state = useBudgetState()
  return createElement(BudgetContext.Provider, { value: state }, children)
}

export function useBudget() {
  const state = useContext(BudgetContext)
  if (!state) throw new Error("useBudget must be used within a BudgetProvider")
  return state
}

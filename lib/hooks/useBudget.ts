import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Budget {
  id?: string
  total_amount: number
  total_spent: number
  remaining: number
  percentage: number
  exchange_rate: number
  exchange_rate_source?: "api" | "manual"
}

export function useBudget() {
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

    fetchBudget()

    if (!isMounted) return

    try {
      const channel = supabase.channel('budget-changes')
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets'
      }, () => {
        if (isMounted) fetchBudget()
      })

      const channel2 = supabase.channel('budget-expenses-changes')
      channel2.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, () => {
        if (isMounted) fetchBudget()
      })

      channel.subscribe()
      channel2.subscribe()

      return () => {
        isMounted = false
        supabase.removeChannel(channel)
        supabase.removeChannel(channel2)
      }
    } catch (e) {
      console.log('Realtime error:', e)
    }
  }, [])

  return { budget, loading, error, updateBudget, updateExchangeRate, refetch: fetchBudget }
}

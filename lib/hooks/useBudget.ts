import { useState, useEffect } from "react"

interface Budget {
  id?: string
  total_amount: number
  total_spent: number
  remaining: number
  percentage: number
}

export function useBudget() {
  const [budget, setBudget] = useState<Budget>({
    total_amount: 0,
    total_spent: 0,
    remaining: 0,
    percentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = async () => {
    try {
      setLoading(true)
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

  useEffect(() => {
    fetchBudget()
  }, [])

  return { budget, loading, error, updateBudget, refetch: fetchBudget }
}
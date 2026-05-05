"use client"

import { useState, useEffect, useCallback } from "react"

interface Milestone {
  id: string
  label: string
  threshold: number
}

interface ProgressData {
  progress: number
  milestones: Milestone[]
}

interface SaveMilestone {
  label: string
  threshold: number
}

export function useProgress() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/progress")
      const result = await res.json()

      if (result.error) throw new Error(result.error)

      setData({
        progress: result.progress ?? 0,
        milestones: result.milestones ?? [],
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const saveProgress = useCallback(async (progress: number, milestones: SaveMilestone[]) => {
    try {
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress, milestones })
      })
      const result = await res.json()

      if (result.error) throw new Error(result.error)

      await fetchProgress()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return false
    }
  }, [fetchProgress])

  return { data, loading, error, saveProgress, refetch: fetchProgress }
}
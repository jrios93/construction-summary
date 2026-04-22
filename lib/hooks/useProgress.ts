"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

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

      const { data: progressData, error: progressError } = await supabase
        .from("project_progress")
        .select("*")
        .limit(1)
        .single()

      if (progressError) throw progressError

      const { data: milestonesData, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .order("threshold", { ascending: true })

      if (milestonesError) throw milestonesError

      setData({
        progress: progressData?.progress ?? 0,
        milestones: milestonesData ?? [],
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

    const channel = supabase.channel("progress-changes")

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_progress" },
        () => fetchProgress()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "milestones" },
        () => fetchProgress()
      )
      .subscribe((status) => {
        console.log("Realtime status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProgress])

  const saveProgress = useCallback(async (progress: number, milestones: SaveMilestone[]) => {
    try {
      const { data: existing } = await supabase
        .from("project_progress")
        .select("id")
        .limit(1)
        .single()

      if (existing) {
        await supabase
          .from("project_progress")
          .update({ progress })
          .eq("id", existing.id)
      } else {
        await supabase
          .from("project_progress")
          .insert({ progress })
      }

      if (milestones.length > 0) {
        await supabase.from("milestones").delete().neq("id", "00000000-0000-0000-0000-000000000000")

        const { data: pData } = await supabase
          .from("project_progress")
          .select("id")
          .limit(1)
          .single()

        if (pData) {
          await supabase.from("milestones").insert(
            milestones.map((m, i) => ({
              project_progress_id: pData.id,
              label: m.label,
              threshold: m.threshold,
              sort_order: i,
            }))
          )
        }
      }

      await fetchProgress()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return false
    }
  }, [fetchProgress])

  return { data, loading, error, saveProgress, refetch: fetchProgress }
}
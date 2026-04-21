import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Activity {
  id: string
  type: "expense" | "news"
  description: string
  amount?: string
  date: string
}

export function useActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activity")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setActivities(data.activities || [])
      }
    } catch (err) {
      setError("Failed to fetch activities")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()

    const channel = supabase.channel('activity-expenses')
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
      fetchActivities()
    })

    const channel2 = supabase.channel('activity-news')
    channel2.on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
      fetchActivities()
    })

    channel.subscribe()
    channel2.subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(channel2)
    }
  }, [])

  return { activities, loading, error, refetch: fetchActivities }
}
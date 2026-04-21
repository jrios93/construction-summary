import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const now = new Date()
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, description, amount, date, created_at")
      .gte("created_at", fifteenDaysAgo.toISOString())
      .order("date", { ascending: false })
      .limit(15)

    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("id, title, content, status, published_at, created_at")
      .eq("status", "published")
      .gte("published_at", fifteenDaysAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(10)

    if (expensesError || newsError) {
      return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
    }

    const activities: { id: string; type: string; description: string; amount?: string; date: string }[] = []

    ;(expenses || []).forEach((e) => {
      const amountFormatted = "S/ " + Number(e.amount).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      activities.push({
        id: e.id,
        type: "expense",
        description: e.description,
        amount: amountFormatted,
        date: e.date,
      })
    })

    ;(news || []).forEach((n) => {
      activities.push({
        id: n.id,
        type: "news",
        description: n.title || n.content?.substring(0, 50) + "...",
        amount: undefined,
        date: n.published_at?.split("T")[0] || n.created_at?.split("T")[0],
      })
    })

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ activities: activities.slice(0, 15) })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

let cachedExchangeRate: { value: number; timestamp: number } | null = null
const CACHE_DURATION = 3600000 // 1 hour

async function fetchExchangeRateFromAPI(): Promise<number> {
  const now = Date.now()

  if (cachedExchangeRate && (now - cachedExchangeRate.timestamp) < CACHE_DURATION) {
    return cachedExchangeRate.value
  }

  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=PEN")
    if (!response.ok) throw new Error("Failed to fetch exchange rate")
    const data = await response.json()
    const rate = data.rates?.PEN || 3.70
    cachedExchangeRate = { value: rate, timestamp: now }
    return rate
  } catch (error) {
    console.error("Error fetching exchange rate:", error)
    return cachedExchangeRate?.value || 3.70
  }
}

export async function GET() {
  try {
    console.log("Fetching budget from Supabase...")
    
    const { data: budgetsData, error: budgetsError } = await supabase
      .from("budgets")
      .select("*")
      .limit(1)

    console.log("Budgets response:", { data: budgetsData, error: budgetsError })

    if (budgetsError) {
      return NextResponse.json({ error: budgetsError.message, details: budgetsError }, { status: 500 })
    }

    const budget = budgetsData && budgetsData.length > 0 ? budgetsData[0] : { total_amount: 0, exchange_rate: null }
    
    const storedExchangeRate = budget.exchange_rate ? Number(budget.exchange_rate) : null
    const apiExchangeRate = await fetchExchangeRateFromAPI()
    const exchangeRate = storedExchangeRate || apiExchangeRate

    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("amount")

    console.log("Expenses response:", { data: expensesData, error: expensesError })

    if (expensesError) {
      return NextResponse.json({ error: expensesError.message }, { status: 500 })
    }

    const totalSpent = expensesData?.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0) || 0

    console.log("Total spent calculated:", totalSpent)

    return NextResponse.json({
      budget: {
        ...budget,
        total_spent: totalSpent,
        remaining: budget.total_amount - totalSpent,
        percentage: budget.total_amount > 0 
          ? Math.round((totalSpent / budget.total_amount) * 100) 
          : 0,
        exchange_rate: exchangeRate,
        exchange_rate_source: storedExchangeRate ? "manual" : "api"
      }
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { total_amount, exchange_rate } = body

    console.log("PUT /api/budget - received:", { total_amount, exchange_rate, type: typeof total_amount })

    if (total_amount !== undefined && (typeof total_amount !== "number" || total_amount < 0)) {
      return NextResponse.json({ error: "Invalid total_amount" }, { status: 400 })
    }

    if (exchange_rate !== undefined && (typeof exchange_rate !== "number" || exchange_rate <= 0)) {
      return NextResponse.json({ error: "Invalid exchange_rate" }, { status: 400 })
    }

    if (total_amount === undefined && exchange_rate === undefined) {
      return NextResponse.json({ error: "No valid field to update" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .limit(1)
      .single()

    console.log("Existing budget:", existing)

    const updateData: { total_amount?: number; updated_at: string; exchange_rate?: number } = {
      updated_at: new Date().toISOString()
    }
    
    if (total_amount !== undefined) {
      updateData.total_amount = total_amount
    }
    
    if (exchange_rate !== undefined) {
      updateData.exchange_rate = exchange_rate
    }

    let result
    if (existing && existing.id) {
      result = await supabase
        .from("budgets")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from("budgets")
        .insert(updateData)
        .select()
        .single()
    }

    console.log("Update/Insert result:", result)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ budget: result.data })
  } catch (error) {
    console.error("PUT /api/budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
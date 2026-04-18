import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    const budget = budgetsData && budgetsData.length > 0 ? budgetsData[0] : { total_amount: 0 }

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
          : 0
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
    const { total_amount } = body

    console.log("PUT /api/budget - received:", { total_amount, type: typeof total_amount })

    if (typeof total_amount !== "number" || total_amount < 0) {
      return NextResponse.json({ error: "Invalid total_amount" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .limit(1)
      .single()

    console.log("Existing budget:", existing)

    let result
    if (existing && existing.id) {
      result = await supabase
        .from("budgets")
        .update({ total_amount, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from("budgets")
        .insert({ total_amount })
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
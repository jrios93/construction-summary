import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from("budgets")
      .select("*")

    // Test expenses  
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")

    // Test news
    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("*")

    return NextResponse.json({
      budgets: budgets || [],
      budgetsError: budgetsError?.message || null,
      expenses: expenses || [],
      expensesError: expensesError?.message || null,
      news: news || [],
      newsError: newsError?.message || null,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: String(error),
      stack: error instanceof Error ? error.stack : null 
    }, { status: 500 })
  }
}
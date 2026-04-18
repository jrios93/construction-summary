import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalSpent = data?.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0) || 0

    return NextResponse.json({
      expenses: data || [],
      total: totalSpent
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get("description") as string
    const amount = formData.get("amount") as string
    const date = formData.get("date") as string
    const file = formData.get("file") as File | null

    if (!description || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let fileUrl = null
    let fileName = null

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop()
      const fileNameBytes = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileNameBytes, file)

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileNameBytes)

      fileUrl = urlData.publicUrl
      fileName = file.name
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        description,
        amount: parseFloat(amount),
        date,
        file_url: fileUrl,
        file_name: fileName
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, description, amount, date } = body

    if (!id || !description || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        description,
        amount: parseFloat(amount),
        date,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
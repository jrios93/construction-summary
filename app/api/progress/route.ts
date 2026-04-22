import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: progressData, error: progressError } = await supabase
      .from("project_progress")
      .select("*")
      .limit(1)
      .single()

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    const { data: milestonesData, error: milestonesError } = await supabase
      .from("milestones")
      .select("*")
      .order("threshold", { ascending: true })

    if (milestonesError) {
      return NextResponse.json({ error: milestonesError.message }, { status: 500 })
    }

    return NextResponse.json({
      progress: progressData?.progress || 0,
      milestones: milestonesData || [],
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { progress, milestones } = body

    const { data: existingProgress } = await supabase
      .from("project_progress")
      .select("id")
      .limit(1)
      .single()

    let updatedProgress
    if (existingProgress) {
      const result = await supabase
        .from("project_progress")
        .update({ progress })
        .eq("id", existingProgress.id)
        .select()
        .single()
      updatedProgress = result.data
    } else {
      const result = await supabase
        .from("project_progress")
        .insert({ progress: progress || 0 })
        .select()
        .single()
      updatedProgress = result.data
    }

    if (milestones && updatedProgress) {
      await supabase
        .from("milestones")
        .delete()
        .eq("project_progress_id", updatedProgress.id)

      if (milestones.length > 0) {
        const milestonesToInsert = milestones.map((m: { label: string; threshold: number }, index: number) => ({
          project_progress_id: updatedProgress.id,
          label: m.label,
          threshold: m.threshold,
          sort_order: index,
        }))
        await supabase.from("milestones").insert(milestonesToInsert)
      }
    }

    return NextResponse.json({ success: true, progress: updatedProgress?.progress })
  } catch (error) {
    console.error("PUT /api/progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
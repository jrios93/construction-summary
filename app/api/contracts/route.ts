import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("contract_documents")
      .select(`
        *,
        attachments:contract_attachments(id, file_url, file_name, file_type, created_at)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get("description") as string
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const timestamp = Date.now()

    const { data: docData, error: docError } = await supabase
      .from("contract_documents")
      .insert({
        description: description || ""
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    const attachments = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = `${timestamp}-${i}-${file.name.replace(/\s/g, "_")}`
      const fileType = file.name.split(".").pop() || "unknown"

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("construction-files")
        .upload(fileName, file)

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from("construction-files")
        .getPublicUrl(fileName)

      const { data: attachmentData, error: attachmentError } = await supabase
        .from("contract_attachments")
        .insert({
          document_id: docData.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: fileType
        })
        .select()
        .single()

      if (attachmentError) {
        return NextResponse.json({ error: attachmentError.message }, { status: 500 })
      }

      attachments.push(attachmentData)
    }

    return NextResponse.json({
      documents: [{ ...docData, attachments }]
    })
  } catch (error) {
    console.error("Error:", error)
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

    const { data: attachments, error: fetchError } = await supabase
      .from("contract_attachments")
      .select("file_url")
      .eq("document_id", id)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map((att: { file_url: string }) => {
        const urlParts = att.file_url.split("/")
        return urlParts[urlParts.length - 1]
      })

      await supabase.storage
        .from("construction-files")
        .remove(fileNames)

      await supabase
        .from("contract_attachments")
        .delete()
        .eq("document_id", id)
    }

    const { error: deleteError } = await supabase
      .from("contract_documents")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

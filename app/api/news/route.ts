import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: news, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const newsWithImages = await Promise.all(
      (news || []).map(async (item: { id: string; [key: string]: unknown }) => {
        const { data: images } = await supabase
          .from("news_images")
          .select("*")
          .eq("news_id", item.id)

        return {
          ...item,
          images: images || []
        }
      })
    )

    return NextResponse.json({ news: newsWithImages })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const status = formData.get("status") as string || "draft"
    const files = formData.getAll("images") as File[]

    console.log("POST /api/news - files:", files.length, files.map(f => ({ name: f.name, size: f.size })))

    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const publishedAt = status === "published" ? new Date().toISOString() : null

    const { data: newsData, error: newsError } = await supabase
      .from("news")
      .insert({
        title,
        content,
        status,
        published_at: publishedAt
      })
      .select()
      .single()

    if (newsError) {
      return NextResponse.json({ error: "newsError: " + newsError.message }, { status: 500 })
    }

    console.log("News created:", newsData)

    const uploadedImages = []
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop()
        const fileNameBytes = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        console.log("Uploading image:", fileNameBytes, file.type)

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileNameBytes, file)

        console.log("Upload result:", { error: uploadError })

        if (uploadError) {
          console.log("Upload failed:", uploadError.message)
          continue
        }

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileNameBytes)

        console.log("Image URL:", urlData.publicUrl)

        const { data: imageData, error: imageError } = await supabase
          .from("news_images")
          .insert({
            news_id: newsData.id,
            image_url: urlData.publicUrl,
            image_name: file.name
          })
          .select()
          .single()

        console.log("Image record:", { imageData, imageError })

        if (imageData) {
          uploadedImages.push(imageData)
        }
      }
    }

    return NextResponse.json({ 
      news: { ...newsData, images: uploadedImages } 
    })
  } catch (error) {
    console.error("POST /api/news error:", error)
    return NextResponse.json({ error: "Internal server error: " + String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, status } = body

    if (!id || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const publishedAt = status === "published" ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from("news")
      .update({
        title,
        content,
        status,
        published_at: publishedAt,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ news: data })
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

    const { data: images } = await supabase
      .from("news_images")
      .select("image_url")
      .eq("news_id", id)

    if (images) {
      for (const img of images) {
        const fileName = img.image_url.split("/").pop()
        if (fileName) {
          await supabase.storage.from("images").remove([fileName])
        }
      }
    }

    const { error } = await supabase
      .from("news")
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
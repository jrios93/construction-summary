"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Pencil, Upload, Image as ImageIcon, X } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useNews } from "@/lib/hooks/useNews"

export const AdminNewsSection = () => {
  const { t } = useLanguage()
  const { news, loading, addNews, updateNews, deleteNews } = useNews()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages([...images, ...newFiles])
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    if (!title || !content) return

    setIsSaving(true)
    const result = await addNews({ title, content, status: "draft" }, images)
    setIsSaving(false)

    if (result) {
      handleClear()
    }
  }

  const handlePublish = async () => {
    if (!title || !content) return

    setIsSaving(true)
    const result = await addNews({ title, content, status: "published" }, images)
    setIsSaving(false)

    if (result) {
      handleClear()
    }
  }

  const handleClear = () => {
    setTitle("")
    setContent("")
    setImages([])
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    await deleteNews(id)
  }

  const handleEdit = (item: { id: string; title: string; content: string }) => {
    setEditingId(item.id)
    setTitle(item.title)
    setContent(item.content)
  }

  const handleUpdate = async () => {
    if (!title || !content || !editingId) return

    setIsSaving(true)
    const result = await updateNews({ id: editingId, title, content, status: "published" })
    setIsSaving(false)

    if (result) {
      setEditingId(null)
      handleClear()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    handleClear()
  }

  const togglePublish = async (item: { id: string; status: string }) => {
    await updateNews({ 
      id: item.id, 
      title: "", 
      content: "", 
      status: item.status === "published" ? "draft" : "published" 
    })
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-20 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-20 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {editingId ? t.news.editTitle : t.news.title}
        </CardTitle>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.news.newsTitle}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.news.newsTitle + "..."}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.news.content}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.news.content + "..."}
              className="min-h-[120px] text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.news.photos}</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-input cursor-pointer hover:bg-sidebar/50 text-foreground"
              >
                <Upload className="size-4" />
                <span className="text-sm">{t.news.uploadPhotos}</span>
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                capture="environment"
                className="hidden"
                id="camera-upload"
              />
              <label
                htmlFor="camera-upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-input cursor-pointer hover:bg-sidebar/50 text-foreground"
              >
                <ImageIcon className="size-4" />
                <span className="text-sm">{t.news.takePhoto}</span>
              </label>
            </div>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} disabled={isSaving} className="flex-1">
                  {isSaving ? "..." : t.common.update}
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" className="flex-1">{t.common.cancel}</Button>
              </>
            ) : (
              <>
                <Button onClick={handleSaveDraft} disabled={isSaving} variant="outline" className="flex-1">
                  {isSaving ? "..." : t.common.saveDraft}
                </Button>
                <Button onClick={handlePublish} disabled={isSaving} className="flex-1">
                  {isSaving ? "..." : t.common.publish}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {t.news.history}
        </CardTitle>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {news.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.news.noNews}</p>
            ) : (
              news.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-sidebar/50 border border-border"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-foreground font-semibold truncate">{item.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            item.status === "published"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status === "published" ? t.news.published : t.news.draft}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{item.content}</p>
                      {item.images && item.images.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.images.map((img, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded bg-sidebar border border-border flex items-center justify-center"
                            >
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-muted-foreground text-xs mt-2">{formatDate(item.published_at || item.created_at)}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(item)}
                        className="text-muted-foreground hover:text-primary"
                        title={item.status === "published" ? t.common.saveDraft : t.common.publish}
                      >
                        <Upload className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
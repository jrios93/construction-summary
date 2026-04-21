"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Pencil, Upload, Image as ImageIcon, X } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useNews } from "@/lib/hooks/useNews"

export const AdminNewsSection = () => {
  const { t, language } = useLanguage()
  const { news, loading, addNews, updateNews, deleteNews } = useNews()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingImages, setEditingImages] = useState<string[]>([])
  const [addingPhotosToId, setAddingPhotosToId] = useState<string | null>(null)
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addPhotosInputRef = useRef<HTMLInputElement>(null)

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

  const handleAddPhotosToDraft = (item: { id: string; images?: { image_url: string }[] }) => {
    setAddingPhotosToId(item.id)
    setEditingImages(item.images?.map(img => img.image_url) || [])
    setNewPhotos([])
    setNewPhotoPreviews([])
  }

  const handleNewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setNewPhotos([...newPhotos, ...files])
      const previews = files.map(file => URL.createObjectURL(file))
      setNewPhotoPreviews([...newPhotoPreviews, ...previews])
    }
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index))
    setNewPhotoPreviews(newPhotoPreviews.filter((_, i) => i !== index))
  }

  const handleSaveAdditionalPhotos = async () => {
    if (!addingPhotosToId || newPhotos.length === 0) return
    
    setIsSaving(true)
    const newsItem = news.find(n => n.id === addingPhotosToId)
    if (newsItem) {
      await updateNews({ 
        id: addingPhotosToId, 
        title: newsItem.title, 
        content: newsItem.content, 
        status: "draft" 
      }, newPhotos)
    }
    setIsSaving(false)
    setAddingPhotosToId(null)
    setNewPhotos([])
    setNewPhotoPreviews([])
    setEditingImages([])
  }

  const handleCancelAddPhotos = () => {
    setAddingPhotosToId(null)
    setNewPhotos([])
    setNewPhotoPreviews([])
    setEditingImages([])
  }

  const handleSaveDraft = async () => {
    if (!content) return

    setIsSaving(true)
    const result = await addNews({ title, content, status: "draft" }, images)
    setIsSaving(false)

    if (result) {
      handleClear()
    }
  }

  const handlePublish = async () => {
    if (!content) return

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
    if (!content || !editingId) return

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

  const togglePublish = async (item: { id: string; title: string; content: string; status: string }) => {
    await updateNews({ 
      id: item.id, 
      title: item.title || "", 
      content: item.content || "", 
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
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-xl font-semibold text-foreground">{t.news.newsTitle}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.news.newsTitle + "..."}
              className="flex h-14 w-full rounded-lg border border-input bg-transparent px-4 py-3 text-xl shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xl font-semibold text-foreground">{t.news.content}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.news.content + "..."}
              className="min-h-[160px] text-xl py-4 text-foreground"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xl font-semibold text-foreground">{t.news.photos}</label>
            <div className="flex flex-wrap gap-3">
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
                className="flex items-center gap-3 px-6 py-4 rounded-lg border border-dashed border-input cursor-pointer hover:bg-sidebar/50 text-xl font-medium text-foreground min-h-[56px]"
              >
                <Upload className="size-6" />
                <span className="text-xl">{t.news.uploadPhotos}</span>
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
                className="flex items-center gap-3 px-6 py-4 rounded-lg border border-dashed border-input cursor-pointer hover:bg-sidebar/50 text-xl font-medium text-foreground min-h-[56px]"
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
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} disabled={isSaving} className="flex-1 text-xl py-6 font-semibold">
                  {isSaving ? "..." : t.common.update}
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" className="flex-1 text-xl py-6 font-semibold">{t.common.cancel}</Button>
              </>
            ) : (
              <>
                <Button onClick={handleSaveDraft} disabled={isSaving} variant="outline" className="flex-1 text-xl py-6 font-semibold">
                  {isSaving ? "..." : t.common.saveDraft}
                </Button>
                <Button onClick={handlePublish} disabled={isSaving} className="flex-1 text-xl py-6 font-semibold">
                  {isSaving ? "..." : t.common.publish}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {addingPhotosToId ? (
          <Card className="p-4 md:p-6 border-border">
            <CardTitle className="text-xl font-semibold text-foreground mb-4">
              {language === "es" ? "Agregar fotos al borrador" : "Add photos to draft"}
            </CardTitle>
            <CardContent className="space-y-4">
              {editingImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editingImages.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  ref={addPhotosInputRef}
                  onChange={handleNewPhotoChange}
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="hidden"
                  id="add-photos-upload"
                />
                <label
                  htmlFor="add-photos-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-input cursor-pointer hover:bg-sidebar/50 text-foreground"
                >
                  <Upload className="size-4" />
                  <span className="text-sm">{language === "es" ? "Agregar más fotos" : "Add more photos"}</span>
                </label>
              </div>
              {newPhotoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newPhotoPreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img src={preview} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                      <button onClick={() => removeNewPhoto(i)} className="absolute -top-2 -right-2 bg-destructive rounded-full p-1">
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSaveAdditionalPhotos} disabled={isSaving || newPhotos.length === 0}>
                  {isSaving ? "..." : language === "es" ? "Guardar fotos" : "Save photos"}
                </Button>
                <Button onClick={handleCancelAddPhotos} variant="outline">
                  {t.common.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-4 md:p-6 border-border">
            <CardTitle className="text-xl font-semibold text-foreground mb-4">
              {t.news.history}
            </CardTitle>
            <CardContent>
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {news.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t.news.noNews}</p>
                ) : (
                  <>
                    {news.filter(n => n.status === "draft").length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase">
                          {language === "es" ? "Borradores" : "Drafts"} ({news.filter(n => n.status === "draft").length})
                        </h4>
                        <div className="space-y-3">
                          {news.filter(n => n.status === "draft").map((item) => (
                            <div key={item.id} className="p-3 rounded-lg bg-sidebar/50 border border-border">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground text-sm line-clamp-2">{item.content}</p>
                                  {item.images && item.images.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {item.images.map((img, i) => (
                                        <img key={i} src={img.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-muted-foreground text-xs mt-1">{formatDate(item.created_at)}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="icon" onClick={() => handleAddPhotosToDraft(item)} title={language === "es" ? "Agregar fotos" : "Add photos"}>
                                    <ImageIcon className="size-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => togglePublish(item)} title={t.common.publish} className="text-green-500 hover:text-green-400">
                                    <Upload className="size-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-500">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {news.filter(n => n.status === "published").length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-2 uppercase">
                          {language === "es" ? "Publicados" : "Published"} ({news.filter(n => n.status === "published").length})
                        </h4>
                        <div className="space-y-3">
                          {news.filter(n => n.status === "published").map((item) => (
                            <div key={item.id} className="p-3 rounded-lg bg-sidebar/30 border border-border">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-foreground font-semibold truncate text-sm">{item.title || "(Sin título)"}</h3>
                                  <p className="text-muted-foreground text-sm line-clamp-2">{item.content}</p>
                                  {item.images && item.images.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {item.images.map((img, i) => (
                                        <img key={i} src={img.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-muted-foreground text-xs mt-1">{formatDate(item.published_at)}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-foreground">
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => togglePublish(item)} title={t.common.saveDraft} className="text-muted-foreground hover:text-yellow-500">
                                    <Upload className="size-4 rotate-180" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
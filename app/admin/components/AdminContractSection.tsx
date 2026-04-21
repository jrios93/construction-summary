"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useContractDocuments } from "@/lib/hooks/useContractDocuments"
import { toast } from "sonner"
import { Upload, Trash2, FileText, X, Files } from "lucide-react"

export const AdminContractSection = () => {
  const { t, language } = useLanguage()
  const { documents, loading, addDocument, deleteDocument } = useContractDocuments()
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    setDescription("")
    setFiles([])
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async () => {
    if (files.length === 0) return

    setIsSaving(true)
    const result = await addDocument(description, files)
    setIsSaving(false)
    
    if (!result) {
      toast.error(language === "es" ? "Error al guardar" : "Error saving")
    } else {
      toast.success(language === "es" ? "Documento guardado" : "Document saved")
      handleClear()
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    const success = await deleteDocument(itemToDelete)
    setDeleteDialogOpen(false)
    setItemToDelete(null)
    if (success) {
      toast.success(language === "es" ? "Documento eliminado" : "Document deleted")
    } else {
      toast.error(language === "es" ? "Error al eliminar" : "Error deleting")
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="size-8 text-muted-foreground" />
    const ext = fileType.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <FileText className="size-8 text-blue-500" />
    }
    if (["pdf"].includes(ext)) {
      return <FileText className="size-8 text-red-500" />
    }
    if (["doc", "docx"].includes(ext)) {
      return <FileText className="size-8 text-blue-700" />
    }
    if (["xls", "xlsx"].includes(ext)) {
      return <FileText className="size-8 text-green-600" />
    }
    return <FileText className="size-8 text-muted-foreground" />
  }

  const titleText = language === "es" ? "Documentos de Contrato" : "Contract Documents"

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-4 md:p-6 border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sidebar/50 rounded w-1/3"></div>
            <div className="h-20 bg-sidebar/50 rounded"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-2xl font-semibold text-foreground mb-4">
          {titleText}
        </CardTitle>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xl font-semibold text-foreground">
              {language === "es" ? "Descripción (opcional)" : "Description (optional)"}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === "es" ? "Agrega una descripción..." : "Add a description..."}
              className="min-h-[100px] text-xl py-4 text-foreground"
            />
          </div>

<div className="space-y-3">
              <Label className="text-xl font-semibold text-foreground">
                {language === "es" ? "Archivos" : "Files"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === "es" ? "Selecciona uno o más archivos" : "Select one or more files"}
              </p>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="text-lg text-foreground file:text-xl file:font-medium"
              />
            </div>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    {files[index]?.type?.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-border" />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center rounded-lg border border-border bg-sidebar/50">
                        <FileText className="size-12 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || files.length === 0}
            className="w-full text-xl py-6 font-semibold"
          >
            {isSaving ? "..." : language === "es" ? "Guardar Documento" : "Save Document"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-6 border-border">
        <CardTitle className="text-xl font-semibold text-foreground mb-4">
          {language === "es" ? "Documentos Subidos" : "Uploaded Documents"} ({documents.length})
        </CardTitle>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-lg">
              {language === "es" ? "No hay documentos subidos" : "No documents uploaded"}
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const hasMultiple = doc.attachments && doc.attachments.length > 1
                return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row items-start justify-between gap-3 p-4 rounded-lg bg-sidebar/50 border border-border"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                    {hasMultiple ? (
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-border bg-sidebar flex-shrink-0">
                        <Files className="size-8 text-primary" />
                      </div>
                    ) : (
                      getFileIcon(doc.attachments?.[0]?.file_type)
                    )}
                    <div className="min-w-0 flex-1 w-full overflow-hidden">
                      <p className="text-lg font-medium text-foreground truncate w-full">
                        {hasMultiple 
                          ? (language === "es" ? "Documentos varios" : "Various documents")
                          : (doc.attachments?.[0]?.file_name || doc.file_name)
                        }
                      </p>
                      {doc.description && (
                        <p className="text-base text-muted-foreground whitespace-pre-wrap break-words">{doc.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{formatDate(doc.created_at)}</p>
                      {hasMultiple && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.attachments?.map((att) => (
                            <span key={att.id} className="text-xs bg-sidebar px-2 py-1 rounded text-muted-foreground truncate max-w-[200px]">
                              {att.file_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {hasMultiple ? (
                      doc.attachments?.map((att) => (
                        <Button
                          key={att.id}
                          variant="default"
                          className="text-lg py-5 px-5 font-semibold"
                          onClick={() => window.open(att.file_url, "_blank")}
                        >
                          {language === "es" ? "Ver" : "View"}
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="default"
                        className="text-lg py-5 px-5 font-semibold"
                        onClick={() => window.open(doc.attachments?.[0]?.file_url || doc.file_url, "_blank")}
                      >
                        {language === "es" ? "Ver" : "View"}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="text-lg py-5 px-5 font-semibold"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === "es" ? "¿Eliminar documento?" : "Delete document?"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {language === "es" 
                ? "Esta acción no se puede deshacer." 
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {language === "es" ? "Eliminar" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
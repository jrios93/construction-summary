"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useContractDocuments } from "@/lib/hooks/useContractDocuments"
import { FileText, Download, ChevronLeft, ChevronRight, ExternalLink, Files } from "lucide-react"

interface Attachment {
  id: string
  file_url: string
  file_name: string
  file_type: string
  created_at: string
}

interface Document {
  id: string
  description: string
  created_at: string
  attachments?: Attachment[]
}

export const ContractSection = () => {
  const { t, language } = useLanguage()
  const { documents, loading } = useContractDocuments()
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 3

  if (loading) {
    return null
  }

  if (documents.length === 0) {
    return null
  }

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const displayDocuments: Document[] = documents.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const titleText = language === "es" ? "Documentos de Contrato" : "Contract Documents"

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="size-6 text-muted-foreground" />
    const ext = fileType.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <FileText className="size-6 text-blue-500" />
    }
    if (["pdf"].includes(ext)) {
      return <FileText className="size-6 text-red-500" />
    }
    if (["doc", "docx"].includes(ext)) {
      return <FileText className="size-6 text-blue-700" />
    }
    if (["xls", "xlsx"].includes(ext)) {
      return <FileText className="size-6 text-green-600" />
    }
    return <FileText className="size-6 text-muted-foreground" />
  }

  const hasMultipleAttachments = (doc: Document) => {
    return doc.attachments && doc.attachments.length > 1
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-16">
        <div className="w-fit">
          <h2 className="text-3xl font-semibold text-nowrap">{titleText}</h2>
        </div>
        <div className="border border-neutral-300 w-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayDocuments.map((doc) => (
          <Card key={doc.id} className="p-6">
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4 items-start min-w-0 flex-1 w-full">
                  {hasMultipleAttachments(doc) ? (
                    <Card className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
                      <CardContent className="flex flex-col items-center gap-1">
                        <Files className="size-8 md:size-10 text-primary" />
                        <span className="text-xs text-muted-foreground">{doc.attachments?.length}</span>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
                      <CardContent className="flex flex-col items-center gap-1">
                        {getFileIcon(doc.attachments?.[0]?.file_type)}
                        <span className="text-xs text-muted-foreground uppercase">{doc.attachments?.[0]?.file_type || ""}</span>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex flex-col gap-1 min-w-0 flex-1 w-full overflow-hidden">
                    <p className="text-xl md:text-2xl font-semibold text-foreground truncate w-full">
                      {hasMultipleAttachments(doc)
                        ? (language === "es" ? "Documentos varios" : "Various documents")
                        : (doc.attachments?.[0]?.file_name || "")
                      }
                    </p>
                    {doc.description && (
                      <p className="text-base md:text-lg text-muted-foreground whitespace-pre-wrap break-words">{doc.description}</p>
                    )}
                    <span className="text-base text-muted-foreground">{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>

              {hasMultipleAttachments(doc) ? (
                <div className="flex flex-col gap-2 w-full">
                  {doc.attachments?.map((attachment, index) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 rounded-lg bg-sidebar/50 border border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(attachment.file_type)}
                        <span className="text-base text-foreground truncate">{attachment.file_name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.file_url, "_blank")}
                        className="flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="size-4" />
                        {language === "es" ? "Descargar" : "Download"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Button
                  className="text-xl bg-accent/50 font-semibold py-6 px-6 text-primary rounded-lg hover:bg-accent-foreground hover:text-secondary cursor-pointer transition-colors w-full sm:w-auto text-center flex items-center gap-2"
                  onClick={() => window.open(doc.attachments?.[0]?.file_url || "", "_blank")}
                >
                  <ExternalLink className="size-6" />
                  {language === "es" ? "Ver documento" : "View document"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="text-lg py-6"
            >
              <ChevronLeft className="size-5" />
              {language === "es" ? "Anterior" : "Previous"}
            </Button>
            <span className="flex items-center text-muted-foreground text-lg">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="text-lg py-6"
            >
              {language === "es" ? "Siguiente" : "Next"}
              <ChevronRight className="size-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useNews } from "@/lib/hooks/useNews"
import { Download, Loader2 } from "lucide-react"
import { ImageGallery } from "./ImageGallery"
import JSZip from "jszip"

export const NewSection = () => {
  const { t, language } = useLanguage()
  const { news, loading } = useNews()
  const [currentPage, setCurrentPage] = useState(0)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 3

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-16">
          <div className="w-fit ">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="border border-neutral-300 w-full"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-card rounded-lg animate-pulse h-40"></div>
        </div>
      </div>
    )
  }

  const publishedNews = news.filter(n => n.status === "published")

  if (publishedNews.length === 0) {
    return null
  }

  const totalPages = Math.ceil(publishedNews.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const displayNews = publishedNews.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const downloadAllImages = async (images: { image_url: string }[], newsId: string) => {
    if (images.length === 0) return
    
    setDownloadingId(newsId)
    
    try {
      if (images.length === 1) {
        const link = document.createElement('a')
        link.href = images[0].image_url
        link.download = `foto-${newsId}.jpg`
        link.target = '_blank'
        link.click()
      } else {
        const zip = new JSZip()
        const folder = zip.folder("fotos-obra")
        
        const fetchPromises = images.map(async (img, i) => {
          const response = await fetch(img.image_url)
          const blob = await response.blob()
          const ext = blob.type.includes('png') ? 'png' : 'jpg'
          folder?.file(`foto-${i + 1}.${ext}`, blob)
        })
        
        await Promise.all(fetchPromises)
        
        const zipBlob = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `fotos-obra-${newsId}.zip`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading:", error)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-4" >
      <div className="flex items-center gap-16">
        <div className="w-fit ">
          <h2 className="text-3xl font-semibold text-nowrap ">{t.home.newsTitle}</h2>
        </div>
        <div className="border border-neutral-300 w-full"></div>
      </div>

      <div className="grid grid-cols-1  gap-4">
        {displayNews.map((item) => (
          <Card key={item.id} className="p-6">
            <CardTitle className="text-xl md:text-2xl text-primary mb-2">{formatDate(item.published_at)}</CardTitle>
            <CardContent className="space-y-3">
              {item.title && <p className="text-lg md:text-xl font-semibold text-foreground">{item.title}</p>}
              <p className="text-lg md:text-xl leading-relaxed text-foreground">{item.content}</p>
              {item.images && item.images.length > 0 && (
                <ImageGallery images={item.images} />
              )}
            </CardContent>
            {item.images && item.images.length > 0 && (
              <CardFooter className="bg-card flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="default" 
                  className="text-primary bg-accent/50 cursor-pointer text-xl font-semibold py-6 px-6 rounded-lg hover:bg-accent transition-colors w-full sm:w-auto text-center disabled:opacity-50" 
                  aria-label="Descargar fotos"
                  onClick={() => downloadAllImages(item.images, item.id)}
                  disabled={downloadingId === item.id}
                >
                  {downloadingId === item.id ? (
                    <><Loader2 className="mr-2 size-6 animate-spin" /> {language === "es" ? "Descargando..." : "Downloading..."}</>
                  ) : (
                    <><Download className="mr-2 size-6" /> {t.common.downloadPhotos} ({item.images.length})</>
                  )}
                </Button>
              </CardFooter>
            )}
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
              Anterior
            </Button>
            <span className="flex items-center text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <Button 
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="text-lg py-6"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
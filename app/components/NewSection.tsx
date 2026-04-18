"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { useNews } from "@/lib/hooks/useNews"
import { Download } from "lucide-react"
import { ImageGallery } from "./ImageGallery"

export const NewSection = () => {
  const { t } = useLanguage()
  const { news, loading } = useNews()
  const [currentPage, setCurrentPage] = useState(0)
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

  const downloadAllImages = (images: { image_url: string }[]) => {
    images.forEach((img, i) => {
      const link = document.createElement('a')
      link.href = img.image_url
      link.download = `image-${i + 1}.jpg`
      link.target = '_blank'
      link.click()
    })
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
            <CardTitle className="text-base md:text-xl text-primary">{formatDate(item.published_at)}</CardTitle>
            <CardContent className="space-y-4">
              <p className="text-lg md:text-2xl leading-relaxed">{item.content}</p>
              {item.images && item.images.length > 0 && (
                <ImageGallery images={item.images} />
              )}
            </CardContent>
            {item.images && item.images.length > 0 && (
              <CardFooter className="bg-card">
                <Button 
                  variant="default" 
                  className="text-primary bg-accent/50 cursor-pointer text-lg font-medium py-6 px-4 rounded-lg hover:bg-accent transition-colors w-full sm:w-auto text-center" 
                  aria-label="Descargar fotos"
                  onClick={() => downloadAllImages(item.images)}
                >
                  <Download className="mr-2 size-5" />
                  {t.common.downloadPhotos}
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
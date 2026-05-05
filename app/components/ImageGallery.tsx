"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageGalleryProps {
  images: { image_url: string; image_name?: string }[]
  initialIndex?: number
}

export function ImageGallery({ images, initialIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [visibleCount, setVisibleCount] = useState(2)
  const displayedImages = images.slice(0, 5)

  const goToPrevious = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length, isLoading])

  const goToNext = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length, isLoading])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleThumbnailLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index))
    // Load next batch after current loads
    setVisibleCount(prev => Math.min(prev + 2, displayedImages.length))
  }, [])

  const allImagesLoaded = loadedImages.size === displayedImages.length

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          goToNext()
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, goToPrevious, goToNext])

  if (images.length === 0) return null

  const openGallery = (index: number) => {
    if (!allImagesLoaded) return
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeGallery = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Thumbnail grid */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {displayedImages.slice(0, visibleCount).map((img, i) => (
          <div
            key={i}
            onClick={() => loadedImages.has(i) && openGallery(i)}
            className={`relative cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ${!loadedImages.has(i) ? 'pointer-events-none' : ''}`}
          >
            {!loadedImages.has(i) && (
              <div className="w-[120px] h-[90px] rounded-lg bg-muted animate-pulse" />
            )}
            <Image
              src={img.image_url}
              alt={img.image_name || `Image ${i + 1}`}
              width={120}
              height={90}
              className={`rounded-lg object-cover ${!loadedImages.has(i) ? 'invisible' : ''}`}
              unoptimized
              loading="lazy"
              onLoad={() => handleThumbnailLoad(i)}
            />
            {loadedImages.has(i) && i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
        {/* Show skeletons for not-yet-visible images */}
        {Array.from({ length: Math.max(0, displayedImages.length - visibleCount) }).map((_, i) => (
          <div key={`skeleton-${i}`} className="w-[120px] h-[90px] rounded-lg bg-muted animate-pulse flex-shrink-0" />
        ))}
      </div>

      {/* Modal Gallery */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeGallery()
          }}
        >
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-8" />
          </button>

          <button
            onClick={goToPrevious}
            disabled={isLoading}
            className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="size-12" />
          </button>

          <div className="max-w-4xl max-h-[80vh] px-16">
            <Image
              key={currentIndex}
              src={images[currentIndex].image_url}
              alt={images[currentIndex].image_name || `Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
              unoptimized
              onLoad={handleImageLoad}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <p className="text-center text-white mt-4">
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <button
            onClick={goToNext}
            disabled={isLoading}
            className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronRight className="size-12" />
          </button>
        </div>
      )}
    </>
  )
}
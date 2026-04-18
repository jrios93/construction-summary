"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageGalleryProps {
  images: { image_url: string; image_name?: string }[]
  initialIndex?: number
}

export function ImageGallery({ images, initialIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isOpen, setIsOpen] = useState(false)

  if (images.length === 0) return null

  const openGallery = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Thumbnail grid */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.slice(0, 5).map((img, i) => (
          <div
            key={i}
            onClick={() => openGallery(i)}
            className="relative cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <Image
              src={img.image_url}
              alt={img.image_name || `Image ${i + 1}`}
              width={120}
              height={90}
              className="rounded-lg object-cover"
              unoptimized
            />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Gallery */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <X className="size-8" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <ChevronLeft className="size-12" />
          </button>

          <div className="max-w-4xl max-h-[80vh] px-16">
            <Image
              src={images[currentIndex].image_url}
              alt={images[currentIndex].image_name || `Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
              unoptimized
            />
            <p className="text-center text-white mt-4">
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <ChevronRight className="size-12" />
          </button>
        </div>
      )}
    </>
  )
}
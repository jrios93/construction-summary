"use client"

import { useState, useEffect } from "react"

export function LazySection({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

import { useState, useEffect } from "react"

interface NewsImage {
  id: string
  news_id: string
  image_url: string
  image_name?: string
  created_at?: string
}

interface NewsItem {
  id: string
  title: string
  content: string
  status: "draft" | "published"
  published_at?: string
  created_at: string
  images: NewsImage[]
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/news")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setNews(data.news)
      }
    } catch (err) {
      setError("Failed to fetch news")
    } finally {
      setLoading(false)
    }
  }

  const addNews = async (newsData: { title: string; content: string; status: string }, images?: File[]) => {
    try {
      const formData = new FormData()
      formData.append("title", newsData.title)
      formData.append("content", newsData.content)
      formData.append("status", newsData.status)
      if (images) {
        images.forEach(img => formData.append("images", img))
      }

      const res = await fetch("/api/news", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return null
      }
      await fetchNews()
      return data.news
    } catch (err) {
      setError("Failed to add news")
      return null
    }
  }

  const updateNews = async (newsData: { id: string; title: string; content: string; status: string }) => {
    try {
      const res = await fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsData)
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return null
      }
      await fetchNews()
      return data.news
    } catch (err) {
      setError("Failed to update news")
      return null
    }
  }

  const deleteNews = async (id: string) => {
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return false
      }
      await fetchNews()
      return true
    } catch (err) {
      setError("Failed to delete news")
      return false
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { news, loading, error, addNews, updateNews, deleteNews, refetch: fetchNews }
}
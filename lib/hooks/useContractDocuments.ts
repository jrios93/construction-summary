import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface ContractAttachment {
  id: string
  file_url: string
  file_name: string
  file_type: string
  created_at: string
}

interface ContractDocument {
  id: string
  description: string
  file_url?: string
  file_name?: string
  file_type?: string
  created_at: string
  attachments?: ContractAttachment[]
}

export function useContractDocuments() {
  const [documents, setDocuments] = useState<ContractDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/contracts")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setDocuments(data.documents || [])
      }
    } catch (err) {
      setError("Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }

  const addDocument = async (description: string, files: File[]) => {
    try {
      const formData = new FormData()
      if (description) formData.append("description", description)
      files.forEach(file => formData.append("files", file))

      const res = await fetch("/api/contracts", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return null
      }
      await fetchDocuments()
      return data.documents
    } catch (err) {
      setError("Failed to add document")
      return null
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/contracts?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return false
      }
      await fetchDocuments()
      return true
    } catch (err) {
      setError("Failed to delete document")
      return false
    }
  }

  useEffect(() => {
    fetchDocuments()

    const channel = supabase.channel('contract-docs')
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'contract_documents' }, () => {
      fetchDocuments()
    })
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'contract_attachments' }, () => {
      fetchDocuments()
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { documents, loading, error, addDocument, deleteDocument, refetch: fetchDocuments }
}
"use client"

import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/AdminSidebar"
import { AdminBudgetSection } from "./components/AdminBudgetSection"
import { AdminExpensesSection } from "./components/AdminExpensesSection"
import { AdminNewsSection } from "./components/AdminNewsSection"
import { AdminContractSection } from "./components/AdminContractSection"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ConstructionProgress } from "@/components/ConstructionProgress"
import { useProgress } from "@/lib/hooks/useProgress"
import { useState } from "react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { toast } from "sonner"

function AdminPageContent({ 
  activeSection, 
  progressData, 
  progressLoading, 
  handleSaveProgress
}: { 
  activeSection: string
  progressData: { progress: number; milestones: { id: string; label: string; threshold: number }[] } | null
  progressLoading: boolean
  handleSaveProgress: (progress: number, milestones: { id: string; label: string; threshold: number }[]) => Promise<void>
}) {
  const { t } = useLanguage()

  const renderSection = () => {
    switch (activeSection) {
      case "budget":
        return <AdminBudgetSection />
      case "expenses":
        return <AdminExpensesSection />
      case "contracts":
        return <AdminContractSection />
      case "news":
        return <AdminNewsSection />
      case "progress":
        return (
          <ConstructionProgress 
            mode="admin" 
            progress={progressLoading ? 42 : (progressData?.progress ?? 42)} 
            milestones={progressLoading ? undefined : (progressData?.milestones ?? undefined)} 
            onSave={handleSaveProgress} 
          />
        )
      default:
        return <AdminBudgetSection />
    }
  }

  const getTitle = () => {
    switch (activeSection) {
      case "budget":
        return t.nav.budget
      case "expenses":
        return t.nav.expenses
      case "contracts":
        return t.nav.contracts
      case "news":
        return t.nav.news
      case "progress":
        return t.home.progressTitle
      default:
        return "Admin"
    }
  }

  return (
    <SidebarInset>
      <div className="dark min-h-screen bg-background">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <SidebarTrigger className="md:hidden !h-16 !w-16 [&>svg]:size-10 !p-4 text-foreground animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground px-10">{getTitle()}</h1>
          <div className="w-16 md:hidden"></div>
        </div>
        <div className="container mx-auto space-y-6 pb-10 px-4 mt-10">
          {renderSection()}
        </div>
      </div>
    </SidebarInset>
  )
}

function AdminContent() {
  const [activeSection, setActiveSection] = useState("budget")
  const { data, loading, saveProgress } = useProgress()

  const handleSaveProgress = async (progress: number, milestones: { id: string; label: string; threshold: number }[]) => {
    const cleanMilestones = milestones.map((m) => ({ label: m.label, threshold: m.threshold }))
    const success = await saveProgress(progress, cleanMilestones)
    if (success) {
      toast.success("Cambios guardados correctamente")
    } else {
      toast.error("Error al guardar cambios")
    }
  }

  return (
    <>
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <AdminPageContent 
        activeSection={activeSection} 
        progressData={data} 
        progressLoading={loading} 
        handleSaveProgress={handleSaveProgress}
      />
    </>
  )
}

export default function AdminPage() {
  return (
    <LanguageProvider defaultLanguage="es">
      <SidebarProvider defaultOpen={true}>
        <AdminContent />
      </SidebarProvider>
    </LanguageProvider>
  )
}
"use client"

import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/AdminSidebar"
import { AdminBudgetSection } from "./components/AdminBudgetSection"
import { AdminExpensesSection } from "./components/AdminExpensesSection"
import { AdminNewsSection } from "./components/AdminNewsSection"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import { useLanguage } from "@/components/providers/LanguageProvider"

function AdminPageContent({ activeSection }: { activeSection: string }) {
  const { t } = useLanguage()

  const renderSection = () => {
    switch (activeSection) {
      case "budget":
        return <AdminBudgetSection />
      case "expenses":
        return <AdminExpensesSection />
      case "news":
        return <AdminNewsSection />
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
      case "news":
        return t.nav.news
      default:
        return "Admin"
    }
  }

  return (
    <SidebarInset>
      <div className="dark min-h-screen bg-background">
        <div className="flex items-center justify-center w-full py-4">
          <SidebarTrigger className="md:hidden !h-20 !w-20 [&>svg]:size-8" />
        </div>
        <div className="container mx-auto space-y-6 pb-10 px-4">
          <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
          {renderSection()}
        </div>
      </div>
    </SidebarInset>
  )
}

function AdminContent() {
  const [activeSection, setActiveSection] = useState("budget")

  return (
    <>
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <AdminPageContent activeSection={activeSection} />
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
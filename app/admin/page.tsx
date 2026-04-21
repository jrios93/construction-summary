"use client"

import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/AdminSidebar"
import { AdminBudgetSection } from "./components/AdminBudgetSection"
import { AdminExpensesSection } from "./components/AdminExpensesSection"
import { AdminNewsSection } from "./components/AdminNewsSection"
import { AdminContractSection } from "./components/AdminContractSection"
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
      case "contracts":
        return <AdminContractSection />
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
      case "contracts":
        return t.nav.contracts
      case "news":
        return t.nav.news
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

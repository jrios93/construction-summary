"use client"

import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { WalletIcon, ReceiptIcon, NewspaperIcon, Languages } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { language, setLanguage, t } = useLanguage()

  const handleSectionClick = (section: string) => {
    onSectionChange(section)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const items = [
    {
      title: t.nav.budget,
      url: "#",
      icon: WalletIcon,
      section: "budget",
    },
    {
      title: t.nav.expenses,
      url: "#",
      icon: ReceiptIcon,
      section: "expenses",
    },
    {
      title: t.nav.news,
      url: "#",
      icon: NewspaperIcon,
      section: "news",
    },
  ]

  return (
    <Sidebar className="dark">
      <SidebarHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Image
            src="/assets/images/logo2.png"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-lg"
          />
          <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/30 text-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Languages className="size-4" />
            <span className="text-sm font-medium">{language.toUpperCase()}</span>
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.section}>
              <SidebarMenuButton
                asChild
                isActive={activeSection === item.section}
                onClick={() => handleSectionClick(item.section)}
                className="text-base py-3"
              >
                <button className="flex items-center gap-3 w-full">
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
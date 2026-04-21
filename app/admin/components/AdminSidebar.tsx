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
    <Sidebar className="dark w-72">
      <SidebarHeader>
        <div className="flex flex-col items-center gap-4 py-6">
          <Image
            src="/assets/images/logo2.png"
            alt="Logo"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="flex items-center gap-3 px-6 py-3 rounded-lg bg-sidebar-accent/40 text-lg font-semibold hover:bg-sidebar-accent/60 transition-colors min-h-[56px]"
          >
            <Languages className="size-6 text-foreground" />
            <span className="text-xl text-foreground">{language === "es" ? "ES" : "EN"}</span>
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
                className="text-xl text-foreground"
              >
                <button className="flex items-center gap-4 w-full py-5 px-4 min-h-[72px]">
                  <item.icon className="size-7" />
                  <span className="text-xl">{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

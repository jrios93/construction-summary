"use client"

import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HomeIcon, FileTextIcon, WalletIcon } from "lucide-react"

const items = [
  {
    title: "Presupuesto",
    url: "#",
    icon: WalletIcon,
    section: "budget",
  },
  {
    title: "Novedades",
    url: "#",
    icon: FileTextIcon,
    section: "new",
  },
  {
    title: "Detalle de gasto",
    url: "#",
    icon: HomeIcon,
    section: "register-spent",
  },
]

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleSectionClick = (section: string) => {
    onSectionChange(section)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center py-4">
          <Image
            src="/assets/images/logo2.png"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-lg"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

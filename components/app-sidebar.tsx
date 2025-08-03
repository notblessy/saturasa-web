"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { LayoutDashboard, Package, Users, Settings, ChevronDown, Factory, ClipboardList, Cog } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventories",
    icon: Package,
    items: [
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "BOM/Recipes",
        url: "/dashboard/bom",
        icon: ClipboardList,
      },
      {
        title: "Productions",
        url: "/dashboard/productions",
        icon: Factory,
      },
      {
        title: "Product Settings",
        url: "/dashboard/product-settings",
        icon: Cog,
      },
    ],
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([]) // Default collapsed

  const toggleItem = (title: string) => {
    setOpenItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (url: string) => pathname === url

  return (
    <Sidebar className="border-r border-purple-100">
      <SidebarHeader className="border-b border-purple-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">sa</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            saturasa
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible open={openItems.includes(item.title)} onOpenChange={() => toggleItem(item.title)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                <Link href={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

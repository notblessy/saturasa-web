"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/saturasui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/saturasui/collapsible";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronDown,
  Factory,
  ClipboardList,
  Cog,
  Database,
  DollarSign,
  Calculator,
  Settings2,
  FileText,
  ShoppingCart,
  ReceiptText,
} from "lucide-react";
import { useSidebar } from "@/components/saturasui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Master Data",
    icon: Database,
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
        title: "Product Settings",
        url: "/dashboard/product-settings",
        icon: Cog,
      },
    ],
  },
  {
    title: "Purchase Invoices",
    url: "/dashboard/purchase-orders",
    icon: ReceiptText,
  },
  {
    title: "Inventories",
    url: "/dashboard/inventories",
    icon: Package,
  },
  {
    title: "Productions",
    url: "/dashboard/productions",
    icon: Factory,
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: Users,
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "General",
        url: "/dashboard/settings",
        icon: Settings2,
      },
      {
        title: "Chart of Accounts",
        url: "/dashboard/settings/chart-of-accounts",
        icon: Calculator,
      },
      {
        title: "Document Templates",
        url: "/dashboard/settings/document-templates",
        icon: FileText,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]); // Default collapsed

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => pathname === url;

  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 min-w-0 h-full">
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <img
              src="/saturasa-min.png"
              alt="saturasa logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-semibold text-xs text-primary group-data-[collapsible=icon]:hidden truncate">
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
                    <Collapsible
                      open={openItems.includes(item.title)}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between group-data-[collapsible=icon]:justify-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-200 shrink-0 group-data-[collapsible=icon]:hidden",
                              openItems.includes(item.title) && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                              >
                                <Link
                                  href={subItem.url}
                                  className="flex items-center gap-2 min-w-0"
                                >
                                  <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.title}</span>
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
  );
}

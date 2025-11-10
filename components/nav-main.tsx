"use client"

import { ChevronRight } from "lucide-react"
import * as React from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import type { MenuItem } from "@/lib/menu"

export function NavMain({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarMenu />
      </SidebarGroup>
    )
  }
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const childMatches = !!item.items && item.items.some((sub) =>
            (sub.url && pathname.startsWith(sub.url)) ||
            (!!sub.items && sub.items.some((ss) => !!ss.url && pathname.startsWith(ss.url)))
          )
          const shouldBeOpen = !!item.isActive || childMatches

          return (
            <Collapsible
              key={`${item.title}-${shouldBeOpen ? "open" : "closed"}`}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const hasNested = Array.isArray(subItem.items) && subItem.items.length > 0
                      if (!hasNested) {
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url ?? "#"}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      }

                      const subShouldBeOpen = !!subItem.items?.some((ss) => !!ss.url && pathname.startsWith(ss.url))
                      return (
                        <Collapsible
                          key={`${subItem.title}-${subShouldBeOpen ? "open" : "closed"}`}
                          asChild
                          defaultOpen={subShouldBeOpen}
                          className="group/collapsible"
                        >
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton asChild>
                                <button type="button" className="flex w-full items-center gap-2">
                                  <span>{subItem.title}</span>
                                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </button>
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {subItem.items?.map((ss) => (
                                  <SidebarMenuSubItem key={ss.title}>
                                    <SidebarMenuSubButton asChild>
                                      <a href={ss.url ?? "#"}>
                                        <span>{ss.title}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
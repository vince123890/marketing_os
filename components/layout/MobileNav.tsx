"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, CalendarDays, Bookmark, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/modules", label: "Modul", icon: BookOpen },
  { href: "/daily-log", label: "Log", icon: CalendarDays },
  { href: "/bookmarks", label: "Simpan", icon: Bookmark },
  { href: "/settings/subscription", label: "Akun", icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40 safe-b">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors",
                active ? "text-brand-600" : "text-neutral-400"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

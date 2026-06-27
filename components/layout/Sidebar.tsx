"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Bookmark,
  Settings,
  LogOut,
  Flame,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SidebarProps {
  user: { name: string; email: string; streak_count: number; current_plan: string; is_admin?: boolean }
  progress: { completed: number; percentage: number }
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modul Belajar", icon: BookOpen },
  { href: "/daily-log", label: "Daily Log", icon: CalendarDays },
  { href: "/bookmarks", label: "Tersimpan", icon: Bookmark },
  { href: "/settings/ai", label: "AI Coach", icon: Sparkles },
  { href: "/settings/subscription", label: "Langganan", icon: Settings },
]

export default function Sidebar({ user, progress }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Berhasil logout")
    router.push("/login")
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-white border-r border-neutral-200 fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-neutral-800 text-sm">MarketingOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-neutral-400"} />
              {item.label}
            </Link>
          )
        })}

        {user.is_admin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === "/admin" || pathname.startsWith("/admin/")
                ? "bg-brand-50 text-brand-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
            )}
          >
            <ShieldCheck
              size={18}
              className={pathname.startsWith("/admin") ? "text-brand-600" : "text-neutral-400"}
            />
            Admin
          </Link>
        )}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-neutral-100">
        {/* Progress mini */}
        <div className="px-2 py-2 mb-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Progress</span>
            <span className="font-medium text-neutral-700">{progress.percentage}%</span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">{progress.completed}/19 modul selesai</p>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <Flame size={16} className={user.streak_count > 0 ? "text-orange-500" : "text-neutral-300"} />
          <span className="text-xs font-medium text-neutral-600">
            {user.streak_count > 0 ? `${user.streak_count} hari streak` : "Belum ada streak"}
          </span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 font-semibold text-xs">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-800 truncate">{user.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}

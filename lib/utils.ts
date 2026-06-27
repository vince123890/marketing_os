import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, subDays } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Konversi UTC Date ke DATE string dalam WIB (UTC+7)
export function toWIBDate(date: Date = new Date()): string {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return wib.toISOString().split("T")[0]
}

export function yesterdayWIB(): string {
  const today = new Date()
  const yesterday = subDays(today, 1)
  return toWIBDate(yesterday)
}

export function formatDateID(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+07:00")
  return format(date, "EEEE, d MMMM yyyy", { locale: id })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateOrderId(userId: string): string {
  const timestamp = Date.now()
  const prefix = userId.replace(/-/g, "").slice(0, 6)
  return `MOS-${timestamp}-${prefix}`
}

export function getStreakColor(streakCount: number): string {
  if (streakCount === 0) return "text-neutral-400"
  if (streakCount <= 3) return "text-orange-500"
  if (streakCount <= 7) return "text-red-500"
  if (streakCount <= 14) return "text-red-600"
  return "text-purple-600"
}

export function getStreakLabel(streakCount: number): string | null {
  if (streakCount >= 15) return "Legendaris!"
  if (streakCount >= 8) return "On Fire!"
  return null
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

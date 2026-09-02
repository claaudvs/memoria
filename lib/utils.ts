import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es", {
  numeric: "auto",
})

export function formatRelativeTime(date: Date) {
  const diffSeconds = (date.getTime() - Date.now()) / 1000

  for (const [unit, secondsInUnit] of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return relativeTimeFormatter.format(
        Math.round(diffSeconds / secondsInUnit),
        unit,
      )
    }
  }

  return relativeTimeFormatter.format(Math.round(diffSeconds / 60), "minute")
}

function hashSeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const AVATAR_PALETTE = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
] as const

export function avatarStyle(seed: string) {
  return AVATAR_PALETTE[hashSeed(seed) % AVATAR_PALETTE.length]
}

const DOT_PALETTE = [
  "bg-violet-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-500",
] as const

export function dotColor(seed: string) {
  return DOT_PALETTE[hashSeed(seed) % DOT_PALETTE.length]
}

export function initial(text: string) {
  return text.trim().charAt(0).toUpperCase() || "?"
}

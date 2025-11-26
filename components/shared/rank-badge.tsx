"use client"

import type { LucideIcon } from "lucide-react"
import { Shield, Medal, Gem, Crown, Swords, Star, HelpCircle } from "lucide-react"

type RankBadgeProps = {
  tier?: string | null
  rank?: string | null
  className?: string
}

type TierConfig = {
  bg: string
  text: string
  Icon: LucideIcon
  label: string
}

const TIER_CONFIG: Record<string, TierConfig> = {
  IRON: {
    bg: "bg-slate-700/80",
    text: "text-slate-100",
    Icon: Shield,
    label: "Iron",
  },
  BRONZE: {
    bg: "bg-amber-900/80",
    text: "text-amber-100",
    Icon: Shield,
    label: "Bronze",
  },
  SILVER: {
    bg: "bg-slate-300",
    text: "text-slate-900",
    Icon: Medal,
    label: "Silver",
  },
  GOLD: {
    bg: "bg-yellow-400",
    text: "text-yellow-950",
    Icon: Medal,
    label: "Gold",
  },
  PLATINUM: {
    bg: "bg-cyan-500",
    text: "text-cyan-950",
    Icon: Gem,
    label: "Platinum",
  },
  EMERALD: {
    bg: "bg-emerald-500",
    text: "text-emerald-950",
    Icon: Gem,
    label: "Emerald",
  },
  DIAMOND: {
    bg: "bg-blue-500",
    text: "text-blue-950",
    Icon: Gem,
    label: "Diamond",
  },
  MASTER: {
    bg: "bg-purple-500",
    text: "text-purple-100",
    Icon: Crown,
    label: "Master",
  },
  GRANDMASTER: {
    bg: "bg-red-600",
    text: "text-red-100",
    Icon: Crown,
    label: "Grandmaster",
  },
  CHALLENGER: {
    bg: "bg-amber-300",
    text: "text-amber-950",
    Icon: Star,
    label: "Challenger",
  },
}

const DEFAULT_CONFIG: TierConfig = {
  bg: "bg-secondary",
  text: "text-secondary-foreground",
  Icon: HelpCircle,
  label: "Unranked",
}

export function RankBadge({ tier, rank, className }: RankBadgeProps) {
  const normalizedTier = tier?.toUpperCase()

  const config = normalizedTier ? TIER_CONFIG[normalizedTier] ?? DEFAULT_CONFIG : DEFAULT_CONFIG
  const { bg, text, Icon, label } = config

  const division = rank ? ` ${rank}` : ""

  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm",
        bg,
        text,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="h-3 w-3" />
      <span>{label}{division}</span>
    </span>
  )
}

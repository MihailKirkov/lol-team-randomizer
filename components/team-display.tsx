"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock } from "lucide-react"
import type { Team } from "@/lib/types"
import { motion } from "framer-motion"

interface TeamDisplayProps {
  teams: Team[]
  lockedPlayers: Set<string>
  onToggleLock: (playerName: string) => void
}

const roleEmojis: Record<string, string> = {
  Top: "🛡️",
  Jungle: "🌲",
  Mid: "🧙",
  ADC: "🎯",
  Support: "💉",
}

const roleGradients: Record<string, string> = {
  Top: "from-blue-500/10 to-blue-600/5",
  Jungle: "from-green-500/10 to-green-600/5",
  Mid: "from-purple-500/10 to-purple-600/5",
  ADC: "from-red-500/10 to-red-600/5",
  Support: "from-emerald-500/10 to-emerald-600/5",
}

const roleHoverShadows: Record<string, string> = {
  Top: "hover:shadow-blue-500/10",
  Jungle: "hover:shadow-green-500/10",
  Mid: "hover:shadow-purple-500/10",
  ADC: "hover:shadow-red-500/10",
  Support: "hover:shadow-emerald-500/10",
}

const roleHoverBorders: Record<string, string> = {
  Top: "hover:border-blue-500 hover:shadow-blue-500/20",
  Jungle: "hover:border-green-500 hover:shadow-green-500/20",
  Mid: "hover:border-purple-500 hover:shadow-purple-500/20",
  ADC: "hover:border-red-500 hover:shadow-red-500/20",
  Support: "hover:border-emerald-500 hover:shadow-emerald-500/20",
}

const roleHoverTextColor: Record<string, string> = {
  Top: "group-hover:text-blue-400",
  Jungle: "group-hover:text-green-400",
  Mid: "group-hover:text-purple-400",
  ADC: "group-hover:text-red-400",
  Support: "group-hover:text-emerald-400",
}

export function TeamDisplay({ teams, lockedPlayers, onToggleLock }: TeamDisplayProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {teams.map((team, teamIdx) => (
        <motion.div
          key={teamIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: teamIdx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4 }}
          className="transition-all duration-300"
        >
          <Card className="glass-effect p-6 space-y-4 border-border/50 hover:border-border hover:shadow-2xl hover:shadow-neon-cyan/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <motion.h3
                className="text-2xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: teamIdx * 0.1 + 0.2 }}
              >
                <span className={teamIdx === 0 ? "text-neon-cyan" : "text-neon-red"}>Team {teamIdx + 1}</span>
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: teamIdx * 0.1 + 0.3, type: "spring", stiffness: 300 }}
              >
                <Badge
                  variant="outline"
                  className={`${teamIdx === 0 ? "border-neon-cyan text-neon-cyan" : "border-neon-red text-neon-red"} hover:scale-110 transition-transform duration-200`}
                >
                  {team.players.length} Players
                </Badge>
              </motion.div>
            </div>

            <div className="space-y-2">
              {team.players.map((player, idx) => {
                const isLocked = lockedPlayers.has(player.name)
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: teamIdx * 0.1 + idx * 0.05, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`flex items-center justify-between p-3 rounded-lg bg-linear-270 ${roleGradients[player.role]} backdrop-blur-sm border border-transparent transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-lg ${roleHoverBorders[player.role]}`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        className="text-2xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {roleEmojis[player.role]}
                      </motion.span>
                      <div>
                        <p className={`font-semibold text-foreground`}>
                          {player.name}
                        </p>
                        <p className={`text-sm text-muted-foreground ${roleHoverTextColor[player.role]} transition-all`}>{player.role}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => onToggleLock(player.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-secondary"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-neon-cyan" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

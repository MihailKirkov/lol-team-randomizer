"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, TrendingUp, Users } from "lucide-react"
import { motion } from "framer-motion"

interface TeamStatsTabProps {
  teamId: string
}

interface PlayerStats {
  id: string
  name: string
  alias: string | null
  wins: number
  losses: number
  games_played: number
  win_rate: number
  riot_tier: string | null
  riot_rank: string | null
}

export function TeamStatsTab({ teamId }: TeamStatsTabProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [teamId])

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from("team_players")
        .select("*")
        .eq("team_id", teamId)
        .order("win_rate", { ascending: false })

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  const totalGames = players.reduce((sum, p) => sum + p.games_played, 0)
  const totalWins = players.reduce((sum, p) => sum + p.wins, 0)
  const avgWinRate = players.length > 0 ? players.reduce((sum, p) => sum + p.win_rate, 0) / players.length : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{players.length}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalGames}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgWinRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Leaderboard */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
          <CardDescription>Performance metrics for all team players</CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No statistics available yet. Play some games to see player stats!
            </p>
          ) : (
            <div className="space-y-2">
              {players.map((player, idx) => (
                <motion.div
                  key={player.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      {player.alias && <p className="text-sm text-muted-foreground">{player.alias}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Games:</span>{" "}
                      <span className="font-semibold">{player.games_played}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">W/L:</span>{" "}
                      <span className="font-semibold text-green-500">{player.wins}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-semibold text-red-500">{player.losses}</span>
                    </div>
                    <div className="min-w-[80px]">
                      <span className="text-muted-foreground">Win Rate:</span>{" "}
                      <span className="font-semibold text-neon-cyan">{player.win_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

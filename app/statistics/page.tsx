"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Users, Trophy, Target, Home } from "lucide-react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface Player {
  id: string
  name: string
  wins: number
  losses: number
  games_played: number
  win_rate: number
}

type StatType = "wins" | "losses" | "games_played" | "win_rate"

const STAT_LABELS: Record<StatType, string> = {
  wins: "Wins",
  losses: "Losses",
  games_played: "Games Played",
  win_rate: "Win Rate (%)",
}

const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"]

export default function StatisticsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [selectedStats, setSelectedStats] = useState<Set<StatType>>(
    new Set(["wins", "losses", "games_played", "win_rate"]),
  )
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("players").select("*").order("win_rate", { ascending: false })

    if (data) {
      setPlayers(data)
      // Select top 5 players by default
      setSelectedPlayers(new Set(data.slice(0, Math.min(5, data.length)).map((p) => p.id)))
    }
    setIsLoading(false)
  }

  const togglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayers)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      newSelected.add(playerId)
    }
    setSelectedPlayers(newSelected)
  }

  const toggleStat = (stat: StatType) => {
    const newSelected = new Set(selectedStats)
    if (newSelected.has(stat)) {
      if (newSelected.size > 1) {
        newSelected.delete(stat)
      }
    } else {
      newSelected.add(stat)
    }
    setSelectedStats(newSelected)
  }

  const selectedPlayerData = players.filter((p) => selectedPlayers.has(p.id))

  // Prepare data for different chart types
  const barChartData = selectedPlayerData.map((player) => ({
    name: player.name,
    Wins: player.wins,
    Losses: player.losses,
    "Games Played": player.games_played,
    "Win Rate": Number(player.win_rate),
  }))

  const pieChartData = selectedPlayerData.map((player, index) => ({
    name: player.name,
    value: player.wins,
    color: COLORS[index % COLORS.length],
  }))

  const radarChartData = selectedPlayerData.map((player) => {
    const maxGames = Math.max(...players.map((p) => p.games_played), 1)
    const maxWins = Math.max(...players.map((p) => p.wins), 1)
    const maxLosses = Math.max(...players.map((p) => p.losses), 1)

    return {
      player: player.name,
      "Win Rate": Number(player.win_rate),
      Games: (player.games_played / maxGames) * 100,
      Wins: (player.wins / maxWins) * 100,
      Losses: (player.losses / maxLosses) * 100,
    }
  })

  const totalStats = {
    totalPlayers: players.length,
    totalGames: players.reduce((sum, p) => sum + p.games_played, 0) / 2, // Divide by 2 since each game counts twice
    avgWinRate: players.length > 0 ? players.reduce((sum, p) => sum + Number(p.win_rate), 0) / players.length : 0,
    topPlayer: players.length > 0 ? players[0] : null,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-neon-cyan animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="fixed w-screen h-screen top-0 left-0 bg-linear-to-b from-neon-cyan/90 via-transparent to-neon-cyan/30 cursor-not-allowed z-10 flex items-center justify-center text-5xl text-center font-bold">
          UNDER CONSTRUCTION....
      </div>
      <div className="mx-auto max-w-7xl space-y-8 blur-[3px]">
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent">
                Player Statistics
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">Track performance and compare players</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2 hover:bg-secondary bg-transparent">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </motion.header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-2xl font-bold">{totalStats.totalPlayers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Games</p>
                    <p className="text-2xl font-bold">{Math.round(totalStats.totalGames)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Win Rate</p>
                    <p className="text-2xl font-bold">{totalStats.avgWinRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Player</p>
                    <p className="text-lg font-bold truncate">{totalStats.topPlayer?.name || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player Selection Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-neon-cyan" />
                  Select Players
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50 ${
                      selectedPlayers.has(player.id) ? "border-neon-cyan/50 bg-neon-cyan/5" : "border-border/30"
                    }`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    <Checkbox
                      checked={selectedPlayers.has(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.wins}W - {player.losses}L ({player.win_rate}%)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-neon-cyan" />
                  Select Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(STAT_LABELS) as StatType[]).map((stat) => (
                  <div
                    key={stat}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50 ${
                      selectedStats.has(stat) ? "border-neon-cyan/50 bg-neon-cyan/5" : "border-border/30"
                    }`}
                    onClick={() => toggleStat(stat)}
                  >
                    <Checkbox checked={selectedStats.has(stat)} onCheckedChange={() => toggleStat(stat)} />
                    <p className="font-medium">{STAT_LABELS[stat]}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Area */}
          <div className="lg:col-span-3 space-y-6">
            {selectedPlayerData.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-muted-foreground">Select players to view their statistics</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Bar Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Player Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          {selectedStats.has("wins") && <Bar dataKey="Wins" fill="#10b981" />}
                          {selectedStats.has("losses") && <Bar dataKey="Losses" fill="#ef4444" />}
                          {selectedStats.has("games_played") && <Bar dataKey="Games Played" fill="#3b82f6" />}
                          {selectedStats.has("win_rate") && <Bar dataKey="Win Rate" fill="#06b6d4" />}
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Pie Chart & Radar Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Win Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Performance Radar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarChartData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="player" stroke="#9ca3af" />
                            <PolarRadiusAxis stroke="#9ca3af" />
                            {selectedPlayerData.map((player, index) => (
                              <Radar
                                key={player.id}
                                name={player.name}
                                dataKey={player.name}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.3}
                              />
                            ))}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Detailed Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">#</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                                Player
                              </th>
                              {selectedStats.has("games_played") && (
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                                  Games
                                </th>
                              )}
                              {selectedStats.has("wins") && (
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                                  Wins
                                </th>
                              )}
                              {selectedStats.has("losses") && (
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                                  Losses
                                </th>
                              )}
                              {selectedStats.has("win_rate") && (
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                                  Win Rate
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPlayerData.map((player, index) => (
                              <tr
                                key={player.id}
                                className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <span className="text-muted-foreground">{index + 1}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium">{player.name}</span>
                                </td>
                                {selectedStats.has("games_played") && (
                                  <td className="text-center py-3 px-4">{player.games_played}</td>
                                )}
                                {selectedStats.has("wins") && (
                                  <td className="text-center py-3 px-4">
                                    <span className="text-green-400 font-semibold">{player.wins}</span>
                                  </td>
                                )}
                                {selectedStats.has("losses") && (
                                  <td className="text-center py-3 px-4">
                                    <span className="text-red-400 font-semibold">{player.losses}</span>
                                  </td>
                                )}
                                {selectedStats.has("win_rate") && (
                                  <td className="text-center py-3 px-4">
                                    <span className="text-cyan-400 font-semibold">{player.win_rate}%</span>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

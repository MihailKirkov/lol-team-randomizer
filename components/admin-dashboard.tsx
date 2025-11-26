"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Users, UserPlus, LogOut, Shield, Edit, Trash2, Check, X, Clock, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { RiotAccountLink } from "@/components/riot-account-link"
import { getRankDisplay, getRankColor } from "@/lib/riot-api"

interface Player {
  id: string
  name: string
  created_at: string
  wins: number
  losses: number
  games_played: number
  win_rate: number
  riot_summoner_name?: string
  riot_tier?: string
  riot_rank?: string
  riot_lp?: number
  riot_region?: string
  riot_last_synced?: string
}

interface PlayerRequest {
  id: string
  name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface GameResult {
  id: string
  game_date: string
  winning_team: Array<{ id: string; name: string; role: string }>
  losing_team: Array<{ id: string; name: string; role: string }>
  status: "pending" | "approved" | "rejected"
  submitted_by: string
  created_at: string
}

export default function AdminDashboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [requests, setRequests] = useState<PlayerRequest[]>([])
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
    loadRequests()
    loadGameResults()
  }, [])

  const loadPlayers = async () => {
    const { data } = await supabase.from("players").select("*").order("name")
    if (data) setPlayers(data)
  }

  const loadRequests = async () => {
    const { data } = await supabase.from("player_requests").select("*").order("created_at", { ascending: false })
    if (data) setRequests(data)
  }

  const loadGameResults = async () => {
    const { data } = await supabase.from("game_results").select("*").order("created_at", { ascending: false })
    if (data) setGameResults(data)
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    setIsLoading(true)
    const { error } = await supabase.from("players").insert({ name: newPlayerName.trim() })

    if (!error) {
      setNewPlayerName("")
      loadPlayers()
    }
    setIsLoading(false)
  }

  const handleUpdatePlayer = async (id: string) => {
    if (!editingName.trim()) return

    setIsLoading(true)
    const { error } = await supabase.from("players").update({ name: editingName.trim() }).eq("id", id)

    if (!error) {
      setEditingId(null)
      setEditingName("")
      loadPlayers()
    }
    setIsLoading(false)
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return

    setIsLoading(true)
    await supabase.from("players").delete().eq("id", id)
    loadPlayers()
    setIsLoading(false)
  }

  const handleApproveRequest = async (request: PlayerRequest) => {
    setIsLoading(true)

    const { error: playerError } = await supabase.from("players").insert({ name: request.name })

    if (!playerError) {
      await supabase.from("player_requests").update({ status: "approved" }).eq("id", request.id)

      loadPlayers()
      loadRequests()
    }
    setIsLoading(false)
  }

  const handleRejectRequest = async (id: string) => {
    setIsLoading(true)
    await supabase.from("player_requests").update({ status: "rejected" }).eq("id", id)
    loadRequests()
    setIsLoading(false)
  }

  const handleApproveGameResult = async (gameResult: GameResult) => {
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase
        .from("game_results")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", gameResult.id)

      if (updateError) {
        console.error("[v0] Error updating game result:", updateError)
        throw updateError
      }

      const { error: statsError } = await supabase.rpc("update_player_statistics", {
        p_game_result_id: gameResult.id,
      })

      if (statsError) {
        console.error("[v0] Error updating player statistics:", statsError)
        throw statsError
      }

      await Promise.all([loadGameResults(), loadPlayers()])

      alert("Game result approved and player statistics updated!")
    } catch (error) {
      console.error("[v0] Error approving game result:", error)
      alert("Failed to approve game result. Please check the console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectGameResult = async (id: string) => {
    setIsLoading(true)
    await supabase
      .from("game_results")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
    loadGameResults()
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const pendingGameResults = gameResults.filter((g) => g.status === "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 ring-2 ring-cyan-500/20">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-3xl font-bold text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-400">Manage players and requests</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-slate-800/50 backdrop-blur-xl">
            <TabsTrigger
              value="players"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Users className="mr-2 h-4 w-4" />
              Players ({players.length})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Clock className="mr-2 h-4 w-4" />
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="game-results"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Games ({pendingGameResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-50">
                  <UserPlus className="h-5 w-5 text-cyan-400" />
                  Add New Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPlayer} className="flex gap-3">
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter player name..."
                    className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !newPlayerName.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950"
                  >
                    Add Player
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">All Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-lg border border-cyan-500/10 bg-slate-800/30 p-4"
                    >
                      {editingId === player.id ? (
                        <div className="flex flex-1 gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border-cyan-500/20 bg-slate-700/50 text-slate-100"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePlayer(player.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditingName("")
                            }}
                            className="border-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-100 font-medium">{player.name}</span>
                              {player.riot_tier && (
                                <span className={`text-sm font-semibold ${getRankColor(player.riot_tier)}`}>
                                  {getRankDisplay(player.riot_tier, player.riot_rank)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-slate-400">
                              <span>Games: {player.games_played}</span>
                              <span className="text-green-400">Wins: {player.wins}</span>
                              <span className="text-red-400">Losses: {player.losses}</span>
                              <span>WR: {player.win_rate.toFixed(1)}%</span>
                            </div>
                            {player.riot_summoner_name && (
                              <p className="text-xs text-slate-500 mt-1">
                                Summoner: {player.riot_summoner_name} ({player.riot_region?.toUpperCase()})
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <RiotAccountLink
                              playerId={player.id}
                              playerName={player.name}
                              currentSummonerName={player.riot_summoner_name}
                              currentRegion={player.riot_region}
                              onSync={loadPlayers}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(player.id)
                                setEditingName(player.name)
                              }}
                              className="gap-2 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePlayer(player.id)}
                              className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                  {players.length === 0 && (
                    <p className="py-8 text-center text-slate-400">No players yet. Add your first player above!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{request.name}</p>
                        <p className="text-xs text-slate-400">
                          Requested {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request)}
                          disabled={isLoading}
                          className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isLoading}
                          className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="py-8 text-center text-slate-400">No pending requests at the moment.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Request History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requests
                    .filter((r) => r.status !== "pending")
                    .map((request) => (
                      <div
                        key={request.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          request.status === "approved"
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-100">{request.name}</p>
                          <p className="text-xs text-slate-400">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            request.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game-results" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Pending Game Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingGameResults.map((gameResult) => (
                    <motion.div
                      key={gameResult.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            Submitted {new Date(gameResult.created_at).toLocaleDateString()} by{" "}
                            {gameResult.submitted_by}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-green-400" />
                            <p className="font-semibold text-green-400">Winning Team</p>
                          </div>
                          <div className="space-y-1">
                            {gameResult.winning_team.map((player, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">{player.name}</span>
                                <span className="text-slate-500">{player.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <X className="h-4 w-4 text-red-400" />
                            <p className="font-semibold text-red-400">Losing Team</p>
                          </div>
                          <div className="space-y-1">
                            {gameResult.losing_team.map((player, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">{player.name}</span>
                                <span className="text-slate-500">{player.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveGameResult(gameResult)}
                          disabled={isLoading}
                          className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-3 w-3" />
                          Approve & Update Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectGameResult(gameResult.id)}
                          disabled={isLoading}
                          className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {pendingGameResults.length === 0 && (
                    <p className="py-8 text-center text-slate-400">No pending game results at the moment.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Game Results History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameResults
                    .filter((g) => g.status !== "pending")
                    .slice(0, 10)
                    .map((gameResult) => (
                      <div
                        key={gameResult.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          gameResult.status === "approved"
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {gameResult.winning_team.map((p) => p.name).join(", ")} defeated{" "}
                            {gameResult.losing_team.map((p) => p.name).join(", ")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(gameResult.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            gameResult.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {gameResult.status}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Users, UserPlus, LogOut, Shield, Clock, Trophy, Search } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useAdminPlayers } from "@/hooks/use-admin-players"
import { useAdminRequests } from "@/hooks/use-admin-requests"
import { useAdminGameResults } from "@/hooks/use-admin-game-results"
import { PlayerList } from "@/components/admin/player-list"
import { AddPlayerForm } from "@/components/admin/add-player-form"

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
  alias?: string
  riot_id?: string
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
  const router = useRouter()
  const supabase = createClient()

  const {
    players,
    isLoading: playersLoading,
    searchQuery,
    setSearchQuery,
    loadPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
  } = useAdminPlayers()

  const {
    requests,
    pendingRequests,
    isLoading: requestsLoading,
    loadRequests,
    approveRequest,
    rejectRequest,
  } = useAdminRequests()

  const {
    gameResults,
    pendingGameResults,
    isLoading: gameResultsLoading,
    loadGameResults,
    approveGameResult,
    rejectGameResult,
  } = useAdminGameResults()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return
    await deletePlayer(id)
  }

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
                <AddPlayerForm onAdd={addPlayer} isLoading={playersLoading} />
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">All Players</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name or alias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <PlayerList
                  players={players}
                  isLoading={playersLoading}
                  onUpdate={updatePlayer}
                  onDelete={handleDeletePlayer}
                  onSync={loadPlayers}
                />
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
                        {request.alias && <p className="text-sm text-slate-400 italic">Alias: {request.alias}</p>}
                        {request.riot_id && <p className="text-xs text-slate-500">Riot ID: {request.riot_id}</p>}
                        <p className="text-xs text-slate-400">
                          Requested {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveRequest(request, loadPlayers)}
                          disabled={requestsLoading}
                          className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                            ✓
                          </motion.div>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(request.id)}
                          disabled={requestsLoading}
                          className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          ✗ Reject
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
                          {request.alias && <p className="text-sm text-slate-400 italic">Alias: {request.alias}</p>}
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
                            <motion.div whileHover={{ rotate: 90 }}>✗</motion.div>
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
                          onClick={() => approveGameResult(gameResult, loadPlayers)}
                          disabled={gameResultsLoading}
                          className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                          ✓ Approve & Update Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectGameResult(gameResult.id)}
                          disabled={gameResultsLoading}
                          className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          ✗ Reject
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

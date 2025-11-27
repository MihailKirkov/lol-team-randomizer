"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Trash2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Player {
  id: string
  name: string
  alias: string | null
  riot_tier: string | null
  riot_rank: string | null
  wins: number
  losses: number
  games_played: number
  win_rate: number
}

interface TeamPlayersTabProps {
  teamId: string
  isAdmin: boolean
}

export function TeamPlayersTab({ teamId, isAdmin }: TeamPlayersTabProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ name: "", alias: "" })
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
  }, [teamId])

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase.from("team_players").select("*").eq("team_id", teamId).order("name")

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error("Error loading players:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) return

    try {
      const { error } = await supabase.from("team_players").insert({
        team_id: teamId,
        name: newPlayer.name.trim(),
        alias: newPlayer.alias.trim() || null,
      })

      if (error) throw error

      setShowAddDialog(false)
      setNewPlayer({ name: "", alias: "" })
      loadPlayers()
    } catch (error) {
      console.error("Error adding player:", error)
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!isAdmin) return
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      const { error } = await supabase.from("team_players").delete().eq("id", playerId)

      if (error) throw error
      loadPlayers()
    } catch (error) {
      console.error("Error deleting player:", error)
    }
  }

  const filteredPlayers = players.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.alias?.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/50 border-border"
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow gap-2">
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
              <DialogDescription>Add a player to your team roster</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Player Name</Label>
                <Input
                  id="playerName"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="Enter player name"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerAlias">Alias (Optional)</Label>
                <Input
                  id="playerAlias"
                  value={newPlayer.alias}
                  onChange={(e) => setNewPlayer({ ...newPlayer, alias: e.target.value })}
                  placeholder="Enter player alias"
                  className="bg-background border-border"
                />
              </div>
              <Button
                onClick={handleAddPlayer}
                className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90"
              >
                Add Player
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <Card className="border-border bg-card/50">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              {search ? "No players found" : "No players yet. Add your first player to get started!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Card className="border-border bg-card/50 hover:border-neon-cyan/50 transition-all duration-200 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      {player.alias && <CardDescription>{player.alias}</CardDescription>}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlayer(player.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">W/L:</span>{" "}
                      <span className="font-semibold">
                        {player.wins}/{player.losses}
                      </span>
                    </div>
                    {player.games_played > 0 && (
                      <div>
                        <span className="text-muted-foreground">WR:</span>{" "}
                        <span className="font-semibold">{player.win_rate.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

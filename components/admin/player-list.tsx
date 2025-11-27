"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { RiotAccountLink } from "@/components/riot-account-link"
import { getRankDisplay, getRankColor } from "@/lib/riot-api"

interface Player {
  id: string
  name: string
  alias?: string
  wins: number
  losses: number
  games_played: number
  win_rate: number
  riot_summoner_name?: string
  riot_tier?: string
  riot_rank?: string
  riot_region?: string
}

interface PlayerListProps {
  players: Player[]
  isLoading: boolean
  onUpdate: (id: string, name: string, alias: string) => Promise<boolean>
  onDelete: (id: string) => void
  onSync: () => void
}

export function PlayerList({ players, isLoading, onUpdate, onDelete, onSync }: PlayerListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingAlias, setEditingAlias] = useState("")

  const handleUpdate = async (id: string) => {
    const success = await onUpdate(id, editingName, editingAlias)
    if (success) {
      setEditingId(null)
      setEditingName("")
      setEditingAlias("")
    }
  }

  return (
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
              <div className="flex-1 space-y-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Player name"
                  className="border-cyan-500/20 bg-slate-700/50 text-slate-100"
                  autoFocus
                />
                <Input
                  value={editingAlias}
                  onChange={(e) => setEditingAlias(e.target.value)}
                  placeholder="Alias (optional)"
                  className="border-cyan-500/20 bg-slate-700/50 text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpdate(player.id)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setEditingName("")
                    setEditingAlias("")
                  }}
                  className="border-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-slate-100 font-medium">{player.name}</span>
                    {player.alias && <span className="text-slate-400 text-sm ml-2 italic">"{player.alias}"</span>}
                  </div>
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
                  onSync={onSync}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(player.id)
                    setEditingName(player.name)
                    setEditingAlias(player.alias || "")
                  }}
                  className="gap-2 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(player.id)}
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
      {players.length === 0 && <p className="py-8 text-center text-slate-400">No players found.</p>}
    </div>
  )
}

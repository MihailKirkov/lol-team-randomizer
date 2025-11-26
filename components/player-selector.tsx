"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Search, Loader2, Plus, UserPlus } from "lucide-react"
import { RequestPlayerModal } from "./request-player-modal"
import { motion, AnimatePresence } from "framer-motion"
import { RankBadge } from "./shared/rank-badge"

interface Player {
  id: string
  name: string
  riot_tier?: string | null
  riot_rank?: string | null
}

interface PlayerSelectorProps {
  selectedPlayers: string[]
  onSelectionChange: (players: string[]) => void
}


export function PlayerSelector({ selectedPlayers, onSelectionChange }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showNoResultsOptions, setShowNoResultsOptions] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("players").select("id, name, riot_tier, riot_rank").order("name")
    if (data) setPlayers(data)
    setIsLoading(false)
  }

  // players = DB players
// selectedPlayers = strings (names)

  const dbPlayerNames = new Set(players.map((p) => p.name))

  // Convert selected names that aren't in the DB into fake "unregistered" Player objects
  const unregisteredPlayers: Player[] = selectedPlayers
    .filter((name) => !dbPlayerNames.has(name))
    .map((name) => ({
      id: `unregistered-${name}`, // unique local id
      name,
      riot_tier: null,
      riot_rank: null,
    }))

  // Combine DB players + unregistered ones
  const combinedPlayers = [...players, ...unregisteredPlayers]

  // Apply search filtering
  const filteredPlayers = combinedPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )


  const shouldShowNoResults = searchQuery.trim().length > 0 && filteredPlayers.length === 0 && !isLoading

  useEffect(() => {
    setShowNoResultsOptions(shouldShowNoResults)
  }, [shouldShowNoResults])

  const handleToggle = (playerName: string) => {
    if (selectedPlayers.includes(playerName)) {
      onSelectionChange(selectedPlayers.filter((p) => p !== playerName))
    } else {
      onSelectionChange([...selectedPlayers, playerName])
    }
  }

  const handleAddUnregistered = () => {
    const trimmedName = searchQuery.trim()
    if (!trimmedName) return
    if (!selectedPlayers.includes(trimmedName)) {
      onSelectionChange([...selectedPlayers, trimmedName])
    }
    setSearchQuery("")
  }

  const handleRequestWithName = () => {
    setRequestModalOpen(true)
  }

  const handleSelectAll = () => {
    onSelectionChange(filteredPlayers.map((p) => p.name))
  }

  const handleDeselectAll = () => {
    onSelectionChange([])
  }

  return (
    <Card className="glass-effect p-6 space-y-5 border-border/50 hover:border-border transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Select Players</h2>
          <p className="text-sm text-muted-foreground">
            {selectedPlayers.length === 0 && "Select at least 10 players to start"}
            {selectedPlayers.length > 0 && selectedPlayers.length < 10 && (
              <span>
                {selectedPlayers.length} / 10 players{" "}
                <span className="text-amber-500">(need {10 - selectedPlayers.length} more)</span>
              </span>
            )}
            {selectedPlayers.length >= 10 && (
              <span className="text-neon-cyan">{selectedPlayers.length} players selected</span>
            )}
          </p>
        </div>
        <RequestPlayerModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          prefilledName={searchQuery.trim()}
          onSuccess={loadPlayers}
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border focus:border-neon-cyan/50 transition-all duration-200"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSelectAll} className="bg-transparent hover:bg-secondary">
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={handleDeselectAll} className="bg-transparent hover:bg-secondary">
          Clear
        </Button>
      </div>

      <AnimatePresence>
        {showNoResultsOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-border/60 bg-neon-cyan/10 p-4 space-y-3">
              <p className="text-sm text-foreground">
                No registered player found for{" "}
                <span className="font-semibold text-neon-cyan">
                  "{searchQuery}"
                </span>
                . You can:
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddUnregistered}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 border-border/70 bg-background/60 hover:bg-background text-foreground hover:text-neon-cyan"
                >
                  <Plus className="h-4 w-4" />
                  Use as Unregistered
                </Button>
                <Button
                  onClick={handleRequestWithName}
                  size="sm"
                  className="flex-1 gap-2 bg-neon-cyan/80 hover:bg-neon-cyan text-background border-transparent"
                >
                  <UserPlus className="h-4 w-4" />
                  Request to Add
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">No players available yet.</p>
          <p className="text-sm text-muted-foreground">Request a new player to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.includes(player.name)
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <label
                  className={`flex flex-col gap-1.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? "bg-neon-cyan/20 border-neon-cyan/60 shadow-lg shadow-neon-cyan/20"
                      : "bg-secondary/50 border-transparent hover:border-neon-cyan/30 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(player.name)}
                      className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                    />
                    <span className={`text-sm font-medium truncate ${isSelected ? "text-neon-cyan" : ""}`}>
                      {player.name}
                    </span>
                  </div>
                  {player.riot_tier && player.riot_rank && (
                    <div className="ml-6">
                      <RankBadge tier={player.riot_tier} rank={player.riot_rank} />
                    </div>
                  )}
                </label>
              </motion.div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Settings, Sparkles, X, UserPlus, Edit2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PlayerInputProps {
  players: string[]
  onPlayersChange: (players: string[]) => void
  onGenerate: () => void
  onOpenConditions: () => void
}

export function PlayerInput({ players, onPlayersChange, onGenerate, onOpenConditions }: PlayerInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleAddPlayers = () => {
    const newPlayers = inputValue
      .split(/[\n,]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    onPlayersChange([...players, ...newPlayers])
    setInputValue("")
  }

  const handleRemovePlayer = (index: number) => {
    onPlayersChange(players.filter((_, i) => i !== index))
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(players[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newPlayers = [...players]
      newPlayers[editingIndex] = editValue.trim()
      onPlayersChange(newPlayers)
      setEditingIndex(null)
      setEditValue("")
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue("")
  }

  const canGenerate = players.length >= 10

  return (
    <Card className="glass-effect p-6 space-y-5 border-border/50 hover:border-border transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Player Roster</h2>
          <p className="text-sm text-muted-foreground">
            {players.length === 0 && "Add at least 10 players to start"}
            {players.length > 0 && players.length < 10 && (
              <span>
                {players.length} / 10 players <span className="text-amber-500">(need {10 - players.length} more)</span>
              </span>
            )}
            {players.length >= 10 && <span className="text-neon-cyan">{players.length} players ready</span>}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenConditions}
          className="gap-2 bg-transparent hover:bg-secondary hover:scale-105 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
          Conditions
        </Button>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Enter player names (one per line or comma-separated)&#10;Example: Faker, TheShy, Caps..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-h-[100px] resize-none bg-secondary/50 border-border focus:border-neon-cyan/50 transition-all duration-200"
        />
        <Button
          onClick={handleAddPlayers}
          disabled={!inputValue.trim()}
          variant="secondary"
          className="w-full gap-2 hover:bg-neon-cyan/20 hover:border-neon-cyan/50 hover:scale-[1.02] transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" />
          Add Players
        </Button>
      </div>

      {players.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {players.map((player, idx) => (
                <motion.div
                  key={`${player}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="group relative flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-br from-secondary/70 to-secondary/50 hover:from-secondary hover:to-secondary/80 transition-all duration-300 border border-transparent hover:border-neon-cyan/40 hover:shadow-lg hover:shadow-neon-cyan/10 hover:scale-[1.03]">
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit()
                            if (e.key === "Escape") handleCancelEdit()
                          }}
                          className="h-7 text-sm px-2 bg-background/50"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 rounded hover:bg-neon-cyan/20 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5 text-neon-cyan" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium truncate flex-1">{player}</span>
                        <button
                          onClick={() => handleStartEdit(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neon-cyan/20"
                        >
                          <Edit2 className="h-3 w-3 text-neon-cyan" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemovePlayer(idx)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:scale-110 shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow font-semibold text-lg h-12 disabled:opacity-50 hover:scale-[1.02] transition-all duration-200 group"
      >
        <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
        Generate Teams
      </Button>
    </Card>
  )
}

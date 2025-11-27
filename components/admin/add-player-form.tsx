"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddPlayerFormProps {
  onAdd: (name: string, alias: string) => Promise<boolean>
  isLoading: boolean
}

export function AddPlayerForm({ onAdd, isLoading }: AddPlayerFormProps) {
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerAlias, setNewPlayerAlias] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    const success = await onAdd(newPlayerName, newPlayerAlias)
    if (success) {
      setNewPlayerName("")
      setNewPlayerAlias("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="playerName" className="text-slate-200">
          Player Name
        </Label>
        <Input
          id="playerName"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Enter player name..."
          className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="playerAlias" className="text-slate-200">
          Alias <span className="text-slate-500 text-sm">(optional)</span>
        </Label>
        <Input
          id="playerAlias"
          value={newPlayerAlias}
          onChange={(e) => setNewPlayerAlias(e.target.value)}
          placeholder="Enter alias..."
          className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !newPlayerName.trim()}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950"
      >
        Add Player
      </Button>
    </form>
  )
}

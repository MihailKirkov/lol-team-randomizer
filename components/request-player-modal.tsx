"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

interface RequestPlayerModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  prefilledName?: string
  onSuccess?: () => void
}

export function RequestPlayerModal({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  prefilledName = "",
  onSuccess,
}: RequestPlayerModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [riotId, setRiotId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  useEffect(() => {
    if (open && prefilledName) {
      setPlayerName(prefilledName)
    }
  }, [open, prefilledName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if already exists in players
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("name", playerName.trim())
        .single()

      if (existingPlayer) {
        setError("This player already exists!")
        setIsLoading(false)
        return
      }

      // Check if already requested
      const { data: existingRequest } = await supabase
        .from("player_requests")
        .select("id")
        .eq("name", playerName.trim())
        .eq("status", "pending")
        .single()

      if (existingRequest) {
        setError("This player has already been requested and is pending approval!")
        setIsLoading(false)
        return
      }

      const { error: insertError } = await supabase.from("player_requests").insert({
        name: playerName.trim(),
        riot_id: riotId.trim() || null,
        status: "pending",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setPlayerName("")
      setRiotId("")
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
        >
          <UserPlus className="h-4 w-4" />
          Request New Player
        </Button>
      </DialogTrigger>
      <DialogContent className="border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-cyan-50">Request New Player</DialogTitle>
          <DialogDescription className="text-slate-400">
            Submit a request to add a new player. An admin will review and approve it.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                ✓
              </motion.div>
            </div>
            <p className="text-center text-green-400">Request submitted successfully!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-slate-200">
                Player Name
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name..."
                className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riotId" className="text-slate-200">
                Riot ID <span className="text-slate-500 text-xs">(optional)</span>
              </Label>
              <Input
                id="riotId"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                placeholder="GameName#TAG (e.g., MegaKill860#EUNE)"
                className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Connect this player to their League of Legends account to show their rank
              </p>
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !playerName.trim()}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950"
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

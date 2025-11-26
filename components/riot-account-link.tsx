"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Link, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface RiotAccountLinkProps {
  playerId: string
  playerName: string
  currentSummonerName?: string | null
  currentRegion?: string | null
  onSync: () => void
}

export function RiotAccountLink({
  playerId,
  playerName,
  currentSummonerName,
  currentRegion,
  onSync,
}: RiotAccountLinkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [summonerName, setSummonerName] = useState(currentSummonerName || "")
  const [region, setRegion] = useState(currentRegion || "eun1")
  console.log('currentRegion:', currentRegion);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSync = async () => {
    if (!summonerName.includes("#")) {
      setError("Enter Riot ID in the format Name#TAG (ex: MegaKill860#EUNE)")
      return
    }
    if (!summonerName.trim()) {
      setError("Please enter a summoner name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/riot/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          riotId: summonerName.trim(),
          region,
        }),
      })
      console.log("Riot sync response:", response)

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to sync Riot account")
        setIsLoading(false)
        return
      }

      setIsOpen(false)
      onSync()
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
        >
          <Shield className="h-3 w-3" />
          {currentSummonerName ? "Update" : "Link"} Riot Account
        </Button>
      </DialogTrigger>
      <DialogContent className="border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-50">
            <Link className="h-5 w-5 text-cyan-400" />
            Link Riot Account for {playerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="summoner-name" className="text-slate-300">
              Riot ID
            </Label>
            <Input
              id="summoner-name"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="GameName#TAG (example: MegaKill860#EUNE)"
              className="border-cyan-500/20 bg-slate-800/50 text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-slate-300">
              Region
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="border-cyan-500/20 bg-slate-800/50 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-cyan-500/20 bg-slate-900">
                <SelectItem value="na1">North America</SelectItem>
                <SelectItem value="euw1">Europe West</SelectItem>
                <SelectItem value="eun1">Europe Nordic & East</SelectItem>
                <SelectItem value="kr">Korea</SelectItem>
                <SelectItem value="br1">Brazil</SelectItem>
                <SelectItem value="jp1">Japan</SelectItem>
                <SelectItem value="ru">Russia</SelectItem>
                <SelectItem value="oc1">Oceania</SelectItem>
                <SelectItem value="tr1">Turkey</SelectItem>
                <SelectItem value="la1">Latin America North</SelectItem>
                <SelectItem value="la2">Latin America South</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400">
              {error}
            </motion.p>
          )}

          <Button
            onClick={handleSync}
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync Riot Account"
            )}
          </Button>

          <p className="text-xs text-slate-400">
            This will fetch your current rank and stats from League of Legends. Make sure the summoner name is correct.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

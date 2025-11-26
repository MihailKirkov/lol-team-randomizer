"use client"

import { useState } from "react"
import { PlayerSelector } from "@/components/player-selector"
import { TeamDisplay } from "@/components/team-display"
import { RandomizeControls } from "@/components/randomize-controls"
import { ConditionsModal } from "@/components/conditions-modal"
import { GameResultSubmission } from "@/components/game-result-submission"
import { generateTeams, randomizeRoles, randomizeBoth, randomizeTeams } from "@/lib/team-utils"
import type { PlayerCondition, Team } from "@/lib/types"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const [players, setPlayers] = useState<string[]>([])
  const [teams, setTeams] = useState<Team[] | null>(null)
  const [conditions, setConditions] = useState<PlayerCondition[]>([])
  const [lockedPlayers, setLockedPlayers] = useState<Set<string>>(new Set())
  const [showConditions, setShowConditions] = useState(false)

  const handleGenerateTeams = () => {
    if (players.length < 10) return
    const newTeams = generateTeams(players, conditions)
    setTeams(newTeams)
  }

  const handleRandomizeTeams = () => {
    if (!teams) return
    const newTeams = randomizeTeams(teams, lockedPlayers)
    setTeams(newTeams)
  }

  const handleRandomizeRoles = () => {
    if (!teams) return
    const newTeams = randomizeRoles(teams, conditions, lockedPlayers)
    setTeams(newTeams)
  }

  const handleRandomizeBoth = () => {
    if (!teams) return
    const newTeams = randomizeBoth(players, conditions, lockedPlayers)
    setTeams(newTeams)
  }

  const handleToggleLock = (playerName: string) => {
    const newLocked = new Set(lockedPlayers)
    if (newLocked.has(playerName)) {
      newLocked.delete(playerName)
    } else {
      newLocked.add(playerName)
    }
    setLockedPlayers(newLocked)
  }

  const handleExport = () => {
    if (!teams) return
    const text = teams
      .map((team, idx) => `Team ${idx + 1}:\n${team.players.map((p) => `  ${p.role}: ${p.name}`).join("\n")}`)
      .join("\n\n")
    navigator.clipboard.writeText(text)
    alert("Teams copied to clipboard!")
  }

  const canGenerate = players.length >= 10

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.header
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <Link href="/statistics">
              <Button
                variant="outline"
                className="gap-2 bg-transparent hover:bg-secondary hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4" />
                View Statistics
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent animate-gradient">
                LoL Team Randomizer
              </span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Generate balanced League of Legends teams with role assignments
            </motion.p>
          </div>
        </motion.header>

        <PlayerSelector selectedPlayers={players} onSelectionChange={setPlayers} />

        {!teams && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleGenerateTeams}
              disabled={!canGenerate}
              className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow font-semibold text-lg h-12 px-8 disabled:opacity-50 hover:scale-[1.02] transition-all duration-200 group"
            >
              <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
              Generate Teams
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConditions(true)}
              className="gap-2 bg-transparent hover:bg-secondary hover:scale-105 transition-all duration-200 h-12 px-6"
            >
              Set Conditions
            </Button>
          </div>
        )}

        {/* Team Display */}
        {teams && (
          <>
            <TeamDisplay teams={teams} lockedPlayers={lockedPlayers} onToggleLock={handleToggleLock} />

            {/* Randomize Controls */}
            <RandomizeControls
              onRandomizeTeams={handleRandomizeTeams}
              onRandomizeRoles={handleRandomizeRoles}
              onRandomizeBoth={handleRandomizeBoth}
              onExport={handleExport}
            />

            {/* Game Result Submission */}
            <GameResultSubmission teams={teams} />
          </>
        )}

        {/* Conditions Modal */}
        <ConditionsModal
          open={showConditions}
          onOpenChange={setShowConditions}
          players={players}
          conditions={conditions}
          onConditionsChange={setConditions}
        />
      </div>
    </div>
  )
}

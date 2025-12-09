"use client"

import { useState } from "react"
import { TeamDisplay } from "@/components/team-display"
import { RandomizeControls } from "@/components/randomize-controls"
import { ConditionsModal } from "@/components/conditions-modal"
import { generateTeams, randomizeRoles, randomizeBoth, randomizeTeams } from "@/lib/team-utils"
import { ROLES, type PlayerCondition, type Team } from "@/lib/types"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTeamRandomizer } from "@/hooks/useTeamRandomizer"

export default function GuestModePage() {
  const [playerInput, setPlayerInput] = useState("")
  const [teams, setTeams] = useState<Team[] | null>(null)
  const [conditions, setConditions] = useState<PlayerCondition[]>([])
  const [lockedPlayers, setLockedPlayers] = useState<Set<string>>(new Set())
  const [showConditions, setShowConditions] = useState(false)

  // Parse players from input (comma or line-break separated)
  const players = playerInput
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

    
  const {
    generate,
    randomizeTeamsHandler,
    randomizeRolesHandler,
    randomizeBothHandler
  } = useTeamRandomizer(players, conditions, teams, setTeams, lockedPlayers)

  const handleToggleLock = (playerName: string) => {
    const newLocked = new Set(lockedPlayers)
    if (newLocked.has(playerName)) {
      newLocked.delete(playerName)
    } else {
      newLocked.add(playerName)
    }
    setLockedPlayers(newLocked)
  }

const handleCopy = () => {
  if (!teams) return

  const team1 = teams[0].players
  const team2 = teams[1].players

  // sort players by role order (Top, Jungle, Mid, ADC, Support)
  const orderedRoles = ROLES
  const getPlayerForRole = (team, role) =>
    team.find(p => p.role === role)?.name || ""

  // determine padding for clean alignment
  const longestTeam1 = Math.max(...team1.map(p => p.name.length))
  const longestTeam2 = Math.max(...team2.map(p => p.name.length))

  const header =
    "Role".padEnd(8) +
    " | " +
    "Team 1".padEnd(longestTeam1) +
    " | " +
    "Team 2".padEnd(longestTeam2)

  const separator = "-".repeat(header.length)

  const rows = orderedRoles
    .map(role => {
      const p1 = getPlayerForRole(team1, role).padEnd(longestTeam1)
      const p2 = getPlayerForRole(team2, role).padEnd(longestTeam2)

      return (
        role.padEnd(8) +
        " | " +
        p1 +
        " | " +
        p2
      )
    })
    .join("\n")

  const text = `${header}\n${separator}\n${rows}`

  navigator.clipboard.writeText(text)
  showToast("SUCCESS", "Teams copied to clipboard!")
}


  const canGenerate = players.length >= 10

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.header
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2 hover:bg-secondary hover:scale-105 transition-all duration-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="gap-2 bg-transparent hover:bg-secondary hover:scale-105 transition-all duration-200"
              >
                Create Account
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
              <span className="bg-linear-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent animate-gradient">
                Guest Mode
              </span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Quick team generation without saving
            </motion.p>
          </div>
        </motion.header>

        {/* Player Input */}
        {!teams && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Enter player names separated by commas or line breaks (minimum 10 players)</span>
            </div>

            <Textarea
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Player1, Player2, Player3
or
Player1
Player2
Player3"
              className="min-h-[200px] bg-card/50 border-border focus:border-neon-cyan transition-colors duration-200"
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {players.length} player{players.length !== 1 ? "s" : ""} entered
                {players.length < 10 && ` (${10 - players.length} more needed)`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={generate}
                disabled={!canGenerate}
                className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow font-semibold text-lg h-12 px-8 disabled:opacity-50 hover:scale-[1.02] transition-all duration-200 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                Generate Teams
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConditions(true)}
                disabled={players.length === 0}
                className="gap-2 bg-transparent hover:bg-secondary hover:scale-105 transition-all duration-200 h-12 px-6"
              >
                Set Conditions
              </Button>
            </div>
          </motion.div>
        )}

        {/* Team Display */}
        {teams && (
          <>
            <TeamDisplay teams={teams} lockedPlayers={lockedPlayers} onToggleLock={handleToggleLock} />

            <RandomizeControls
              onRandomizeTeams={randomizeTeamsHandler}
              onRandomizeRoles={randomizeRolesHandler}
              onRandomizeBoth={randomizeBothHandler}
              onCopy={handleCopy}
            />

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setTeams(null)}
                className="gap-2 hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
            </div>
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

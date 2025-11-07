"use client"

import { useState, useEffect } from "react"
import { PlayerInput } from "@/components/player-input"
import { TeamDisplay } from "@/components/team-display"
import { RandomizeControls } from "@/components/randomize-controls"
import { ConditionsModal } from "@/components/conditions-modal"
import { generateTeams, randomizeRoles, randomizeBoth, randomizeTeams } from "@/lib/team-utils"
import type { PlayerCondition, Team } from "@/lib/types"
import { motion } from "framer-motion"

export default function Page() {
  const [players, setPlayers] = useState<string[]>([])
  const [teams, setTeams] = useState<Team[] | null>(null)
  const [conditions, setConditions] = useState<PlayerCondition[]>([])
  const [lockedPlayers, setLockedPlayers] = useState<Set<string>>(new Set())
  const [showConditions, setShowConditions] = useState(false)
  const [playerNameMap, setPlayerNameMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    if (!teams) return

    const updatedTeams = teams.map((team) => ({
      ...team,
      players: team.players.map((player) => {
        // Find the current name of this player
        const oldName = playerNameMap.get(player.name) || player.name
        const currentPlayers = players
        const currentName = currentPlayers.find((p) => playerNameMap.get(p) === oldName || p === oldName) || player.name
        return {
          ...player,
          name: currentName,
        }
      }),
    }))

    setTeams(updatedTeams)
  }, [players])

  const handleGenerateTeams = () => {
    if (players.length < 10) return
    const newTeams = generateTeams(players, conditions)
    setTeams(newTeams)
    const nameMap = new Map<string, string>()
    players.forEach((player) => nameMap.set(player, player))
    setPlayerNameMap(nameMap)
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.header
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
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
        </motion.header>

        {/* Player Input Section */}
        <PlayerInput
          players={players}
          onPlayersChange={setPlayers}
          onGenerate={handleGenerateTeams}
          onOpenConditions={() => setShowConditions(true)}
        />

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

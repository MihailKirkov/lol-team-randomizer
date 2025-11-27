"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { TeamDisplay } from "@/components/team-display"
import { RandomizeControls } from "@/components/randomize-controls"
import { ConditionsModal } from "@/components/conditions-modal"
import { generateTeams, randomizeRoles, randomizeBoth, randomizeTeams } from "@/lib/team-utils"
import type { PlayerCondition, Team } from "@/lib/types"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TeamGeneratorTabProps {
  teamId: string
}

export function TeamGeneratorTab({ teamId }: TeamGeneratorTabProps) {
  const [players, setPlayers] = useState<string[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [teams, setTeams] = useState<Team[] | null>(null)
  const [conditions, setConditions] = useState<PlayerCondition[]>([])
  const [lockedPlayers, setLockedPlayers] = useState<Set<string>>(new Set())
  const [showConditions, setShowConditions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
  }, [teamId])

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase.from("team_players").select("*").eq("team_id", teamId).order("name")

      if (error) throw error
      setAllPlayers(data || [])
    } catch (error) {
      console.error("Error loading players:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmitResult = async (winningTeamIndex: number) => {
    if (!teams) return
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const winningTeam = teams[winningTeamIndex].players.map((p) => ({
        name: p.name,
        role: p.role,
        playerId: allPlayers.find((pl) => pl.name === p.name)?.id,
      }))

      const losingTeam = teams[1 - winningTeamIndex].players.map((p) => ({
        name: p.name,
        role: p.role,
        playerId: allPlayers.find((pl) => pl.name === p.name)?.id,
      }))

      const { error } = await supabase.from("team_game_results").insert({
        team_id: teamId,
        winning_team: winningTeam,
        losing_team: losingTeam,
        submitted_by: user?.id,
      })

      if (error) throw error

      alert("Game result submitted! Waiting for admin approval.")
    } catch (error) {
      console.error("Error submitting result:", error)
      alert("Failed to submit result")
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePlayer = (playerId: string, playerName: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId))
      setPlayers(players.filter((name) => name !== playerName))
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId])
      setPlayers([...players, playerName])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {!teams && (
        <>
          {/* Player Selection */}
          <Card className="border-border bg-card/50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Select Players ({players.length}/10+)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allPlayers.map((player) => (
                  <Button
                    key={player.id}
                    variant={selectedPlayerIds.includes(player.id) ? "default" : "outline"}
                    className={selectedPlayerIds.includes(player.id) ? "bg-neon-cyan text-primary-foreground" : ""}
                    onClick={() => handleTogglePlayer(player.id, player.name)}
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleGenerateTeams}
              disabled={players.length < 10}
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
        </>
      )}

      {teams && (
        <>
          <TeamDisplay teams={teams} lockedPlayers={lockedPlayers} onToggleLock={handleToggleLock} />
          <RandomizeControls
            onRandomizeTeams={handleRandomizeTeams}
            onRandomizeRoles={handleRandomizeRoles}
            onRandomizeBoth={handleRandomizeBoth}
            onExport={handleExport}
          />

          {/* Submit Game Result */}
          <Card className="border-border bg-card/50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Submit Game Result</h3>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleSubmitResult(0)}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Team 1 Won
                </Button>
                <Button
                  onClick={() => handleSubmitResult(1)}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Team 2 Won
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setTeams(null)}
              className="gap-2 hover:scale-105 transition-all duration-200"
            >
              Start Over
            </Button>
          </div>
        </>
      )}

      <ConditionsModal
        open={showConditions}
        onOpenChange={setShowConditions}
        players={players}
        conditions={conditions}
        onConditionsChange={setConditions}
      />
    </div>
  )
}

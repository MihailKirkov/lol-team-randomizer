import { useCallback } from "react"
import { generateTeams, randomizeRoles, randomizeTeams, randomizeBoth } from "@/lib/team-utils"
import type { PlayerCondition, Team } from "@/lib/types"
import { showToast } from "@/lib/toast"

export function useTeamRandomizer(
  players: string[],
  conditions: PlayerCondition[],
  teams: Team[] | null,
  setTeams: (teams: Team[] | null) => void,
  lockedPlayers: Set<string>,
) {
  const generate = useCallback(() => {
    if (players.length < 10) {
      showToast("ERROR", "Need at least 10 players.")
      return
    }
    setTeams(generateTeams(players, conditions, lockedPlayers))
  }, [players, conditions, lockedPlayers, setTeams])

  const randomizeTeamsHandler = useCallback(() => {
    if (!teams) return
    setTeams(randomizeTeams(teams, lockedPlayers))
  }, [teams, lockedPlayers, setTeams])

  const randomizeRolesHandler = useCallback(() => {
    if (!teams) return

    try {
      const updated = randomizeRoles(teams, conditions, lockedPlayers)
      setTeams(updated)
    } catch {
      showToast("ERROR", "Unable to randomize roles without conflict.")
    }
  }, [teams, conditions, lockedPlayers, setTeams])

  const randomizeBothHandler = useCallback(() => {
    if (!teams) return

    try {
      const updated = randomizeBoth(players, conditions, lockedPlayers, teams)
      setTeams(updated)
    } catch (err) {
      showToast("ERROR", "Could not switch all roles. Try again.")
    }
  }, [players, teams, conditions, lockedPlayers, setTeams])

  return {
    generate,
    randomizeTeamsHandler,
    randomizeRolesHandler,
    randomizeBothHandler,
  }
}

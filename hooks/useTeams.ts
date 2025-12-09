import { useState, useCallback } from "react"
import type { Team, PlayerCondition } from "../lib/types"
import {
  generateTeams,
  randomizeRoles,
  randomizeTeams,
  randomizeBoth
} from "../lib/team-utils"

/* -------------------------------------------------------------
   Custom hook to manage teams and player locks
------------------------------------------------------------- */

export function useTeams(
  playerNames: string[],
  conditions: PlayerCondition[]
) {
  const [teams, setTeams] = useState<Team[]>([])
  const [lockedPlayers, setLocked] = useState<Set<string>>(new Set())

  const lockPlayer = useCallback((name: string) => {
    setLocked(prev => new Set(prev).add(name))
  }, [])

  const unlockPlayer = useCallback((name: string) => {
    setLocked(prev => {
      const s = new Set(prev)
      s.delete(name)
      return s
    })
  }, [])

  const generate = useCallback(() => {
    setTeams(generateTeams(playerNames, conditions, lockedPlayers))
  }, [playerNames, conditions, lockedPlayers])

  const shuffleRoles = useCallback(() => {
    setTeams(prev => randomizeRoles(prev, conditions, lockedPlayers))
  }, [conditions, lockedPlayers])

  const shuffleTeams = useCallback(() => {
    setTeams(prev => randomizeTeams(prev, lockedPlayers))
  }, [lockedPlayers])

  const shuffleBoth = useCallback(() => {
    setTeams(randomizeBoth(playerNames, conditions, lockedPlayers))
  }, [playerNames, conditions, lockedPlayers])

  return {
    teams,
    lockedPlayers,
    lockPlayer,
    unlockPlayer,
    generate,
    shuffleRoles,
    shuffleTeams,
    shuffleBoth
  }
}

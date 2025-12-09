import type { Player, PlayerCondition, PlayerState, Role, Team } from "./types"
import { ROLES } from "./types"

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sortByRole(a: Player, b: Player): number {
  return ROLES.indexOf(a.role) - ROLES.indexOf(b.role)
}

/* -------------------------------------------------------------
   Conditions
------------------------------------------------------------- */

function getAllowedRoles(name: string, conditions: PlayerCondition[]): Role[] {
  const cond = conditions.find(c => c.playerName === name)
  if (!cond) return [...ROLES]
  return ROLES.filter(r => !cond.excludedRoles.includes(r))
}

/* -------------------------------------------------------------
   Core Role Assignment Engine
------------------------------------------------------------- */

interface AssignOptions {
  avoidCurrentRole?: boolean
}

function assignRolesToStates(
  players: PlayerState[],
  conditions: PlayerCondition[],
  options: AssignOptions = {}
): Player[] {
  const assigned: Player[] = []
  const used = new Set<Role>()

  // process locked players first
  for (const p of players) {
    if (p.locked && p.currentRole) {
      assigned.push({ name: p.name, role: p.currentRole })
      used.add(p.currentRole)
    }
  }

  const unlocked = shuffle(players.filter(p => !p.locked))

  for (const p of unlocked) {
    const allowed = getAllowedRoles(p.name, conditions)
      .filter(r => !used.has(r))
      .filter(r => !options.avoidCurrentRole || r !== p.currentRole)

    const role =
      allowed.length > 0
        ? randomFrom(allowed)
        : randomFrom(ROLES.filter(r => !used.has(r)) || ROLES)

    used.add(role)
    assigned.push({ name: p.name, role })
  }

  return assigned.sort(sortByRole)
}

/* -------------------------------------------------------------
   PUBLIC API (Your original function names)
------------------------------------------------------------- */

export function generateTeams(
  playerNames: string[],
  conditions: PlayerCondition[],
  lockedPlayers: Set<string> = new Set()
): Team[] {
  const shuffled = shuffle(playerNames)

  const team1Names = shuffled.slice(0, 5)
  const team2Names = shuffled.slice(5, 10)

  const makeState = (names: string[]): PlayerState[] =>
    names.map(name => ({
      name,
      locked: lockedPlayers.has(name),
      excludedRoles: conditions.find(c => c.playerName === name)?.excludedRoles || []
    }))

  return [
    { players: assignRolesToStates(makeState(team1Names), conditions) },
    { players: assignRolesToStates(makeState(team2Names), conditions) }
  ]
}

/* -------------------------------------------------------------
   Randomize roles but keep teams intact
------------------------------------------------------------- */

export function randomizeRoles(
  teams: Team[],
  conditions: PlayerCondition[],
  lockedPlayers: Set<string>
): Team[] {
  return teams.map(team => {
    const state: PlayerState[] = team.players.map(p => ({
      name: p.name,
      locked: lockedPlayers.has(p.name),
      excludedRoles: conditions.find(c => c.playerName === p.name)?.excludedRoles || [],
      currentRole: p.role
    }))

    return {
      players: assignRolesToStates(state, conditions, { avoidCurrentRole: true })
    }
  })
}

/* -------------------------------------------------------------
   Randomize teams but keep roles
------------------------------------------------------------- */

export function randomizeTeams(
  teams: Team[],
  lockedPlayers: Set<string>
): Team[] {
  const allPlayers = [...teams[0].players, ...teams[1].players]

  const locked = allPlayers.filter(p => lockedPlayers.has(p.name))
  const unlocked = allPlayers.filter(p => !lockedPlayers.has(p.name))

  const shuffledUnlocked = shuffle(unlocked)

  const team1Locked = locked.filter(p => teams[0].players.some(tp => tp.name === p.name))
  const team2Locked = locked.filter(p => teams[1].players.some(tp => tp.name === p.name))

  const team1 = [...team1Locked, ...shuffledUnlocked.slice(0, 5 - team1Locked.length)]
  const team2 = [...team2Locked, ...shuffledUnlocked.slice(5 - team1Locked.length)]

  return [
    { players: team1.sort(sortByRole) },
    { players: team2.sort(sortByRole) }
  ]
}

/* -------------------------------------------------------------
   Randomize both
------------------------------------------------------------- */

export function randomizeBoth(
  playerNames: string[],
  conditions: PlayerCondition[],
  lockedPlayers: Set<string>
): Team[] {
  return generateTeams(playerNames, conditions, lockedPlayers)
}

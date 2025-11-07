import type { Player, PlayerCondition, Team } from "./types"

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"] as const

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function getAvailableRoles(playerName: string, conditions: PlayerCondition[]): string[] {
  const condition = conditions.find((c) => c.playerName === playerName)
  if (!condition) return [...ROLES]
  return ROLES.filter((role) => !condition.excludedRoles.includes(role))
}

function assignRoles(playerNames: string[], conditions: PlayerCondition[]): Player[] {
  const players: Player[] = []
  const usedRoles = new Set<string>()
  const shuffledPlayers = shuffleArray(playerNames)

  // Try to assign roles respecting conditions
  for (const name of shuffledPlayers) {
    const availableRoles = getAvailableRoles(name, conditions).filter((role) => !usedRoles.has(role))

    if (availableRoles.length > 0) {
      const role = availableRoles[Math.floor(Math.random() * availableRoles.length)]
      players.push({ name, role })
      usedRoles.add(role)
    }
  }

  // Fill remaining players with remaining roles (fallback)
  const remainingPlayers = shuffledPlayers.filter((name) => !players.find((p) => p.name === name))
  const remainingRoles = ROLES.filter((role) => !usedRoles.has(role))

  for (let i = 0; i < remainingPlayers.length; i++) {
    players.push({
      name: remainingPlayers[i],
      role: remainingRoles[i] || ROLES[i % ROLES.length],
    })
  }

  return players.sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
}

export function generateTeams(
  playerNames: string[],
  conditions: PlayerCondition[],
  lockedPlayers: Set<string> = new Set(),
): Team[] {
  const unlocked = playerNames.filter((name) => !lockedPlayers.has(name))
  const shuffled = shuffleArray(unlocked)

  const team1Names = shuffled.slice(0, 5)
  const team2Names = shuffled.slice(5, 10)

  const team1 = assignRoles(team1Names, conditions)
  const team2 = assignRoles(team2Names, conditions)

  return [{ players: team1 }, { players: team2 }]
}

export function randomizeRoles(teams: Team[], conditions: PlayerCondition[], lockedPlayers: Set<string>): Team[] {
  return teams.map((team) => {
    const unlocked = team.players.filter((p) => !lockedPlayers.has(p.name))
    const locked = team.players.filter((p) => lockedPlayers.has(p.name))

    // Store current roles to avoid reassigning
    const currentRoleMap = new Map(unlocked.map((p) => [p.name, p.role]))

    const players: Player[] = []
    const usedRoles = new Set<string>(locked.map((p) => p.role))
    const shuffledPlayers = shuffleArray(unlocked.map((p) => p.name))

    // Assign new roles ensuring no player gets their current role
    for (const name of shuffledPlayers) {
      const currentRole = currentRoleMap.get(name)
      const availableRoles = getAvailableRoles(name, conditions).filter(
        (role) => !usedRoles.has(role) && role !== currentRole,
      )

      if (availableRoles.length > 0) {
        const role = availableRoles[Math.floor(Math.random() * availableRoles.length)]
        players.push({ name, role })
        usedRoles.add(role)
      }
    }

    // Fallback: if some players couldn't be assigned, try without the "no repeat" constraint
    const remainingPlayers = shuffledPlayers.filter((name) => !players.find((p) => p.name === name))
    const remainingRoles = ROLES.filter((role) => !usedRoles.has(role))

    for (let i = 0; i < remainingPlayers.length; i++) {
      players.push({
        name: remainingPlayers[i],
        role: remainingRoles[i] || ROLES[i % ROLES.length],
      })
    }

    return { players: [...locked, ...players].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)) }
  })
}

export function randomizeTeams(teams: Team[], lockedPlayers: Set<string>): Team[] {
  // Extract all unlocked players with their roles
  const allPlayers = teams.flatMap((team) => team.players)
  const unlocked = allPlayers.filter((p) => !lockedPlayers.has(p.name))
  const locked = allPlayers.filter((p) => lockedPlayers.has(p.name))

  // Shuffle unlocked players
  const shuffled = shuffleArray(unlocked)

  // Group locked players by team
  const team1Locked = locked.filter((p) => teams[0].players.some((tp) => tp.name === p.name))
  const team2Locked = locked.filter((p) => teams[1].players.some((tp) => tp.name === p.name))

  // Distribute shuffled players
  const team1Unlocked = shuffled.slice(0, 5 - team1Locked.length)
  const team2Unlocked = shuffled.slice(5 - team1Locked.length)

  return [
    { players: [...team1Locked, ...team1Unlocked].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)) },
    { players: [...team2Locked, ...team2Unlocked].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)) },
  ]
}

export function randomizeBoth(
  playerNames: string[],
  conditions: PlayerCondition[],
  lockedPlayers: Set<string>,
): Team[] {
  return generateTeams(playerNames, conditions, lockedPlayers)
}

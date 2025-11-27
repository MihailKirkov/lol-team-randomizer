export interface Player {
  name: string
  role: string
  alias?: string
}

export interface Team {
  players: Player[]
}

export interface PlayerCondition {
  playerName: string
  excludedRoles: string[]
}

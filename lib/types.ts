export interface Player {
  name: string
  role: string
}

export interface Team {
  players: Player[]
}

export interface PlayerCondition {
  playerName: string
  excludedRoles: string[]
}

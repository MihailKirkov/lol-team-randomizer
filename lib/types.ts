export const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"] as const
export type Role = typeof ROLES[number]

export interface Player {
  name: string
  role: Role
  alias?: string
}

export interface Team {
  players: Player[]
}

export interface PlayerCondition {
  playerName: string
  excludedRoles: Role[]
}

export interface PlayerState {
  name: string
  locked: boolean
  excludedRoles: Role[]
  currentRole?: Role
}

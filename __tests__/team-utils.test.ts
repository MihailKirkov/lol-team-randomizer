import {
  generateTeams,
  randomizeRoles,
  randomizeTeams,
  randomizeBoth
} from "../lib/team-utils"

import { PlayerCondition, ROLES } from "../lib/types"

const conditions: PlayerCondition[] = [
  { playerName: "A", excludedRoles: [] },
  { playerName: "B", excludedRoles: ["Jungle"] },
  { playerName: "C", excludedRoles: [] },
  { playerName: "D", excludedRoles: [] },
  { playerName: "E", excludedRoles: [] },
  { playerName: "F", excludedRoles: [] },
  { playerName: "G", excludedRoles: [] },
  { playerName: "H", excludedRoles: [] },
  { playerName: "I", excludedRoles: [] },
  { playerName: "J", excludedRoles: [] }
]

describe("team-utils", () => {
  const names = ["A","B","C","D","E","F","G","H","I","J"]

  test("generateTeams returns two teams of 5", () => {
    const teams = generateTeams(names, conditions)
    expect(teams.length).toBe(2)
    expect(teams[0].players.length).toBe(5)
    expect(teams[1].players.length).toBe(5)
  })

  test("generateTeams assigns valid roles", () => {
    const teams = generateTeams(names, conditions)
    teams.flatMap(t => t.players).forEach(p => {
      expect(ROLES.includes(p.role)).toBe(true)
    })
  })

  test("randomizeRoles keeps team sizes", () => {
    const teams = generateTeams(names, conditions)
    const randomized = randomizeRoles(teams, conditions, new Set())
    expect(randomized[0].players.length).toBe(5)
    expect(randomized[1].players.length).toBe(5)
  })

  test("randomizeTeams preserves roles", () => {
    const teams = generateTeams(names, conditions)
    const flattened = teams.flatMap(t => t.players)
    const randomized = randomizeTeams(teams, new Set())

    const rolesBefore = flattened.map(p => p.role).sort()
    const rolesAfter = randomized.flatMap(t => t.players).map(p => p.role).sort()

    expect(rolesAfter).toEqual(rolesBefore)
  })

  test("randomizeBoth produces fresh teams", () => {
    const t1 = generateTeams(names, conditions)
    const t2 = randomizeBoth(names, conditions, new Set())

    expect(t1.length).toBe(2)
    expect(t2.length).toBe(2)
  })
})

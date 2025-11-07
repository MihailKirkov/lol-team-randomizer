"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PlayerCondition } from "@/lib/types"

interface ConditionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  players: string[]
  conditions: PlayerCondition[]
  onConditionsChange: (conditions: PlayerCondition[]) => void
}

const roles = ["Top", "Jungle", "Mid", "ADC", "Support"]

export function ConditionsModal({ open, onOpenChange, players, conditions, onConditionsChange }: ConditionsModalProps) {
  const handleToggleRole = (playerName: string, role: string) => {
    const existingCondition = conditions.find((c) => c.playerName === playerName)

    if (!existingCondition) {
      onConditionsChange([...conditions, { playerName, excludedRoles: [role] }])
    } else {
      const updatedConditions = conditions.map((c) => {
        if (c.playerName === playerName) {
          const newExcluded = c.excludedRoles.includes(role)
            ? c.excludedRoles.filter((r) => r !== role)
            : [...c.excludedRoles, role]
          return { ...c, excludedRoles: newExcluded }
        }
        return c
      })
      onConditionsChange(updatedConditions.filter((c) => c.excludedRoles.length > 0))
    }
  }

  const isRoleExcluded = (playerName: string, role: string) => {
    const condition = conditions.find((c) => c.playerName === playerName)
    return condition?.excludedRoles.includes(role) ?? false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-effect border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">Role Conditions</DialogTitle>
          <p className="text-sm text-muted-foreground">Select roles that players cannot play</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {players.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Add players first to set role conditions</p>
          ) : (
            players.map((player) => (
              <div key={player} className="p-4 rounded-lg bg-secondary/30 space-y-3">
                <h4 className="font-bold text-foreground">{player}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center justify-center p-2 cursor-pointer rounded-md"  onClick={() => handleToggleRole(player,role)}>
                      {/* <Checkbox
                        id={`${player}-${role}`}
                        checked={isRoleExcluded(player, role)}
                        onCheckedChange={() => handleToggleRole(player, role)}
                      /> */}
                      <Label htmlFor={`${player}-${role}`}
                        className={`text-sm cursor-pointer ${isRoleExcluded(player, role) ? "text-red-500 font-bold line-through" : ""}`}>
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

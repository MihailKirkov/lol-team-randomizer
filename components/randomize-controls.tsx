"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shuffle, Users, Award, Download } from "lucide-react"
import { motion } from "framer-motion"

interface RandomizeControlsProps {
  onRandomizeTeams: () => void
  onRandomizeRoles: () => void
  onRandomizeBoth: () => void
  onExport: () => void
}

export function RandomizeControls({
  onRandomizeTeams,
  onRandomizeRoles,
  onRandomizeBoth,
  onExport,
}: RandomizeControlsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="glass-effect p-6 border-border/50 hover:border-border transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onRandomizeTeams}
              variant="outline"
              className="w-full gap-2 border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 bg-transparent transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20 group"
            >
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              Randomize Teams
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onRandomizeRoles}
              variant="outline"
              className="w-full gap-2 border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 bg-transparent transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20 group"
            >
              <Award className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              Randomize Roles
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onRandomizeBoth}
              variant="outline"
              className="w-full gap-2 border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 bg-transparent transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20 group"
            >
              <Shuffle className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
              Randomize Both
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onExport}
              variant="outline"
              className="w-full gap-2 border-muted-foreground/50 hover:border-foreground hover:bg-secondary bg-transparent transition-all duration-300 hover:shadow-lg group"
            >
              <Download className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-200" />
              Export
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

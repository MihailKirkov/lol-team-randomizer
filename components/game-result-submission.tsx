"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Team } from "@/lib/types"
import { createBrowserClient } from "@supabase/ssr"

interface GameResultSubmissionProps {
  teams: Team[]
}

export function GameResultSubmission({ teams }: GameResultSubmissionProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitResult = async (winningTeamIndex: number) => {
    setSubmitting(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const winningTeam = teams[winningTeamIndex]
    const losingTeam = teams[winningTeamIndex === 0 ? 1 : 0]

    try {
      const { error } = await supabase.from("game_results").insert({
        winning_team: winningTeam.players.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
        })),
        losing_team: losingTeam.players.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
        })),
        status: "pending",
        submitted_by: "User",
      })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error("Error submitting game result:", error)
      alert("Failed to submit game result. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-neon-cyan" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Record Game Result</h3>
          <p className="text-sm text-muted-foreground">Select the winning team to submit for admin approval</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 p-4"
          >
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-500 font-medium">Game result submitted! Waiting for admin approval.</p>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <Button
              onClick={() => handleSubmitResult(0)}
              disabled={submitting}
              className="h-14 bg-linear-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500 hover:to-blue-600 neon-glow-blue group transition-all duration-200 hover:scale-[1.02]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Trophy className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Team 1 Won
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSubmitResult(1)}
              disabled={submitting}
              className="h-14 bg-linear-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 neon-glow-red group transition-all duration-200 hover:scale-[1.02]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Trophy className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Team 2 Won
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

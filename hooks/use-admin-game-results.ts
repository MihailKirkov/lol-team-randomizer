"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface GameResult {
  id: string
  game_date: string
  winning_team: Array<{ id: string; name: string; role: string }>
  losing_team: Array<{ id: string; name: string; role: string }>
  status: "pending" | "approved" | "rejected"
  submitted_by: string
  created_at: string
}

export function useAdminGameResults() {
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadGameResults()
  }, [])

  const loadGameResults = async () => {
    const { data } = await supabase.from("game_results").select("*").order("created_at", { ascending: false })
    if (data) setGameResults(data)
  }

  const approveGameResult = async (gameResult: GameResult, onStatsUpdated?: () => void) => {
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase
        .from("game_results")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", gameResult.id)

      if (updateError) {
        console.error("[v0] Error updating game result:", updateError)
        throw updateError
      }

      const { error: statsError } = await supabase.rpc("update_player_statistics", {
        p_game_result_id: gameResult.id,
      })

      if (statsError) {
        console.error("[v0] Error updating player statistics:", statsError)
        throw statsError
      }

      await loadGameResults()
      if (onStatsUpdated) onStatsUpdated()

      alert("Game result approved and player statistics updated!")
    } catch (error) {
      console.error("[v0] Error approving game result:", error)
      alert("Failed to approve game result. Please check the console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  const rejectGameResult = async (id: string) => {
    setIsLoading(true)
    await supabase
      .from("game_results")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
    await loadGameResults()
    setIsLoading(false)
  }

  const pendingGameResults = gameResults.filter((g) => g.status === "pending")

  return {
    gameResults,
    pendingGameResults,
    isLoading,
    loadGameResults,
    approveGameResult,
    rejectGameResult,
  }
}

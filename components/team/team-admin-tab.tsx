"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X, Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface TeamAdminTabProps {
  teamId: string
}

interface GameResult {
  id: string
  winning_team: any[]
  losing_team: any[]
  game_date: string
  submitted_by: string
  status: string
  created_at: string
}

export function TeamAdminTab({ teamId }: TeamAdminTabProps) {
  const [pendingResults, setPendingResults] = useState<GameResult[]>([])
  const [processedResults, setProcessedResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadGameResults()
  }, [teamId])

  const loadGameResults = async () => {
    try {
      // Load pending results
      const { data: pending, error: pendingError } = await supabase
        .from("team_game_results")
        .select("*")
        .eq("team_id", teamId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (pendingError) throw pendingError

      // Load processed results
      const { data: processed, error: processedError } = await supabase
        .from("team_game_results")
        .select("*")
        .eq("team_id", teamId)
        .in("status", ["approved", "rejected"])
        .order("created_at", { ascending: false })
        .limit(10)

      if (processedError) throw processedError

      setPendingResults(pending || [])
      setProcessedResults(processed || [])
    } catch (error) {
      console.error("Error loading game results:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resultId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("team_game_results")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", resultId)

      if (error) throw error

      loadGameResults()
      alert("Game result approved! Player statistics updated.")
    } catch (error) {
      console.error("Error approving result:", error)
      alert("Failed to approve result")
    }
  }

  const handleReject = async (resultId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("team_game_results")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", resultId)

      if (error) throw error

      loadGameResults()
    } catch (error) {
      console.error("Error rejecting result:", error)
      alert("Failed to reject result")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Game Results */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Pending Game Results</CardTitle>
          <CardDescription>Review and approve game results to update player statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending game results</p>
          ) : (
            <div className="space-y-4">
              {pendingResults.map((result, idx) => (
                <motion.div
                  key={result.id}
                  className="p-4 rounded-lg bg-background/50 border border-border space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(result.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Winning Team */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <h4 className="font-semibold text-green-500">Winning Team</h4>
                      </div>
                      <div className="space-y-1 pl-6">
                        {result.winning_team.map((player: any, i: number) => (
                          <p key={i} className="text-sm">
                            {player.role}: {player.name}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Losing Team */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-500">Losing Team</h4>
                      <div className="space-y-1 pl-6">
                        {result.losing_team.map((player: any, i: number) => (
                          <p key={i} className="text-sm">
                            {player.role}: {player.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(result.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(result.id)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Processed Results */}
      {processedResults.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recently processed game results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="text-sm">Game from {new Date(result.game_date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.status === "approved" ? "Approved" : "Rejected"}{" "}
                      {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      result.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamPlayersTab } from "@/components/team/team-players-tab"
import { TeamGeneratorTab } from "@/components/team/team-generator-tab"
import { TeamStatsTab } from "@/components/team/team-stats-tab"
import { TeamAdminTab } from "@/components/team/team-admin-tab"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Users, Sparkles, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TeamPageProps {
  params: Promise<{ id: string }>
}

export default function TeamPage({ params }: TeamPageProps) {
  const { id: teamId } = use(params)
  const [team, setTeam] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>("member")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTeam()
  }, [teamId])

  const loadTeam = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load team info and user's role
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single()

      if (memberError) {
        router.push("/dashboard")
        return
      }

      setUserRole(memberData.role)

      const { data: teamData, error: teamError } = await supabase.from("teams").select("*").eq("id", teamId).single()

      if (teamError) throw teamError

      setTeam(teamData)
    } catch (error) {
      console.error("Error loading team:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  if (!team) return null

  const isAdmin = userRole === "admin"

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.header className="space-y-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 hover:bg-secondary hover:scale-105 transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="bg-linear-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent">
                  {team.name}
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">{isAdmin ? "Team Admin" : "Team Member"}</p>
            </div>
          </div>
        </motion.header>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50">
              <TabsTrigger value="players" className="gap-2">
                <Users className="h-4 w-4" />
                Players
              </TabsTrigger>
              <TabsTrigger value="generator" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="players" className="mt-6">
              <TeamPlayersTab teamId={teamId} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="generator" className="mt-6">
              <TeamGeneratorTab teamId={teamId} />
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <TeamStatsTab teamId={teamId} />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <TeamAdminTab teamId={teamId} />
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

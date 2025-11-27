"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plus, Users, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Team {
  id: string
  name: string
  created_at: string
  role: string
  member_count: number
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserAndTeams()
  }, [])

  const loadUserAndTeams = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Load teams the user is a member of
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          role,
          team_id,
          teams:team_id (
            id,
            name,
            created_at
          )
        `)
        .eq("user_id", user.id)

      if (error) throw error

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (data || []).map(async (item: any) => {
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", item.teams.id)

          return {
            id: item.teams.id,
            name: item.teams.name,
            created_at: item.teams.created_at,
            role: item.role,
            member_count: count || 0,
          }
        }),
      )

      setTeams(teamsWithCounts)
    } catch (error) {
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/guest">
              <Button variant="outline" className="gap-2 bg-transparent">
                Try Guest Mode
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.header>

        {/* Create Team Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/teams/create">
            <Button
              size="lg"
              className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow font-semibold h-12 px-6 hover:scale-[1.02] transition-all duration-200 group"
            >
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              Create New Team
            </Button>
          </Link>
        </motion.div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Teams Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first team to start organizing players and generating teams
            </p>
            <Link href="/teams/create">
              <Button size="lg" className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Team
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {teams.map((team, idx) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Link href={`/teams/${team.id}`}>
                  <Card className="group border-border bg-card/50 backdrop-blur-sm hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-neon-cyan transition-colors">
                            {team.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(team.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {team.role === "admin" && (
                          <span className="text-xs bg-neon-cyan/10 text-neon-cyan px-2 py-1 rounded-full">Admin</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {team.member_count} member{team.member_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

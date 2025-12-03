"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
console.log("email:", email)
      // Check if user is admin
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("email", email)
        .single()
        
console.log("adminProfile:", adminProfile)
console.log("profileError:", profileError)

      if (profileError || !adminProfile?.is_admin) {
        await supabase.auth.signOut()
        throw new Error("Access denied. Admin privileges required.")
      }

      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md p-6">
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 ring-2 ring-cyan-500/20">
              <Shield className="h-8 w-8 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-cyan-50">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-cyan-500/20 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-cyan-500/20 bg-slate-800/50 text-slate-100"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

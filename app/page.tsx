"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, Users, Shield, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { PlayerCondition, Team } from "@/lib/types"
import { generateTeams, randomizeBoth, randomizeRoles, randomizeTeams } from "@/lib/team-utils"


export default function Page() {

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-neon-cyan/10 via-transparent to-blue-500/10 animate-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main heading */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="bg-linear-to-r from-neon-cyan via-blue-400 to-neon-cyan bg-clip-text text-transparent animate-gradient">
                LoL Team Randomizer
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Generate balanced League of Legends teams with smart role assignments. Track stats, manage teams, and
              improve your gameplay.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/guest">
                <Button
                  size="lg"
                  className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 neon-glow font-semibold text-lg h-14 px-8 hover:scale-[1.02] transition-all duration-200 group"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                  Try as Guest
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>

              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg bg-transparent hover:bg-secondary border-neon-cyan/30 hover:border-neon-cyan hover:scale-[1.02] transition-all duration-200"
                >
                  Login / Register
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mt-24"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {/* Feature 1 */}
            <motion.div
              className="group relative p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-neon-cyan/10 group-hover:bg-neon-cyan/20 transition-colors duration-300">
                  <Sparkles className="h-6 w-6 text-neon-cyan" />
                </div>
                <h3 className="text-xl font-semibold">Smart Randomization</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Automatically generate balanced teams with role assignments. Randomize teams, roles, or both with
                advanced conditions.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="group relative p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-neon-cyan/10 group-hover:bg-neon-cyan/20 transition-colors duration-300">
                  <Users className="h-6 w-6 text-neon-cyan" />
                </div>
                <h3 className="text-xl font-semibold">Team Management</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Create teams, invite members, and manage your player roster. Connect with real League accounts for rank
                display.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="group relative p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-neon-cyan/10 group-hover:bg-neon-cyan/20 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-neon-cyan" />
                </div>
                <h3 className="text-xl font-semibold">Statistics & Analytics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Track wins, losses, and performance metrics. View detailed statistics and improve your team composition.
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="text-muted-foreground mb-6">Join players already using LoL Team Randomizer</p>
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="gap-2 bg-transparent hover:bg-secondary border-neon-cyan/30 hover:border-neon-cyan hover:scale-105 transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Player {
  id: string
  name: string
  alias?: string
  created_at: string
  wins: number
  losses: number
  games_played: number
  win_rate: number
  riot_summoner_name?: string
  riot_tier?: string
  riot_rank?: string
  riot_lp?: number
  riot_region?: string
  riot_last_synced?: string
}

export function useAdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("players").select("*").order("name")
    if (data) setPlayers(data)
    setIsLoading(false)
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.alias && player.alias.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const addPlayer = async (name: string, alias: string) => {
    setIsLoading(true)
    const insertData: { name: string; alias?: string } = { name: name.trim() }
    if (alias.trim()) {
      insertData.alias = alias.trim()
    }
    const { error } = await supabase.from("players").insert(insertData)
    if (!error) {
      await loadPlayers()
      return true
    }
    setIsLoading(false)
    return false
  }

  const updatePlayer = async (id: string, name: string, alias: string) => {
    setIsLoading(true)
    const updateData: { name: string; alias?: string | null } = { name: name.trim() }
    updateData.alias = alias.trim() || null
    const { error } = await supabase.from("players").update(updateData).eq("id", id)
    if (!error) {
      await loadPlayers()
      return true
    }
    setIsLoading(false)
    return false
  }

  const deletePlayer = async (id: string) => {
    setIsLoading(true)
    await supabase.from("players").delete().eq("id", id)
    await loadPlayers()
    setIsLoading(false)
  }

  return {
    players: filteredPlayers,
    isLoading,
    searchQuery,
    setSearchQuery,
    loadPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
  }
}

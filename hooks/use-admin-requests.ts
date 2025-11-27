"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface PlayerRequest {
  id: string
  name: string
  alias?: string
  riot_id?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function useAdminRequests() {
  const [requests, setRequests] = useState<PlayerRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const { data } = await supabase.from("player_requests").select("*").order("created_at", { ascending: false })
    if (data) setRequests(data)
  }

  const approveRequest = async (request: PlayerRequest, onPlayerAdded?: () => void) => {
    setIsLoading(true)

    const insertData: { name: string; alias?: string } = { name: request.name }
    if (request.alias) {
      insertData.alias = request.alias
    }

    const { error: playerError } = await supabase.from("players").insert(insertData)

    if (!playerError) {
      await supabase.from("player_requests").update({ status: "approved" }).eq("id", request.id)
      await loadRequests()
      if (onPlayerAdded) onPlayerAdded()
    }
    setIsLoading(false)
  }

  const rejectRequest = async (id: string) => {
    setIsLoading(true)
    await supabase.from("player_requests").update({ status: "rejected" }).eq("id", id)
    await loadRequests()
    setIsLoading(false)
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return {
    requests,
    pendingRequests,
    isLoading,
    loadRequests,
    approveRequest,
    rejectRequest,
  }
}

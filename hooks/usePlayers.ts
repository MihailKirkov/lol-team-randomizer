"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lol_randomizer_players_v1"

export interface Player {
  id: string
  name: string
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPlayers(JSON.parse(stored))
      }
    } catch {
      console.warn("Invalid player data in localStorage")
    }
  }, [])

  // Persist to localStorage whenever players change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
  }, [players])

  // --- Actions ---

  const addPlayers = useCallback((names: string[]) => {
    setPlayers((prev) => {
      const newEntries = names
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .map((name) => ({ id: crypto.randomUUID(), name }))
      return [...prev, ...newEntries]
    })
  }, [])

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const editPlayer = useCallback((id: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
    )
  }, [])

  const clearPlayers = useCallback(() => setPlayers([]), [])

  return {
    players,
    addPlayers,
    removePlayer,
    editPlayer,
    clearPlayers,
    setPlayers, // still expose for flexibility
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { syncRiotAccountData, type RiotRegion } from "@/lib/riot-api"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { playerId, summonerName, region } = await request.json()

    if (!playerId || !summonerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Sync Riot data
    const riotData = await syncRiotAccountData(summonerName, region as RiotRegion)

    if (!riotData) {
      return NextResponse.json(
        { error: "Failed to fetch Riot account data. Please check the summoner name." },
        { status: 404 },
      )
    }

    // Update player in database
    const supabase = await createServerClient()

    const updateData: any = {
      riot_summoner_name: summonerName,
      riot_puuid: riotData.summoner.puuid,
      riot_summoner_id: riotData.summoner.id,
      riot_region: region,
      riot_last_synced: new Date().toISOString(),
    }

    if (riotData.rankData) {
      updateData.riot_tier = riotData.rankData.tier
      updateData.riot_rank = riotData.rankData.rank
      updateData.riot_lp = riotData.rankData.lp
      updateData.riot_wins = riotData.rankData.wins
      updateData.riot_losses = riotData.rankData.losses
    }

    const { data, error } = await supabase.from("players").update(updateData).eq("id", playerId).select().single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to update player data" }, { status: 500 })
    }

    return NextResponse.json({ success: true, player: data })
  } catch (error) {
    console.error("[v0] Error in riot sync route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

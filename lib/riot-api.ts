// Riot API integration for League of Legends player data
const RIOT_API_KEY = process.env.RIOT_API_KEY || ""

export type RiotRegion = "na1" | "euw1" | "eun1" | "kr" | "br1" | "jp1" | "ru" | "oc1" | "tr1" | "la1" | "la2"
export type RiotRoutingValue = "americas" | "europe" | "asia" | "sea"

const REGION_TO_ROUTING: Record<RiotRegion, RiotRoutingValue> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
}

export interface RiotSummoner {
  id: string // Encrypted summoner ID
  accountId?: string
  puuid: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface RiotLeagueEntry {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  hotStreak: boolean
  veteran: boolean
  freshBlood: boolean
  inactive: boolean
}

export interface PlayerRankData {
  tier: string
  rank: string
  lp: number
  wins: number
  losses: number
}

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

/**
 * Fetch summoner data by summoner name and region
 */
export async function fetchSummonerByName(
  summonerName: string,
  region: RiotRegion = "na1",
): Promise<RiotSummoner | null> {
  if (!RIOT_API_KEY) {
    console.error("[v0] RIOT_API_KEY is not configured")
    return null
  }

  try {
    const encodedName = encodeURIComponent(summonerName)
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedName}`

    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    })

    if (!response.ok) {
      console.error(`[v0] Riot API error: ${response.status} ${response.statusText}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching summoner data:", error)
    return null
  }
}

export async function fetchRankByPuuid(
  puuid: string,
  region: RiotRegion = "na1",
): Promise<PlayerRankData | null> {
  if (!RIOT_API_KEY) {
    console.error("[v0] RIOT_API_KEY is not configured")
    return null
  }

  try {
    const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`

    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[v0] Riot API error (rank by puuid): ${response.status} ${response.statusText}`, errorBody)
      return null
    }

    const entries: RiotLeagueEntry[] = await response.json()

    const soloQueue = entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5")
    if (!soloQueue) return null

    return {
      tier: soloQueue.tier,
      rank: soloQueue.rank,
      lp: soloQueue.leaguePoints,
      wins: soloQueue.wins,
      losses: soloQueue.losses,
    }
  } catch (error) {
    console.error("[v0] Error fetching rank data by puuid:", error)
    return null
  }
}

/**
 * Fetch account data by Riot ID (gameName#tagLine) using Account-V1 API
 */
export async function fetchAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: RiotRegion = "na1",
): Promise<RiotAccount | null> {
  if (!RIOT_API_KEY) {
    console.error("[v0] RIOT_API_KEY is not configured")
    return null
  }

  try {
    const routingValue = REGION_TO_ROUTING[region]
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)
    const url = `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`

    console.log("[v0] Fetching Riot account:", { gameName, tagLine, region, routingValue })

    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[v0] Riot API error: ${response.status} ${response.statusText}`, errorBody)
      return null
    }

    const account = await response.json()
    console.log("[v0] Successfully fetched Riot account")
    return account
  } catch (error) {
    console.error("[v0] Error fetching account data:", error)
    return null
  }
}

/**
 * Fetch summoner data by PUUID
 */

export async function fetchSummonerByPuuid(puuid: string, region: RiotRegion = "na1"): Promise<RiotSummoner | null> {
  if (!RIOT_API_KEY) {
    console.error("[v0] RIOT_API_KEY is not configured")
    return null
  }

  try {
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`

    console.log("[v0] Fetching summoner by PUUID:", { region, puuid })

    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    })
    console.log('[v0] Riot API response body:', response.clone().body);

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[v0] Riot API error: ${response.status} ${response.statusText}`, errorBody)
      return null
    }

    const summoner = await response.json()
    console.log("[v0] Successfully fetched summoner data:", JSON.stringify(summoner, null, 2))
    return summoner
  } catch (error) {
    console.error("[v0] Error fetching summoner data:", error)
    return null
  }
}

/**
 * Sync player's Riot account data using Riot ID (gameName#tagLine)
 */
export async function syncRiotAccountData(riotId: string, region: RiotRegion = "na1") {
  // Parse Riot ID (format: GameName#TAG)
  const parts = riotId.split("#")
  if (parts.length !== 2) {
    console.error("[v0] Invalid Riot ID format. Expected: GameName#TAG")
    return null
  }

  const [gameName, tagLine] = parts

  console.log("[v0] Starting Riot account sync:", { riotId, region })

  // Step 1: Get account (PUUID) from Riot ID
  const account = await fetchAccountByRiotId(gameName, tagLine, region)
  if (!account) {
    console.error("[v0] Failed to fetch Riot account")
    return null
  }

  console.log("[v0] Account PUUID:", account.puuid)

  // Step 2: (optional) Get summoner data using PUUID – may not include id/accountId for some players
  const summoner = await fetchSummonerByPuuid(account.puuid, region)
  if (!summoner) {
    console.warn("[v0] Failed to fetch summoner data, continuing with account + rank only")
  } else {
    console.log("[v0] Successfully fetched summoner data:", JSON.stringify(summoner, null, 2))
  }

  // Step 3: Get rank data using **PUUID**, not summonerId
  const rankData = await fetchRankByPuuid(account.puuid, region)

  console.log("[v0] Riot account sync complete")

  return {
    account,
    summoner,
    rankData,
  }
}


/**
 * Get rank display string (e.g., "Gold II", "Master", "Unranked")
 */
export function getRankDisplay(tier?: string | null, rank?: string | null): string {
  if (!tier) return "Unranked"

  // Master, Grandmaster, and Challenger don't have divisions
  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
    return tier.charAt(0) + tier.slice(1).toLowerCase()
  }

  if (!rank) return tier.charAt(0) + tier.slice(1).toLowerCase()

  return `${tier.charAt(0)}${tier.slice(1).toLowerCase()} ${rank}`
}

/**
 * Get rank color for UI display
 */
export function getRankColor(tier?: string | null): string {
  if (!tier) return "text-slate-400"

  const tierUpper = tier.toUpperCase()

  const colorMap: Record<string, string> = {
    IRON: "text-slate-400",
    BRONZE: "text-orange-600",
    SILVER: "text-slate-300",
    GOLD: "text-yellow-400",
    PLATINUM: "text-cyan-400",
    EMERALD: "text-emerald-400",
    DIAMOND: "text-blue-400",
    MASTER: "text-purple-400",
    GRANDMASTER: "text-red-400",
    CHALLENGER: "text-amber-300",
  }

  return colorMap[tierUpper] || "text-slate-400"
}

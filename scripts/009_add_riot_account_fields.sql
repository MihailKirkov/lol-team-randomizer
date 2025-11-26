-- Add Riot API account fields to players table
ALTER TABLE players
ADD COLUMN riot_summoner_name TEXT,
ADD COLUMN riot_puuid TEXT,
ADD COLUMN riot_summoner_id TEXT,
ADD COLUMN riot_region TEXT DEFAULT 'na1',
ADD COLUMN riot_tier TEXT,
ADD COLUMN riot_rank TEXT,
ADD COLUMN riot_lp INTEGER DEFAULT 0,
ADD COLUMN riot_wins INTEGER DEFAULT 0,
ADD COLUMN riot_losses INTEGER DEFAULT 0,
ADD COLUMN riot_last_synced TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX idx_players_riot_puuid ON players(riot_puuid);
CREATE INDEX idx_players_riot_summoner_id ON players(riot_summoner_id);

-- Update RLS policies to allow reading riot data
-- (Already covered by existing SELECT policy, but adding comment for clarity)
COMMENT ON COLUMN players.riot_summoner_name IS 'Riot Games summoner name for League of Legends';
COMMENT ON COLUMN players.riot_tier IS 'Current ranked tier (IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER)';
COMMENT ON COLUMN players.riot_rank IS 'Current division rank (I, II, III, IV)';

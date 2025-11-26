-- Add riot_id field to player_requests table
ALTER TABLE player_requests
ADD COLUMN IF NOT EXISTS riot_id TEXT;

-- Update the comment
COMMENT ON COLUMN player_requests.riot_id IS 'Optional Riot ID (GameName#TAG) submitted with player request';

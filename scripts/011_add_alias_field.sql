-- Add alias field to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS alias TEXT;

-- Add alias field to player_requests table
ALTER TABLE player_requests ADD COLUMN IF NOT EXISTS alias TEXT;

-- Update RLS policies to include alias in search/display operations
-- (Existing policies already allow reading alias since they allow all columns)

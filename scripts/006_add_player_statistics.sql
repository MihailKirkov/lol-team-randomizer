-- Add statistics columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;

-- Create function to update win rate
CREATE OR REPLACE FUNCTION update_player_win_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.games_played > 0 THEN
    NEW.win_rate := ROUND((NEW.wins::DECIMAL / NEW.games_played::DECIMAL) * 100, 2);
  ELSE
    NEW.win_rate := 0.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update win rate
DROP TRIGGER IF EXISTS trigger_update_win_rate ON players;
CREATE TRIGGER trigger_update_win_rate
  BEFORE UPDATE OF wins, losses, games_played ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_win_rate();

-- Add comment for documentation
COMMENT ON COLUMN players.wins IS 'Total number of games won';
COMMENT ON COLUMN players.losses IS 'Total number of games lost';
COMMENT ON COLUMN players.games_played IS 'Total number of games played';
COMMENT ON COLUMN players.win_rate IS 'Win rate percentage (automatically calculated)';

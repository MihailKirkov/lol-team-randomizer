-- Create function to update player statistics when a game is approved
CREATE OR REPLACE FUNCTION update_player_statistics(
  p_game_result_id UUID
)
RETURNS void AS $$
DECLARE
  v_winning_team JSONB;
  v_losing_team JSONB;
  v_player JSONB;
BEGIN
  -- Get the game result
  SELECT winning_team, losing_team
  INTO v_winning_team, v_losing_team
  FROM game_results
  WHERE id = p_game_result_id AND status = 'approved';

  IF v_winning_team IS NULL THEN
    RETURN;
  END IF;

  -- Update winning team players
  FOR v_player IN SELECT * FROM jsonb_array_elements(v_winning_team)
  LOOP
    UPDATE players
    SET 
      wins = wins + 1,
      games_played = games_played + 1,
      updated_at = NOW()
    WHERE id = (v_player->>'id')::UUID;
  END LOOP;

  -- Update losing team players
  FOR v_player IN SELECT * FROM jsonb_array_elements(v_losing_team)
  LOOP
    UPDATE players
    SET 
      losses = losses + 1,
      games_played = games_played + 1,
      updated_at = NOW()
    WHERE id = (v_player->>'id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION update_player_statistics(UUID) TO authenticated;

COMMENT ON FUNCTION update_player_statistics IS 'Updates player statistics when a game result is approved';

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  img TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table (users belonging to teams)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create team_players table (players specific to each team)
CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  alias TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  win_rate NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN games_played > 0 THEN ROUND((wins::NUMERIC / games_played::NUMERIC) * 100, 2)
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- Create team_invite_links table (for managing invite links)
CREATE TABLE IF NOT EXISTS team_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  link TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(team_id, link)
);

-- Create team_invites table (pending invitations)
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(team_id, invited_email)
);

-- Create team_game_results table (game results specific to teams)
CREATE TABLE IF NOT EXISTS team_game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  winning_team JSONB NOT NULL,
  losing_team JSONB NOT NULL,
  game_date TIMESTAMPTZ DEFAULT NOW(),
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_player_requests table (requests to add players to teams)
CREATE TABLE IF NOT EXISTS team_player_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  alias TEXT,
  riot_id TEXT,
  requested_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_player_requests ENABLE ROW LEVEL SECURITY;


-- RLS Policies for teams
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team admins can update teams"
  ON teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete teams"
  ON teams FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_members
CREATE OR REPLACE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members AS tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE OR REPLACE POLICY "Team admins can remove members"
  ON team_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members AS tm
      WHERE tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

CREATE OR REPLACE POLICY "Team admins can update member roles"
  ON team_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members AS tm
      WHERE tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );


-- RLS Policies for team_players
CREATE POLICY "Team members can view players"
  ON team_players FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can add players"
  ON team_players FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update players"
  ON team_players FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete players"
  ON team_players FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_invites
CREATE POLICY "Team members can view invites"
  ON team_invites FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete invites"
  ON team_invites FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_game_results
CREATE POLICY "Team members can view game results"
  ON team_game_results FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can submit game results"
  ON team_game_results FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can review game results"
  ON team_game_results FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete game results"
  ON team_game_results FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_player_requests
CREATE POLICY "Team members can view player requests"
  ON team_player_requests FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create player requests"
  ON team_player_requests FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update player requests"
  ON team_player_requests FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete player requests"
  ON team_player_requests FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_invite_links
CREATE POLICY "Team members can view invite links"
  ON team_invite_links FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can create invite links"
  ON team_invite_links FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );


CREATE POLICY "Team admins can delete invite links"
  ON team_invite_links FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );


-- Create function to update team stats when game is approved
CREATE OR REPLACE FUNCTION update_team_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Update winning team players
    UPDATE team_players
    SET 
      wins = wins + 1,
      games_played = games_played + 1,
      updated_at = NOW()
    WHERE id IN (
      SELECT (jsonb_array_elements(NEW.winning_team)->>'playerId')::UUID
    ) AND team_id = NEW.team_id;
    
    -- Update losing team players
    UPDATE team_players
    SET 
      losses = losses + 1,
      games_played = games_played + 1,
      updated_at = NOW()
    WHERE id IN (
      SELECT (jsonb_array_elements(NEW.losing_team)->>'playerId')::UUID
    ) AND team_id = NEW.team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for team game results
DROP TRIGGER IF EXISTS update_team_player_stats_trigger ON team_game_results;
CREATE TRIGGER update_team_player_stats_trigger
  AFTER INSERT OR UPDATE ON team_game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_team_player_stats();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_game_results_team_id ON team_game_results(team_id);
CREATE INDEX IF NOT EXISTS idx_team_game_results_status ON team_game_results(status);
CREATE INDEX IF NOT EXISTS idx_team_player_requests_team_id ON team_player_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invite_links_expires_at ON team_invite_links(expires_at);

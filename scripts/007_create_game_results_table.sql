-- Create game_results table to track match outcomes
CREATE TABLE IF NOT EXISTS game_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_date TIMESTAMPTZ DEFAULT NOW(),
  winning_team JSONB NOT NULL, -- Array of player objects with {id, name, role}
  losing_team JSONB NOT NULL, -- Array of player objects with {id, name, role}
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT, -- Optional: track who submitted the result
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  notes TEXT, -- Optional notes or comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_results_status ON game_results(status);
CREATE INDEX IF NOT EXISTS idx_game_results_game_date ON game_results(game_date DESC);

-- Enable Row Level Security
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view approved game results
CREATE POLICY "Anyone can view approved game results"
  ON game_results
  FOR SELECT
  USING (status = 'approved' OR auth.role() = 'authenticated');

-- RLS Policy: Anyone can submit game results
CREATE POLICY "Anyone can submit game results"
  ON game_results
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can update/delete game results
CREATE POLICY "Only admins can update game results"
  ON game_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete game results"
  ON game_results
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE game_results IS 'Stores game results submitted by users and approved by admins';

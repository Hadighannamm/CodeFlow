-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id)
);

-- Create poll_options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX polls_question_id_idx ON polls(question_id);
CREATE INDEX poll_options_poll_id_idx ON poll_options(poll_id);
CREATE INDEX poll_votes_poll_id_idx ON poll_votes(poll_id);
CREATE INDEX poll_votes_user_id_idx ON poll_votes(user_id);
CREATE INDEX poll_votes_option_id_idx ON poll_votes(option_id);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: Anyone can read, authenticated users can create
CREATE POLICY "Polls are viewable by everyone" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Poll Options: Anyone can read
CREATE POLICY "Poll options are viewable by everyone" ON poll_options
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create poll options" ON poll_options
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Poll Votes: Users can only see their own votes, can create their own votes
CREATE POLICY "Users can read their own poll votes" ON poll_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote on polls" ON poll_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create a function to increment votes when a vote is cast
CREATE OR REPLACE FUNCTION increment_poll_option_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poll_options
  SET votes = votes + 1
  WHERE id = NEW.option_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when a vote is inserted
CREATE TRIGGER poll_vote_increment
AFTER INSERT ON poll_votes
FOR EACH ROW
EXECUTE FUNCTION increment_poll_option_votes();

-- Create a function to decrement votes when a vote is deleted
CREATE OR REPLACE FUNCTION decrement_poll_option_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poll_options
  SET votes = votes - 1
  WHERE id = OLD.option_id AND votes > 0;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when a vote is deleted
CREATE TRIGGER poll_vote_decrement
AFTER DELETE ON poll_votes
FOR EACH ROW
EXECUTE FUNCTION decrement_poll_option_votes();

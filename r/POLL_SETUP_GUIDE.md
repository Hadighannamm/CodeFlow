# Poll Feature Setup Guide

This guide will help you set up the poll feature in your Supabase database.

## Prerequisites
- Supabase account and project already created
- Access to Supabase SQL Editor

## Setup Instructions

### Step 1: Run SQL Script in Supabase

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the **SQL Editor** section in the left sidebar
3. Click **New Query** to create a new SQL query
4. Copy the entire contents of `POLL_SETUP.sql` from this project
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create:
- `polls` table - stores polls linked to questions
- `poll_options` table - stores individual poll options with vote counts
- `poll_votes` table - stores which users voted on which options
- Indexes for optimal query performance
- Row Level Security (RLS) policies to control access
- Triggers to automatically update vote counts

### Step 2: Verify Tables Were Created

1. In Supabase, go to **Table Editor**
2. You should see three new tables:
   - `polls`
   - `poll_options`
   - `poll_votes`

### Step 3: Test the Poll Feature

1. Start your development server: `npm run dev`
2. Create a new question and check the "Add a poll to this question" option
3. Add at least 2 poll options
4. Submit the question
5. Go to the question details page
6. You should see the poll displayed with voting options

## Table Schema

### polls
```
- id (UUID): Primary key
- question_id (UUID): Foreign key to questions table
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp
```

### poll_options
```
- id (UUID): Primary key
- poll_id (UUID): Foreign key to polls table
- text (TEXT): The poll option text
- votes (INTEGER): Number of votes for this option
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp
```

### poll_votes
```
- id (UUID): Primary key
- poll_id (UUID): Foreign key to polls table
- option_id (UUID): Foreign key to poll_options table
- user_id (UUID): Foreign key to auth.users table
- created_at (TIMESTAMP): Timestamp when vote was cast
```

## Security Features

### Row Level Security (RLS)
- **Polls**: Anyone can read, authenticated users can create
- **Poll Options**: Anyone can read, authenticated users can create
- **Poll Votes**: Users can only see their own votes, can only create their own votes

### Vote Integrity
- Each user can only vote once per poll (UNIQUE constraint on poll_id + user_id)
- Vote counts are automatically updated via triggers
- Deleting a poll automatically deletes all related options and votes (CASCADE)

## Troubleshooting

### "relation does not exist" error
If you get an error that a table doesn't exist:
1. Check that the SQL script ran successfully (look for green checkmark)
2. Refresh the Table Editor page
3. Make sure you're looking at the correct Supabase project

### Poll not showing on question detail page
1. Make sure the poll tables are created
2. Check browser console for any error messages
3. Verify the question has a poll by checking the Supabase Table Editor

### Can't vote on poll
1. Make sure you're logged in
2. Check that RLS policies are enabled (you can see this in Table Editor > RLS)
3. Verify your user ID is stored correctly in auth.users

## Additional Notes

- The poll feature is fully integrated with your React app
- Polls are created when you submit a question with poll options
- Each user can only vote once per poll
- Vote counts update in real-time via the database triggers
- Polls cannot be edited or deleted once created (by design)

If you encounter any issues, check the browser console and Supabase logs for error messages.

-- Add columns for responsibilities and learnings to experience records.
-- Run this once in Supabase SQL Editor (Dashboard > SQL Editor > New query).

ALTER TABLE experience
  ADD COLUMN IF NOT EXISTS responsibilities_th TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS responsibilities_en TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS learnings_th TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS learnings_en TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS images TEXT DEFAULT '[]';

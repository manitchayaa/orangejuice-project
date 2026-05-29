-- Add separated faculty and major fields for education records.
-- Run this once in Supabase SQL Editor for existing databases.

ALTER TABLE education
  ADD COLUMN IF NOT EXISTS faculty_th TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS faculty_en TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS major_th TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS major_en TEXT DEFAULT '';

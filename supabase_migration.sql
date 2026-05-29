-- ============================================================
-- Portfolio Platform — Supabase Migration Script
-- รันใน Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name_th TEXT DEFAULT '',
  full_name_en TEXT DEFAULT '',
  title_th TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  bio_th TEXT DEFAULT '',
  bio_en TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location_th TEXT DEFAULT '',
  location_en TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cv_url TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  preferred_theme TEXT DEFAULT 'dark',
  preferred_lang TEXT DEFAULT 'th',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school_th TEXT DEFAULT '',
  school_en TEXT DEFAULT '',
  degree_th TEXT DEFAULT '',
  degree_en TEXT DEFAULT '',
  faculty_th TEXT DEFAULT '',
  faculty_en TEXT DEFAULT '',
  major_th TEXT DEFAULT '',
  major_en TEXT DEFAULT '',
  field_th TEXT DEFAULT '',
  field_en TEXT DEFAULT '',
  description_th TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  start_year TEXT DEFAULT '',
  end_year TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EXPERIENCE
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_th TEXT DEFAULT '',
  company_en TEXT DEFAULT '',
  position_th TEXT DEFAULT '',
  position_en TEXT DEFAULT '',
  description_th TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  type TEXT DEFAULT 'internship',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_th TEXT DEFAULT '',
  category_en TEXT DEFAULT '',
  name TEXT DEFAULT '',
  proficiency INT DEFAULT 50,
  icon_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title_th TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  description_th TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  tech_stack TEXT DEFAULT '[]',
  image_url TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  demo_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  paper_url TEXT DEFAULT '',
  year TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title_th TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  issuer_th TEXT DEFAULT '',
  issuer_en TEXT DEFAULT '',
  issue_date TEXT DEFAULT '',
  credential_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SOCIAL LINKS
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT DEFAULT '',
  url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Helper function for child tables
CREATE OR REPLACE FUNCTION is_owner(p_profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = p_profile_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- EDUCATION policies
CREATE POLICY "education_select_public" ON education FOR SELECT USING (true);
CREATE POLICY "education_insert_own" ON education FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "education_update_own" ON education FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "education_delete_own" ON education FOR DELETE USING (is_owner(profile_id));

-- EXPERIENCE policies
CREATE POLICY "experience_select_public" ON experience FOR SELECT USING (true);
CREATE POLICY "experience_insert_own" ON experience FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "experience_update_own" ON experience FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "experience_delete_own" ON experience FOR DELETE USING (is_owner(profile_id));

-- SKILLS policies
CREATE POLICY "skills_select_public" ON skills FOR SELECT USING (true);
CREATE POLICY "skills_insert_own" ON skills FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "skills_update_own" ON skills FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "skills_delete_own" ON skills FOR DELETE USING (is_owner(profile_id));

-- PROJECTS policies
CREATE POLICY "projects_select_public" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_own" ON projects FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "projects_update_own" ON projects FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "projects_delete_own" ON projects FOR DELETE USING (is_owner(profile_id));

-- CERTIFICATES policies
CREATE POLICY "certificates_select_public" ON certificates FOR SELECT USING (true);
CREATE POLICY "certificates_insert_own" ON certificates FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "certificates_update_own" ON certificates FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "certificates_delete_own" ON certificates FOR DELETE USING (is_owner(profile_id));

-- SOCIAL LINKS policies
CREATE POLICY "social_links_select_public" ON social_links FOR SELECT USING (true);
CREATE POLICY "social_links_insert_own" ON social_links FOR INSERT WITH CHECK (is_owner(profile_id));
CREATE POLICY "social_links_update_own" ON social_links FOR UPDATE USING (is_owner(profile_id));
CREATE POLICY "social_links_delete_own" ON social_links FOR DELETE USING (is_owner(profile_id));

-- ============================================================
-- STORAGE BUCKETS (ต้องสร้างผ่าน Dashboard > Storage)
-- หรือรัน SQL นี้:
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "avatar_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatar_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatar_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "projects_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "projects_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "projects_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "projects_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "certificates_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "certificates_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "certificates_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "certificates_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "cvs_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'cvs');
CREATE POLICY "cvs_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name_en, email, avatar_url)
  VALUES (
    NEW.id,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.id::text), ' ', '')),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPDATED_AT auto-update trigger for profiles
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

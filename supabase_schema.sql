-- ==========================================
-- SUPABASE COMPLETE DATABASE SCHEMA
-- Application: Media Archive (คลังผลงานโสตฯ)
-- Designed for: Supabase PostgreSQL with Row-Level Security (RLS)
-- ==========================================

-- 1. Create DB Enumerations and Types if needed
-- (We use standard text-based columns with constraints for maximum flexibility)

-- 2. Create Users/Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Media Items Table
CREATE TABLE public.media_items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(title) <= 100),
    description TEXT CHECK (char_length(description) <= 500),
    link TEXT NOT NULL CHECK (link ~* '^https?://.*'),
    year INTEGER NOT NULL CHECK (year > 1900 AND year < 2100),
    category TEXT NOT NULL CHECK (category IN ('Photo', 'Video', 'Design', 'Event', 'Other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 4. Create Tags Table (Many-to-Many Relationship)
CREATE TABLE public.tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 30)
);

-- 5. Create Junction Table for Media Items and Tags
CREATE TABLE public.media_item_tags (
    media_item_id BIGINT REFERENCES public.media_items(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (media_item_id, tag_id)
);

-- 6. Indices for Optimal Search and Query Speeds
CREATE INDEX idx_media_items_year ON public.media_items(year);
CREATE INDEX idx_media_items_category ON public.media_items(category);
CREATE INDEX idx_media_items_created_at ON public.media_items(created_at DESC);
CREATE INDEX idx_tags_name ON public.tags(name);

-- ==========================================
-- ROW-LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable Row-Level Security on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_item_tags ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if current authenticated user is an administrator
-- We query the public.profiles table to check if the current user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- A. Profiles Policies
-- 1) Anyone who is authenticated can read profiles
CREATE POLICY "Allow public read access to authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- 2) Users can update their own profile information (but cannot change their role themselves)
CREATE POLICY "Allow users to update their own profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Role cannot be altered via self-update
);

-- B. Media Items Policies
-- 1) Any authenticated user can read media items
CREATE POLICY "Allow select for all authenticated users" 
ON public.media_items FOR SELECT 
TO authenticated 
USING (true);

-- 2) Only Admins can insert media items
CREATE POLICY "Allow inserts for admins only" 
ON public.media_items FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

-- 3) Only Admins can update media items
CREATE POLICY "Allow updates for admins only" 
ON public.media_items FOR UPDATE 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4) Only Admins can delete media items
CREATE POLICY "Allow deletes for admins only" 
ON public.media_items FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- C. Tags Policies
-- 1) Authenticated users can view tags
CREATE POLICY "Allow read access to tags" 
ON public.tags FOR SELECT 
TO authenticated 
USING (true);

-- 2) Admins can manage tags (Insert/Update/Delete)
CREATE POLICY "Allow full access to tags for admins only" 
ON public.tags FOR ALL 
TO authenticated 
USING (public.is_admin());

-- D. Media Item Tags Junction Policies
-- 1) Authenticated users can read associations
CREATE POLICY "Allow read access to media_item_tags" 
ON public.media_item_tags FOR SELECT 
TO authenticated 
USING (true);

-- 2) Admins can manage associations (Insert/Update/Delete)
CREATE POLICY "Allow full access to media_item_tags for admins only" 
ON public.media_item_tags FOR ALL 
TO authenticated 
USING (public.is_admin());


-- ==========================================
-- AUTOMATIC SIGNUP TRIGGER (profiles sync)
-- ==========================================
-- This database trigger automatically creates a row inside public.profiles 
-- whenever a user signs up using Supabase Auth.
-- It automatically assigns the 'admin' role to the specified master account.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'user';
BEGIN
    -- Configure the default admin user email
    IF NEW.email = 'kangpang06@gmail.com' THEN
        user_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous User'),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- HELPER STORED PROCEDURE FOR BULK TRANSACTION (Optional)
-- ==========================================
-- Creates a media item with its corresponding tags atomically in an elegant Transaction
CREATE OR REPLACE FUNCTION public.add_media_item_with_tags(
    p_title TEXT,
    p_description TEXT,
    p_link TEXT,
    p_year INTEGER,
    p_category TEXT,
    p_tags TEXT[]
) RETURNS VOID AS $$
DECLARE
    v_media_id BIGINT;
    t_name TEXT;
    t_id BIGINT;
BEGIN
    -- Only enable for Admins
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can add media items.';
    END IF;

    -- Insert new media item
    INSERT INTO public.media_items (title, description, link, year, category, created_by)
    VALUES (p_title, p_description, p_link, p_year, p_category, auth.uid())
    RETURNING id INTO v_media_id;

    -- Insert tags & tag junctions loop
    FOREACH t_name IN ARRAY p_tags
    LOOP
        t_name := trim(t_name);
        IF char_length(t_name) > 0 THEN
            -- Find or insert tag
            INSERT INTO public.tags (name)
            VALUES (t_name)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id INTO t_id;

            -- Associate with our media item
            INSERT INTO public.media_item_tags (media_item_id, tag_id)
            VALUES (v_media_id, t_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

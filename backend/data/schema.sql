-- ==============================================================================
-- DEVCONNECT SUPABASE SCHEMA
-- Copy and paste this into the Supabase SQL Editor to create your tables.
-- ==============================================================================

-- 1. Create the Users Table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    profile_image TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    joined_date TEXT,
    github TEXT,
    linkedin TEXT,
    location TEXT
);

-- Disable Row Level Security (RLS) for testing/development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Create the Posts Table
CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- 3. Create the Comments Table
CREATE TABLE public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 4. Create the Likes Table (Tracks unique likes per user per post)
CREATE TABLE public.likes (
    id SERIAL PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;

-- 4b. Create the Follows Table (Tracks who follows whom)
CREATE TABLE public.follows (
    id SERIAL PRIMARY KEY,
    follower_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    following_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;

-- 4c. Create the Bookmarks Table (Tracks bookmarked posts)
CREATE TABLE public.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
);

ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- 5. Insert the Dummy Data (Optional, so you don't start empty)
INSERT INTO public.users (id, username, full_name, bio, skills, profile_image, followers, following, posts_count, joined_date, github, linkedin, location)
VALUES
    ('1', 'sofiac', 'Sofia Chen', 'Building developer tools and exploring distributed systems.', ARRAY['React', 'Node.js', 'PostgreSQL'], 'SC', 148, 64, 12, 'March 2024', 'https://github.com/sofiac', 'https://linkedin.com/in/sofiac', 'San Francisco, CA'),
    ('2', 'noahw', 'Noah Williams', 'Backend focused. Always optimizing queries.', ARRAY['PostgreSQL', 'Redis', 'Python'], 'NW', 210, 45, 8, 'Jan 2023', 'https://github.com/noahw', 'https://linkedin.com/in/noahw', 'London, UK');

INSERT INTO public.posts (id, author, content, likes_count, comments_count)
VALUES
    ('p1', 'Sofia Chen', 'Finally open-sourced our internal migration helper. It wraps Postgres connections and adds dry-run mode by default.', 24, 8),
    ('p2', 'Noah Williams', 'Turns out the issue was unnecessary context updates, not the list virtualization. Documented the steps we used to isolate it.', 41, 12);

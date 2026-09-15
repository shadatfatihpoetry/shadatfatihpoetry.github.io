-- =========================================================================
-- Shadat Fatih Poetry — Supabase SQL Database Schema & RLS Reference
-- Author: শাহাদাৎ ফাতিহ (Shadat Fatih)
-- =========================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. POEMS TABLE
create table if not exists public.poems (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  excerpt text,
  cover_url text,
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  views integer not null default 0
);

-- 3. STORIES TABLE
create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  excerpt text,
  cover_url text,
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  views integer not null default 0
);

-- 4. NOVELS TABLE
create table if not exists public.novels (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  excerpt text,
  cover_url text,
  content text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  views integer not null default 0
);

-- 5. CHAPTERS TABLE
create table if not exists public.chapters (
  id uuid primary key default uuid_generate_v4(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  chapter_number integer not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  published boolean not null default true,
  views integer not null default 0,
  unique(novel_id, chapter_number)
);

-- 6. SITE VIEWS TABLE
create table if not exists public.site_views (
  id integer primary key default 1,
  views bigint not null default 0
);

-- 7. ADMIN PROFILES TABLE & HELPER
create table if not exists public.admin_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin_user(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = $1
    and role in ('admin', 'editor')
  );
end;
$$ language plpgsql security definer;

-- 8. ROW LEVEL SECURITY (RLS)
alter table public.poems enable row level security;
alter table public.stories enable row level security;
alter table public.novels enable row level security;
alter table public.chapters enable row level security;
alter table public.admin_profiles enable row level security;

-- Public READ policies for published content
create policy "Public can view published poems"
  on public.poems for select
  using (published = true);

create policy "Public can view published stories"
  on public.stories for select
  using (published = true);

create policy "Public can view published novels"
  on public.novels for select
  using (published = true);

create policy "Public can view published chapters"
  on public.chapters for select
  using (
    published = true and
    exists (
      select 1 from public.novels
      where novels.id = chapters.novel_id
      and novels.published = true
    )
  );

-- Admin management policies
create policy "Admins can manage poems"
  on public.poems for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

create policy "Admins can manage stories"
  on public.stories for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

create policy "Admins can manage novels"
  on public.novels for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

create policy "Admins can manage chapters"
  on public.chapters for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- 9. SECURE STORED PROCEDURES (RPC) FOR VIEW COUNTING
create or replace function increment_poem_views(poem_id uuid)
returns void as $$
begin
  update public.poems
  set views = coalesce(views, 0) + 1
  where id = poem_id;
end;
$$ language plpgsql security definer;

create or replace function increment_story_views(story_id uuid)
returns void as $$
begin
  update public.stories
  set views = coalesce(views, 0) + 1
  where id = story_id;
end;
$$ language plpgsql security definer;

create or replace function increment_novel_views(novel_id uuid)
returns void as $$
begin
  update public.novels
  set views = coalesce(views, 0) + 1
  where id = novel_id;
end;
$$ language plpgsql security definer;

create or replace function increment_chapter_views(chapter_id uuid)
returns void as $$
begin
  update public.chapters
  set views = coalesce(views, 0) + 1
  where id = chapter_id;
end;
$$ language plpgsql security definer;

import { useState } from 'react';
import { getSupabaseCredentials, saveCustomSupabaseCredentials, clearCustomSupabaseCredentials } from '../../lib/supabase';
import { X, Database, Check, Copy, AlertCircle, RefreshCw, Key } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
}

export function SupabaseSetupModal({ isOpen, onClose, onReload }: SupabaseSetupModalProps) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [key, setKey] = useState(currentCreds.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCustomSupabaseCredentials(url, key);
    setStatusMsg('Supabase সংযোগ তথ্য সংরক্ষিত হয়েছে! রিলোড হচ্ছে...');
    setTimeout(() => {
      onReload();
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    clearCustomSupabaseCredentials();
    setUrl('');
    setKey('');
    setStatusMsg('ডিফল্ট মোডে ফিরে যাওয়া হয়েছে।');
    setTimeout(() => {
      onReload();
    }, 500);
  };

  const sqlCode = `-- Shadat Fatih Poetry — Supabase SQL Database Schema Reference
-- Author: শাহাদাৎ ফাতিহ
create extension if not exists "uuid-ossp";

-- 1. POEMS TABLE
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

-- 2. STORIES TABLE
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

-- 3. NOVELS TABLE
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

-- 4. CHAPTERS TABLE
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

-- 5. SITE VIEWS
create table if not exists public.site_views (
  id integer primary key default 1,
  views bigint not null default 0
);

-- 6. ADMIN PROFILES & RPC
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

-- 7. ROW LEVEL SECURITY (RLS)
alter table public.poems enable row level security;
alter table public.stories enable row level security;
alter table public.novels enable row level security;
alter table public.chapters enable row level security;
alter table public.admin_profiles enable row level security;

-- Public READ policies (only published content)
create policy "Public can view published poems" on public.poems for select using (published = true);
create policy "Public can view published stories" on public.stories for select using (published = true);
create policy "Public can view published novels" on public.novels for select using (published = true);
create policy "Public can view published chapters" on public.chapters for select using (
  published = true and exists (
    select 1 from public.novels where novels.id = chapters.novel_id and novels.published = true
  )
);

-- Admin full management policies
create policy "Admins manage poems" on public.poems for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));
create policy "Admins manage stories" on public.stories for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));
create policy "Admins manage novels" on public.novels for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));
create policy "Admins manage chapters" on public.chapters for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

-- RPC View Counters
create or replace function increment_poem_views(poem_id uuid)
returns void as $$
begin
  update public.poems set views = coalesce(views, 0) + 1 where id = poem_id;
end;
$$ language plpgsql security definer;

create or replace function increment_story_views(story_id uuid)
returns void as $$
begin
  update public.stories set views = coalesce(views, 0) + 1 where id = story_id;
end;
$$ language plpgsql security definer;

create or replace function increment_novel_views(novel_id uuid)
returns void as $$
begin
  update public.novels set views = coalesce(views, 0) + 1 where id = novel_id;
end;
$$ language plpgsql security definer;

create or replace function increment_chapter_views(chapter_id uuid)
returns void as $$
begin
  update public.chapters set views = coalesce(views, 0) + 1 where id = chapter_id;
end;
$$ language plpgsql security definer;
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#181615] rounded-2xl border border-[#E8E1D7] dark:border-[#2C2724] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE8] dark:border-[#25211F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#8C271E]" />
            <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
              Supabase ডাটাবেস ও স্টোরেজ কনফিগারেশন
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F2ECE4] dark:hover:bg-[#2A2522] text-[#8A8178]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 grow text-xs sm:text-sm">
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300">
              {statusMsg}
            </div>
          )}

          {/* Connection form */}
          <div className="space-y-4 bg-[#FAF7F2] dark:bg-[#1F1C1A] p-4 rounded-xl border border-[#EDE7DE] dark:border-[#2A2522]">
            <h4 className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#FAF7F2] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#8C271E]" />
              আপনার Supabase প্রজেক্ট ক্রেডেনশিয়াল
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#DED7CD] dark:border-[#38312C] bg-white dark:bg-[#151312]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
                  Anon / Public API Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#DED7CD] dark:border-[#38312C] bg-white dark:bg-[#151312]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#8C271E] hover:bg-[#A32E24] text-white font-medium transition-colors"
                >
                  সংরক্ষণ ও সংযোগ করুন
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#EFE9DF] text-[#544D46] dark:text-[#C7C0B7] transition-colors"
                >
                  ক্লিয়ার করুন
                </button>
              </div>
            </div>
          </div>

          {/* SQL Setup Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#FAF7F2]">
                Supabase SQL Editor স্ক্রিপ্ট (এক ক্লিকে কপি করুন)
              </h4>
              <button
                type="button"
                onClick={copySql}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8C271E]/10 text-[#8C271E] dark:text-[#FFB4AB] hover:bg-[#8C271E]/20 font-medium transition-colors text-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'কপি সম্পন্ন!' : 'SQL কোড কপি করুন'}</span>
              </button>
            </div>
            <p className="text-xs text-[#7A7167] dark:text-[#A8A096]">
              আপনার Supabase Dashboard-এর <strong>SQL Editor</strong>-এ গিয়ে নিচের স্ক্রিপ্টটি পেস্ট করে <strong>Run</strong> বাটনে চাপ দিন। এতে সমস্ত টেবিল, RLS পলিসি, RPC ফাংশন ও Storage বাকেট স্বয়ংক্রিয়ভাবে তৈরি হবে।
            </p>
            <pre className="p-4 bg-[#141211] text-[#A6E22E] rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-56">
              {sqlCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

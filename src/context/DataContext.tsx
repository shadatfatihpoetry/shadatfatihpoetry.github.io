import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Poem, Story, Novel, Chapter } from '../types';
import { INITIAL_POEMS, INITIAL_STORIES, INITIAL_NOVELS, INITIAL_CHAPTERS } from '../data/initialData';
import { getSupabase, getSupabaseCredentials } from '../lib/supabase';

// Helper to generate RFC4122 compliant UUID v4
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DataContextType {
  poems: Poem[];
  stories: Story[];
  novels: Novel[];
  chapters: Chapter[];
  siteViews: number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Poems
  getPoem: (id: string) => Poem | undefined;
  createPoem: (poem: Omit<Poem, 'id' | 'views' | 'created_at'> & { created_at?: string }) => Promise<{ success: boolean; error?: string }>;
  updatePoem: (id: string, updates: Partial<Poem>) => Promise<{ success: boolean; error?: string }>;
  deletePoem: (id: string) => Promise<{ success: boolean; error?: string }>;
  incrementPoemViews: (id: string) => void;

  // Stories
  getStory: (id: string) => Story | undefined;
  createStory: (story: Omit<Story, 'id' | 'views' | 'created_at'> & { created_at?: string }) => Promise<{ success: boolean; error?: string }>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<{ success: boolean; error?: string }>;
  deleteStory: (id: string) => Promise<{ success: boolean; error?: string }>;
  incrementStoryViews: (id: string) => void;

  // Novels
  getNovel: (id: string) => Novel | undefined;
  createNovel: (novel: Omit<Novel, 'id' | 'views' | 'created_at'> & { created_at?: string }) => Promise<{ success: boolean; error?: string }>;
  updateNovel: (id: string, updates: Partial<Novel>) => Promise<{ success: boolean; error?: string }>;
  deleteNovel: (id: string) => Promise<{ success: boolean; error?: string }>;
  incrementNovelViews: (id: string) => void;

  // Chapters
  getChaptersForNovel: (novelId: string) => Chapter[];
  getChapter: (novelId: string, chapterNumber: number) => { chapter?: Chapter; novel?: Novel; prev?: Chapter; next?: Chapter };
  createChapter: (chapter: Omit<Chapter, 'id' | 'views' | 'created_at'> & { created_at?: string }) => Promise<{ success: boolean; error?: string }>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<{ success: boolean; error?: string }>;
  deleteChapter: (id: string) => Promise<{ success: boolean; error?: string }>;
  incrementChapterViews: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// LocalStorage Keys for persistent client-side data
const STORAGE_POEMS = 'shadat_data_poems_v2';
const STORAGE_STORIES = 'shadat_data_stories_v2';
const STORAGE_NOVELS = 'shadat_data_novels_v2';
const STORAGE_CHAPTERS = 'shadat_data_chapters_v2';
const STORAGE_SITE_VIEWS = 'shadat_site_views_v2';

// Session storage for view deduplication
const VIEWED_ITEMS_KEY = 'shadat_viewed_items_session';

export function DataProvider({ children }: { children: ReactNode }) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [siteViews, setSiteViews] = useState<number>(10500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe view deduplication helper
  const hasAlreadyViewed = (itemId: string): boolean => {
    try {
      const viewed = JSON.parse(sessionStorage.getItem(VIEWED_ITEMS_KEY) || '[]');
      return viewed.includes(itemId);
    } catch {
      return false;
    }
  };

  const markAsViewed = (itemId: string) => {
    try {
      const viewed = JSON.parse(sessionStorage.getItem(VIEWED_ITEMS_KEY) || '[]');
      if (!viewed.includes(itemId)) {
        viewed.push(itemId);
        sessionStorage.setItem(VIEWED_ITEMS_KEY, JSON.stringify(viewed));
      }
    } catch {
      // ignore
    }
  };

  const loadLocalStore = useCallback(() => {
    try {
      const storedPoems = localStorage.getItem(STORAGE_POEMS);
      const storedStories = localStorage.getItem(STORAGE_STORIES);
      const storedNovels = localStorage.getItem(STORAGE_NOVELS);
      const storedChapters = localStorage.getItem(STORAGE_CHAPTERS);
      const storedSiteViews = localStorage.getItem(STORAGE_SITE_VIEWS);

      const p: Poem[] = storedPoems ? JSON.parse(storedPoems) : INITIAL_POEMS;
      const s: Story[] = storedStories ? JSON.parse(storedStories) : INITIAL_STORIES;
      const n: Novel[] = storedNovels ? JSON.parse(storedNovels) : INITIAL_NOVELS;
      const c: Chapter[] = storedChapters ? JSON.parse(storedChapters) : INITIAL_CHAPTERS;
      const v: number = storedSiteViews ? Number(storedSiteViews) : 12450;

      setPoems(p);
      setStories(s);
      setNovels(n);
      setChapters(c);
      setSiteViews(v);

      if (!storedPoems) localStorage.setItem(STORAGE_POEMS, JSON.stringify(INITIAL_POEMS));
      if (!storedStories) localStorage.setItem(STORAGE_STORIES, JSON.stringify(INITIAL_STORIES));
      if (!storedNovels) localStorage.setItem(STORAGE_NOVELS, JSON.stringify(INITIAL_NOVELS));
      if (!storedChapters) localStorage.setItem(STORAGE_CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
      if (!storedSiteViews) localStorage.setItem(STORAGE_SITE_VIEWS, String(v));
    } catch {
      setPoems(INITIAL_POEMS);
      setStories(INITIAL_STORIES);
      setNovels(INITIAL_NOVELS);
      setChapters(INITIAL_CHAPTERS);
      setSiteViews(12450);
    }
  }, []);

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { isLive } = getSupabaseCredentials();
    const supabase = getSupabase();

    if (supabase && isLive) {
      try {
        const [poemsRes, storiesRes, novelsRes, chaptersRes, viewsRes] = await Promise.all([
          supabase.from('poems').select('*').order('created_at', { ascending: false }),
          supabase.from('stories').select('*').order('created_at', { ascending: false }),
          supabase.from('novels').select('*').order('created_at', { ascending: false }),
          supabase.from('chapters').select('*').order('chapter_number', { ascending: true }),
          supabase.from('site_views').select('*').eq('id', 1).maybeSingle(),
        ]);

        if (poemsRes.error) console.error('Poems error:', poemsRes.error);
        if (storiesRes.error) console.error('Stories error:', storiesRes.error);
        if (novelsRes.error) console.error('Novels error:', novelsRes.error);
        if (chaptersRes.error) console.error('Chapters error:', chaptersRes.error);

        if (poemsRes.data) setPoems(poemsRes.data);
        if (storiesRes.data) setStories(storiesRes.data);
        if (novelsRes.data) setNovels(novelsRes.data);
        if (chaptersRes.data) setChapters(chaptersRes.data);
        if (viewsRes?.data?.views) {
          setSiteViews(Number(viewsRes.data.views));
        }
      } catch (err: unknown) {
        console.warn('Supabase fetch failed, falling back to local persistent store:', err);
        loadLocalStore();
      }
    } else {
      loadLocalStore();
    }
    setLoading(false);
  }, [loadLocalStore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync state to local storage when in local/fallback mode
  const syncLocal = (
    newPoems?: Poem[],
    newStories?: Story[],
    newNovels?: Novel[],
    newChapters?: Chapter[]
  ) => {
    if (newPoems) {
      setPoems(newPoems);
      localStorage.setItem(STORAGE_POEMS, JSON.stringify(newPoems));
    }
    if (newStories) {
      setStories(newStories);
      localStorage.setItem(STORAGE_STORIES, JSON.stringify(newStories));
    }
    if (newNovels) {
      setNovels(newNovels);
      localStorage.setItem(STORAGE_NOVELS, JSON.stringify(newNovels));
    }
    if (newChapters) {
      setChapters(newChapters);
      localStorage.setItem(STORAGE_CHAPTERS, JSON.stringify(newChapters));
    }
  };

  // --- Poems Operations ---
  const getPoem = useCallback((id: string) => poems.find((p) => p.id === id), [poems]);

  const createPoem = async (poemData: Omit<Poem, 'id' | 'views' | 'created_at'> & { created_at?: string }) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const record = {
      title: poemData.title,
      excerpt: poemData.excerpt || null,
      cover_url: poemData.cover_url || null,
      content: poemData.content,
      published: Boolean(poemData.published),
      views: 0,
      created_at: poemData.created_at || new Date().toISOString(),
    };

    if (supabase && isLive) {
      const { data, error: err } = await supabase
        .from('poems')
        .insert([record])
        .select()
        .single();
      if (err) return { success: false, error: err.message };
      setPoems((prev) => [data, ...prev]);
      return { success: true };
    }

    const newPoem: Poem = {
      id: generateUUID(),
      ...record,
    };
    const updated = [newPoem, ...poems];
    syncLocal(updated);
    return { success: true };
  };

  const updatePoem = async (id: string, updates: Partial<Poem>) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    // Payload aligned strictly with schema
    const payload: Partial<Poem> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.cover_url !== undefined) payload.cover_url = updates.cover_url;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.published !== undefined) payload.published = Boolean(updates.published);
    if (updates.created_at !== undefined) payload.created_at = updates.created_at;

    if (supabase && isLive) {
      const { error: err } = await supabase.from('poems').update(payload).eq('id', id);
      if (err) return { success: false, error: err.message };
      setPoems((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } : p)));
      return { success: true };
    }

    const updated = poems.map((p) => (p.id === id ? { ...p, ...payload } : p));
    syncLocal(updated);
    return { success: true };
  };

  const deletePoem = async (id: string) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      const { error: err } = await supabase.from('poems').delete().eq('id', id);
      if (err) return { success: false, error: err.message };
      setPoems((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    }

    const updated = poems.filter((p) => p.id !== id);
    syncLocal(updated);
    return { success: true };
  };

  const incrementPoemViews = (id: string) => {
    if (hasAlreadyViewed(id)) return;
    markAsViewed(id);

    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      supabase.rpc('increment_poem_views', { poem_id: id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          console.warn('RPC increment_poem_views error:', rpcErr);
        }
      });
    }

    setPoems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
    );

    setTimeout(() => {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_POEMS) || '[]') as Poem[];
        const mod = current.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p));
        localStorage.setItem(STORAGE_POEMS, JSON.stringify(mod));
      } catch {
        // ignore
      }
    }, 50);
  };

  // --- Stories Operations ---
  const getStory = useCallback((id: string) => stories.find((s) => s.id === id), [stories]);

  const createStory = async (storyData: Omit<Story, 'id' | 'views' | 'created_at'> & { created_at?: string }) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const record = {
      title: storyData.title,
      excerpt: storyData.excerpt || null,
      cover_url: storyData.cover_url || null,
      content: storyData.content,
      published: Boolean(storyData.published),
      views: 0,
      created_at: storyData.created_at || new Date().toISOString(),
    };

    if (supabase && isLive) {
      const { data, error: err } = await supabase
        .from('stories')
        .insert([record])
        .select()
        .single();
      if (err) return { success: false, error: err.message };
      setStories((prev) => [data, ...prev]);
      return { success: true };
    }

    const newStory: Story = {
      id: generateUUID(),
      ...record,
    };
    const updated = [newStory, ...stories];
    syncLocal(undefined, updated);
    return { success: true };
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const payload: Partial<Story> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.cover_url !== undefined) payload.cover_url = updates.cover_url;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.published !== undefined) payload.published = Boolean(updates.published);
    if (updates.created_at !== undefined) payload.created_at = updates.created_at;

    if (supabase && isLive) {
      const { error: err } = await supabase.from('stories').update(payload).eq('id', id);
      if (err) return { success: false, error: err.message };
      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, ...payload } : s)));
      return { success: true };
    }

    const updated = stories.map((s) => (s.id === id ? { ...s, ...payload } : s));
    syncLocal(undefined, updated);
    return { success: true };
  };

  const deleteStory = async (id: string) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      const { error: err } = await supabase.from('stories').delete().eq('id', id);
      if (err) return { success: false, error: err.message };
      setStories((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    }

    const updated = stories.filter((s) => s.id !== id);
    syncLocal(undefined, updated);
    return { success: true };
  };

  const incrementStoryViews = (id: string) => {
    if (hasAlreadyViewed(id)) return;
    markAsViewed(id);

    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      supabase.rpc('increment_story_views', { story_id: id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          console.warn('RPC increment_story_views error:', rpcErr);
        }
      });
    }

    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, views: (s.views || 0) + 1 } : s))
    );

    setTimeout(() => {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_STORIES) || '[]') as Story[];
        const mod = current.map((s) => (s.id === id ? { ...s, views: (s.views || 0) + 1 } : s));
        localStorage.setItem(STORAGE_STORIES, JSON.stringify(mod));
      } catch {
        // ignore
      }
    }, 50);
  };

  // --- Novels Operations ---
  const getNovel = useCallback((id: string) => novels.find((n) => n.id === id), [novels]);

  const createNovel = async (novelData: Omit<Novel, 'id' | 'views' | 'created_at'> & { created_at?: string }) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const record = {
      title: novelData.title,
      excerpt: novelData.excerpt || null,
      cover_url: novelData.cover_url || null,
      content: novelData.content || null,
      published: Boolean(novelData.published),
      views: 0,
      created_at: novelData.created_at || new Date().toISOString(),
    };

    if (supabase && isLive) {
      const { data, error: err } = await supabase
        .from('novels')
        .insert([record])
        .select()
        .single();
      if (err) return { success: false, error: err.message };
      setNovels((prev) => [data, ...prev]);
      return { success: true };
    }

    const newNovel: Novel = {
      id: generateUUID(),
      ...record,
    };
    const updated = [newNovel, ...novels];
    syncLocal(undefined, undefined, updated);
    return { success: true };
  };

  const updateNovel = async (id: string, updates: Partial<Novel>) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const payload: Partial<Novel> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.cover_url !== undefined) payload.cover_url = updates.cover_url;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.published !== undefined) payload.published = Boolean(updates.published);
    if (updates.created_at !== undefined) payload.created_at = updates.created_at;

    if (supabase && isLive) {
      const { error: err } = await supabase.from('novels').update(payload).eq('id', id);
      if (err) return { success: false, error: err.message };
      setNovels((prev) => prev.map((n) => (n.id === id ? { ...n, ...payload } : n)));
      return { success: true };
    }

    const updated = novels.map((n) => (n.id === id ? { ...n, ...payload } : n));
    syncLocal(undefined, undefined, updated);
    return { success: true };
  };

  const deleteNovel = async (id: string) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      const { error: err } = await supabase.from('novels').delete().eq('id', id);
      if (err) return { success: false, error: err.message };
      setNovels((prev) => prev.filter((n) => n.id !== id));
      setChapters((prev) => prev.filter((c) => c.novel_id !== id));
      return { success: true };
    }

    const updatedNovels = novels.filter((n) => n.id !== id);
    const updatedChapters = chapters.filter((c) => c.novel_id !== id);
    syncLocal(undefined, undefined, updatedNovels, updatedChapters);
    return { success: true };
  };

  const incrementNovelViews = (id: string) => {
    if (hasAlreadyViewed(id)) return;
    markAsViewed(id);

    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      supabase.rpc('increment_novel_views', { novel_id: id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          console.warn('RPC increment_novel_views error:', rpcErr);
        }
      });
    }

    setNovels((prev) =>
      prev.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n))
    );

    setTimeout(() => {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_NOVELS) || '[]') as Novel[];
        const mod = current.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
        localStorage.setItem(STORAGE_NOVELS, JSON.stringify(mod));
      } catch {
        // ignore
      }
    }, 50);
  };

  // --- Chapters Operations ---
  const getChaptersForNovel = useCallback(
    (novelId: string) => {
      return chapters
        .filter((c) => String(c.novel_id) === String(novelId))
        .sort((a, b) => a.chapter_number - b.chapter_number);
    },
    [chapters]
  );

  const getChapter = useCallback(
    (novelId: string, chapterNumber: number) => {
      const novel = novels.find((n) => n.id === novelId);
      const novelChapters = getChaptersForNovel(novelId);
      const currentChapter = novelChapters.find((c) => c.chapter_number === chapterNumber);
      if (!currentChapter) return { novel };

      const currentIndex = novelChapters.findIndex((c) => c.id === currentChapter.id);
      const prev = currentIndex > 0 ? novelChapters[currentIndex - 1] : undefined;
      const next = currentIndex < novelChapters.length - 1 ? novelChapters[currentIndex + 1] : undefined;

      return { chapter: currentChapter, novel, prev, next };
    },
    [novels, getChaptersForNovel]
  );

  const createChapter = async (chapterData: Omit<Chapter, 'id' | 'views' | 'created_at'> & { created_at?: string }) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const record = {
      novel_id: chapterData.novel_id,
      chapter_number: Number(chapterData.chapter_number),
      title: chapterData.title,
      content: chapterData.content,
      published: Boolean(chapterData.published),
      views: 0,
      created_at: chapterData.created_at || new Date().toISOString(),
    };

    if (supabase && isLive) {
      const { data, error: err } = await supabase
        .from('chapters')
        .insert([record])
        .select()
        .single();
      if (err) return { success: false, error: err.message };
      setChapters((prev) => [...prev, data]);
      return { success: true };
    }

    const newChapter: Chapter = {
      id: generateUUID(),
      ...record,
    };
    const updated = [...chapters, newChapter];
    syncLocal(undefined, undefined, undefined, updated);
    return { success: true };
  };

  const updateChapter = async (id: string, updates: Partial<Chapter>) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    const payload: Partial<Chapter> = {};
    if (updates.novel_id !== undefined) payload.novel_id = updates.novel_id;
    if (updates.chapter_number !== undefined) payload.chapter_number = Number(updates.chapter_number);
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.published !== undefined) payload.published = Boolean(updates.published);
    if (updates.created_at !== undefined) payload.created_at = updates.created_at;

    if (supabase && isLive) {
      const { error: err } = await supabase.from('chapters').update(payload).eq('id', id);
      if (err) return { success: false, error: err.message };
      setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...payload } : c)));
      return { success: true };
    }

    const updated = chapters.map((c) => (c.id === id ? { ...c, ...payload } : c));
    syncLocal(undefined, undefined, undefined, updated);
    return { success: true };
  };

  const deleteChapter = async (id: string) => {
    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      const { error: err } = await supabase.from('chapters').delete().eq('id', id);
      if (err) return { success: false, error: err.message };
      setChapters((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    }

    const updated = chapters.filter((c) => c.id !== id);
    syncLocal(undefined, undefined, undefined, updated);
    return { success: true };
  };

  const incrementChapterViews = (id: string) => {
    if (hasAlreadyViewed(id)) return;
    markAsViewed(id);

    const supabase = getSupabase();
    const { isLive } = getSupabaseCredentials();

    if (supabase && isLive) {
      supabase.rpc('increment_chapter_views', { chapter_id: id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          console.warn('RPC increment_chapter_views error:', rpcErr);
        }
      });
    }

    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c))
    );

    setTimeout(() => {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_CHAPTERS) || '[]') as Chapter[];
        const mod = current.map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c));
        localStorage.setItem(STORAGE_CHAPTERS, JSON.stringify(mod));
      } catch {
        // ignore
      }
    }, 50);
  };

  return (
    <DataContext.Provider
      value={{
        poems,
        stories,
        novels,
        chapters,
        siteViews,
        loading,
        error,
        refreshData: fetchData,
        getPoem,
        createPoem,
        updatePoem,
        deletePoem,
        incrementPoemViews,
        getStory,
        createStory,
        updateStory,
        deleteStory,
        incrementStoryViews,
        getNovel,
        createNovel,
        updateNovel,
        deleteNovel,
        incrementNovelViews,
        getChaptersForNovel,
        getChapter,
        createChapter,
        updateChapter,
        deleteChapter,
        incrementChapterViews,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

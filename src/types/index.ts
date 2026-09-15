export interface Poem {
  id: string; // uuid
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  content: string;
  published: boolean;
  created_at: string;
  blogger_published_at?: string | null;
  blogger_url?: string | null;
  views: number;
}

export interface Story {
  id: string; // uuid
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  content: string;
  published: boolean;
  created_at: string;
  views: number;
}

export interface Novel {
  id: string; // uuid
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  content: string | null;
  published: boolean;
  created_at: string;
  views: number;
}

export interface Chapter {
  id: string; // uuid
  novel_id: string; // uuid
  chapter_number: number;
  title: string;
  content: string;
  created_at: string;
  published: boolean;
  views: number;
}

export interface SiteViews {
  id: number;
  views: number;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'editor';
  created_at: string;
}

export interface ReadingSettings {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  readingWidth: 'narrow' | 'medium' | 'wide';
}

export type ActivePage = 
  | { type: 'home' }
  | { type: 'poems' }
  | { type: 'archive' }
  | { type: 'poem-detail'; id: string }
  | { type: 'stories' }
  | { type: 'story-detail'; id: string }
  | { type: 'novels' }
  | { type: 'novel-detail'; id: string }
  | { type: 'chapter-detail'; novelId: string; chapterNumber: number }
  | { type: 'author' }
  | { type: 'about' }
  | { type: 'admin' }
  | { type: 'admin-login' };

